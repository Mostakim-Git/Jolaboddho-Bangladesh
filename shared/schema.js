import { z } from "zod";
export const analysisSchema = z
  .object({
    problem_type: z.enum([
      "blocked_drain",
      "flooded_road",
      "blocked_canal",
      "broken_culvert",
      "garbage_in_drain",
      "none",
    ]),
    severity: z.number().int().min(1).max(5),
    visible_evidence: z.string().trim().min(1).max(600),
    confidence: z.number().min(0).max(1),
    affects: z
      .array(z.enum(["pedestrians", "vehicles", "shops", "homes", "school"]))
      .max(5),
  })
  .strict();
export const locationSchema = z.object({
  lat: z.number().min(20.5).max(26.7),
  lng: z.number().min(88).max(92.8),
  label: z.string().min(1).max(200),
});

// Some providers wrap structured output despite responseMimeType. Accept only
// one complete JSON object, optionally wrapped in a single markdown fence.
export function parseAnalysis(text) {
  try {
    const clean = text
      .trim()
      .replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/i, "$1");
    return analysisSchema.parse(JSON.parse(clean));
  } catch {
    const error = new Error(
      "We could not read a reliable photo assessment. Please retry with a clearer photo.",
    );
    error.status = 502;
    throw error;
  }
}
