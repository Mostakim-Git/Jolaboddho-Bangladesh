import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { z } from "zod";
import {
  gemini,
  VISION_PROMPT,
  VISION_PROMPT_VERSION,
} from "../server/gemini.js";
import { parseAnalysis, analysisSchema } from "../shared/schema.js";
import { summarizeEvaluation } from "../shared/evaluation.js";
const args = process.argv.slice(2);
const value = (flag, fallback) =>
  args.includes(flag) ? args[args.indexOf(flag) + 1] : fallback;
const split = value("--split", "holdout"),
  manifest = value("--manifest", "evaluation/manifest.json");
const checkOnly = args.includes("--check-only"),
  provisional = args.includes("--provisional");
if (!["development", "holdout", "all"].includes(split))
  throw new Error("Split must be development, holdout, or all.");
const manifestSchema = z.array(
  z.object({
    id: z.string().min(1),
    file: z.string().min(1),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    expectedProblemType: analysisSchema.shape.problem_type,
    split: z.enum(["development", "holdout"]),
    group: z.string().min(1),
    rightsCleared: z.boolean(),
    humanApproved: z.boolean(),
    sourceUrl: z.string().url(),
  }),
);
const allEntries = manifestSchema.parse(
  JSON.parse(await readFile(manifest, "utf8")),
);
if (new Set(allEntries.map((r) => r.id)).size !== allEntries.length)
  throw new Error("Duplicate sample IDs.");
for (const field of ["group", "sha256"]) {
  const splits = new Map();
  for (const row of allEntries) {
    if (splits.has(row[field]) && splits.get(row[field]) !== row.split)
      throw new Error(
        `Split leakage: ${field} shared by development and holdout.`,
      );
    splits.set(row[field], row.split);
  }
}
const entries = allEntries.filter((r) => split === "all" || r.split === split);
if (!entries.length) throw new Error("No samples selected.");
const prepared = [],
  checks = [];
for (const row of entries) {
  try {
    const bytes = await readFile(row.file);
    const hash = createHash("sha256").update(bytes).digest("hex");
    if (hash !== row.sha256)
      throw new Error("Image SHA-256 does not match manifest.");
    const image = await sharp(bytes)
      .rotate()
      .resize({
        width: 1024,
        height: 1024,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();
    const metadata = await sharp(image).metadata();
    checks.push({
      id: row.id,
      imageValid: true,
      width: metadata.width,
      height: metadata.height,
      humanApproved: row.humanApproved,
      rightsCleared: row.rightsCleared,
    });
    prepared.push({ row, image });
  } catch (e) {
    checks.push({ id: row.id, imageValid: false, error: e.message });
  }
}
if (checkOnly) {
  console.log(
    JSON.stringify(
      { mode: "file-check-only", modelCalls: 0, accuracy: null, checks },
      null,
      2,
    ),
  );
  if (checks.some((r) => !r.imageValid)) process.exitCode = 1;
} else {
  if (checks.some((r) => !r.imageValid))
    throw new Error(
      "Fix invalid/missing images before evaluation; no model calls made.",
    );
  if (prepared.some(({ row }) => !row.rightsCleared))
    throw new Error(
      "Image use/transmission rights are not cleared. Use your own or properly licensed photographs and update the manifest. No model calls made.",
    );
  if (!provisional && prepared.some(({ row }) => !row.humanApproved))
    throw new Error(
      "A human must approve labels before validation. --provisional permits exploratory labels, never an acceptance claim.",
    );
  if (!process.env.GEMINI_API_KEY)
    throw new Error(
      "Set a fresh private GEMINI_API_KEY in your server environment. Do not use the key exposed in chat.",
    );
  const startedAt = new Date().toISOString(),
    results = [];
  for (const { row, image } of prepared) {
    const start = Date.now();
    try {
      const text = await gemini(
        [
          { text: VISION_PROMPT },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: image.toString("base64"),
            },
          },
        ],
        true,
      );
      const result = parseAnalysis(text);
      results.push({
        id: row.id,
        expected: row.expectedProblemType,
        predicted: result.problem_type,
        result,
        elapsedMs: Date.now() - start,
      });
    } catch (e) {
      results.push({
        id: row.id,
        expected: row.expectedProblemType,
        predicted: "ERROR",
        error: e.message,
        elapsedMs: Date.now() - start,
      });
    }
    console.log(`${row.id}: ${results.at(-1).predicted}`);
  }
  const report = {
    startedAt,
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    promptVersion: VISION_PROMPT_VERSION,
    promptSha256: createHash("sha256").update(VISION_PROMPT).digest("hex"),
    split,
    labelQuality: provisional
      ? "PROVISIONAL - not an acceptance result"
      : "human-approved",
    metrics: summarizeEvaluation(results),
    results,
  };
  await mkdir("evaluation/runs", { recursive: true });
  const path = `evaluation/runs/${startedAt.replaceAll(":", "-")}.json`;
  await writeFile(path, JSON.stringify(report, null, 2));
  console.log(`Saved ${path}`);
  // No silent success on service errors. Scores include errors in denominator.
  if (report.metrics.errors) process.exitCode = 1;
}
