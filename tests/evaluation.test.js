import test from "node:test";
import assert from "node:assert/strict";
import { summarizeEvaluation } from "../shared/evaluation.js";
import {
  VISION_PROMPT,
  VISION_PROMPT_VERSION,
  responseSchema,
} from "../server/gemini.js";
test("no model runs means unknown accuracy, not a fabricated 100%", () => {
  const r = summarizeEvaluation([]);
  assert.equal(r.accuracy, null);
  assert.equal(r.attempted, 0);
  assert.equal(r.perClass.garbage_in_drain.recall, null);
});
test("evaluation counts failures, reports confusion and missing classes", () => {
  const r = summarizeEvaluation([
    { expected: "none", predicted: "none" },
    { expected: "blocked_drain", predicted: "flooded_road" },
    { expected: "flooded_road", predicted: "ERROR" },
  ]);
  assert.equal(r.accuracy, 1 / 3);
  assert.equal(r.errors, 1);
  assert.equal(r.confusion.blocked_drain.flooded_road, 1);
  assert.equal(r.perClass.none.recall, 1);
  assert.equal(r.perClass.blocked_canal.recall, null);
});
test("API and evaluation share the same versioned visual-only prompt and schema", () => {
  assert.ok(VISION_PROMPT_VERSION);
  assert.match(
    VISION_PROMPT,
    /Do not infer a blocked drain from road flooding alone/,
  );
  assert.match(VISION_PROMPT, /Ignore titles/);
  assert.equal(responseSchema.properties.visible_evidence.type, "STRING");
});
