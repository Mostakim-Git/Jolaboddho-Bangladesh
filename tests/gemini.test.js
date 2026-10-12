import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { gemini, GEMINI_DEFAULT_MODEL } from "../server/gemini.js";

// These tests stub global fetch, so the process must never reach Google. The
// API-level tests live in tests/api.test.js and start a real server process.
const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };

function okResponse(text) {
  return new Response(
    JSON.stringify({
      candidates: [{ content: { parts: [{ text }] }, finishReason: "STOP" }],
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

beforeEach(() => {
  process.env.GEMINI_API_KEY = "test-key";
  delete process.env.GEMINI_MODEL;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env = { ...originalEnv };
});

test("uses the current stable Flash model by default and never puts the key in the URL", async () => {
  let seen;
  globalThis.fetch = async (url, options) => {
    seen = { url, options };
    return okResponse("[]");
  };
  const text = await gemini([{ text: "hello" }], true);
  assert.equal(text, "[]");
  assert.match(seen.url, new RegExp(`${GEMINI_DEFAULT_MODEL}:generateContent$`));
  assert.equal(GEMINI_DEFAULT_MODEL, "gemini-3.8-flash");
  // The retired model must not be reachable through the default path.
  assert.doesNotMatch(seen.url, /gemini-2\.5-flash/);
  assert.doesNotMatch(seen.url, /test-key/);
  assert.equal(seen.options.headers["x-goog-api-key"], "test-key");
  const body = JSON.parse(seen.options.body);
  assert.equal(body.generationConfig.responseMimeType, "application/json");
  assert.equal(body.generationConfig.temperature, 0);
});

test("honours GEMINI_MODEL when an operator pins a different model", async () => {
  process.env.GEMINI_MODEL = "gemini-3.5-flash-lite";
  let seenUrl;
  globalThis.fetch = async (url) => {
    seenUrl = url;
    return okResponse("ok");
  };
  await gemini([{ text: "hello" }]);
  assert.match(seenUrl, /gemini-3\.5-flash-lite:generateContent$/);
});

test("excludes internal thinking parts from the returned text", async () => {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                { text: "secret reasoning", thought: true },
                { text: "letter body" },
              ],
            },
            finishReason: "STOP",
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  assert.equal(await gemini([{ text: "hello" }]), "letter body");
});

test("retries a transient 503 and succeeds without exposing the provider body", async () => {
  let attempts = 0;
  globalThis.fetch = async () => {
    attempts++;
    if (attempts === 1)
      return new Response("model overloaded: internal detail", { status: 503 });
    return okResponse("drafted");
  };
  // The first retry waits about 1.5 s; the assertion is about behaviour, not timing.
  assert.equal(await gemini([{ text: "hello" }]), "drafted");
  assert.equal(attempts, 2);
});

test("does not retry a permanent client error", async () => {
  let attempts = 0;
  globalThis.fetch = async () => {
    attempts++;
    return new Response("API key not valid", { status: 400 });
  };
  await assert.rejects(gemini([{ text: "hello" }]), (error) => {
    assert.match(error.message, /Check the server API key, quota/);
    // A raw provider message or key must never reach the citizen-facing error.
    assert.doesNotMatch(error.message, /API key not valid/);
    return true;
  });
  assert.equal(attempts, 1);
});

test("reports an incomplete model response instead of returning partial text", async () => {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        candidates: [{ content: { parts: [] }, finishReason: "MAX_TOKENS" }],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  await assert.rejects(gemini([{ text: "hello" }]), /could not provide a complete response/);
});

test("refuses to call the provider without a configured key", async () => {
  delete process.env.GEMINI_API_KEY;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return okResponse("should not happen");
  };
  await assert.rejects(gemini([{ text: "hello" }]), (error) => {
    assert.equal(error.status, 503);
    assert.match(error.message, /Gemini is not configured yet/);
    return true;
  });
  assert.equal(called, false);
});
