import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
let server;
const url = "http://127.0.0.1:3099";
before(async () => {
  server = spawn(process.execPath, ["server/index.js"], {
    env: { ...process.env, PORT: "3099", GEMINI_API_KEY: "", NODE_ENV: "test" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Test API did not start")),
      10000,
    );
    server.once("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    server.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`API exited: ${code}`));
    });
    server.stdout.on("data", (data) => {
      if (data.toString().includes("listening")) {
        clearTimeout(timer);
        resolve();
      }
    });
  });
});
after(async () => {
  if (server && server.exitCode === null)
    await new Promise((resolve) => {
      server.once("exit", resolve);
      server.kill("SIGTERM");
    });
});
async function post(path, body) {
  return fetch(url + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
test("health reports AI configuration without exposing a key", async () => {
  const r = await fetch(url + "/api/health");
  assert.deepEqual(await r.json(), { geminiConfigured: false });
  assert.equal(r.headers.get("cache-control"), "no-store");
});
test("analysis route rejects invalid inputs", async () => {
  const r = await post("/api/analyze", {
    image: "invalid",
    mimeType: "text/html",
  });
  assert.equal(r.status, 400);
  assert.match((await r.json()).error, /invalid or missing/);
});
test("analysis without a configured key fails honestly instead of inventing a result", async () => {
  const r = await post("/api/analyze", {
    image: "aGVsbG8gdGVzdCBpbWFnZQ==",
    mimeType: "image/jpeg",
  });
  assert.equal(r.status, 503);
  assert.match((await r.json()).error, /Gemini is not configured/);
});
test("complaint accepts only live weather, never a non-live source", async () => {
  const r = await post("/api/complaint", {
    analysis: {
      problem_type: "blocked_drain",
      severity: 4,
      visible_evidence: "Waste",
      confidence: 0.8,
      affects: ["pedestrians"],
    },
    location: { lat: 23.81, lng: 90.41, label: "Dhaka" },
    weather: {
      total: 25,
      peak: 8,
      peakTime: Math.floor(Date.now() / 1000),
      probability: 60,
      source: "demo",
      fetchedAt: new Date().toISOString(),
    },
    authority: "Dhaka North City Corporation",
  });
  assert.equal(r.status, 400);
});
test("malformed JSON produces a friendly error", async () => {
  const r = await fetch(url + "/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{bad json",
  });
  assert.equal(r.status, 400);
  assert.match((await r.json()).error, /could not be read/);
});

test("native Android preflight is allowed without wildcard CORS", async () => {
  const r = await fetch(url + "/api/analyze", {
    method: "OPTIONS",
    headers: {
      Origin: "https://localhost",
      "Access-Control-Request-Method": "POST",
    },
  });
  assert.equal(r.status, 204);
  assert.equal(
    r.headers.get("access-control-allow-origin"),
    "https://localhost",
  );
});
test("untrusted cross-origin requests are rejected", async () => {
  const r = await fetch(url + "/api/health", {
    headers: { Origin: "https://untrusted.example" },
  });
  assert.equal(r.status, 403);
  assert.equal(r.headers.get("access-control-allow-origin"), null);
});
