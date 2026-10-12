import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateRisk,
  summarizeWeather,
  localTime,
  localDate,
} from "../shared/risk.js";
import {
  analysisSchema,
  locationSchema,
  parseAnalysis,
} from "../shared/schema.js";
const a = {
  problem_type: "blocked_drain",
  severity: 4,
  visible_evidence: "Waste obstructs a drain opening.",
  confidence: 0.85,
  affects: ["pedestrians"],
};
const dry = { total: 0, peak: 0, probability: 0 };
test("requires both inputs", () => {
  assert.equal(calculateRisk(null, dry), null);
  assert.equal(calculateRisk(a, null), null);
});
test("workflow example severity 4, total 62, peak 16, probability 80 is 10/10 HIGH", () => {
  const r = calculateRisk(a, { total: 62, peak: 16, probability: 80 });
  assert.equal(r.level, "HIGH");
  assert.equal(r.score, 10);
  assert.equal(r.reasons.length, 3);
  assert.deepEqual(r.points, { photo: 3, total: 3, peak: 2, probability: 2 });
});
test("same photo gives LOW, MEDIUM, HIGH as forecast changes", () => {
  assert.equal(calculateRisk(a, dry).level, "LOW");
  assert.equal(
    calculateRisk(a, { total: 20, peak: 5, probability: 20 }).level,
    "MEDIUM",
  );
  assert.equal(
    calculateRisk(a, { total: 51, peak: 16, probability: 80 }).level,
    "HIGH",
  );
});
test("photo tiers exactly match workflow; none contributes zero", () => {
  for (const [severity, expected] of [
    [1, 1],
    [2, 1],
    [3, 2],
    [4, 3],
    [5, 3],
  ])
    assert.equal(calculateRisk({ ...a, severity }, dry).points.photo, expected);
  assert.equal(
    calculateRisk({ ...a, problem_type: "none" }, dry).points.photo,
    0,
  );
});
for (const [field, pointName, cases] of [
  [
    "total",
    "total",
    [
      [19.99, 0],
      [20, 2],
      [50, 2],
      [50.01, 3],
    ],
  ],
  [
    "peak",
    "peak",
    [
      [4.99, 0],
      [5, 1],
      [15, 1],
      [15.01, 2],
    ],
  ],
  [
    "probability",
    "probability",
    [
      [39.99, 0],
      [40, 1],
      [70, 1],
      [70.01, 2],
    ],
  ],
])
  test(`${field} boundary points match the guide`, () => {
    for (const [value, expected] of cases)
      assert.equal(
        calculateRisk(a, { ...dry, [field]: value }).points[pointName],
        expected,
      );
  });
test("risk bands at 3/4 and 6/7 boundaries", () => {
  const values = [
    { ...dry },
    { ...dry, peak: 5 },
    { ...dry, total: 51 },
    { ...dry, total: 51, peak: 5 },
  ];
  assert.deepEqual(
    values.map((w) => {
      const r = calculateRisk(a, w);
      return [r.score, r.level];
    }),
    [
      [3, "LOW"],
      [4, "MEDIUM"],
      [6, "MEDIUM"],
      [7, "HIGH"],
    ],
  );
});
test("none avoids false photo concern but heavy weather still contributes", () => {
  const r = calculateRisk(
    { ...a, problem_type: "none" },
    { total: 70, peak: 20, probability: 80 },
  );
  assert.equal(r.points.photo, 0);
  assert.equal(r.score, 7);
  assert.match(r.reasons[0], /No visible drainage/);
});
const now = new Date("2026-10-12T04:35:00Z"),
  start = Date.parse("2026-10-12T00:00:00Z") / 1000;
const forecast = () => ({
  hourly: {
    time: Array.from({ length: 48 }, (_, i) => start + i * 3600),
    precipitation: Array(48).fill(1),
    precipitation_probability: Array(48).fill(40),
  },
});
test("24 hourly precipitation bins, not daily sums or rain-only data", () => {
  const f = forecast();
  f.hourly.precipitation[0] = 999;
  f.hourly.precipitation[28] = 999;
  f.hourly.precipitation[8] = 9;
  f.hourly.precipitation_probability[6] = 90;
  f.hourly.rain = Array(48).fill(999);
  f.daily = { precipitation_sum: [888, 888] };
  const r = summarizeWeather(f, now);
  assert.equal(r.total, 32);
  assert.equal(r.peak, 9);
  assert.equal(r.probability, 90);
  assert.equal(r.peakTime, start + 8 * 3600);
  assert.equal(r.rows.length, 24);
  assert.equal(r.fetchedAt, now.toISOString());
});
test("weather rejects missing, null, truncated, invalid or discontinuous data", () => {
  assert.throws(() => summarizeWeather({}, now));
  for (const key of ["precipitation", "precipitation_probability"]) {
    const f = forecast();
    f.hourly[key][5] = null;
    assert.throws(() => summarizeWeather(f, now));
  }
  const f = forecast();
  f.hourly.time[5] += 60;
  assert.throws(() => summarizeWeather(f, now));
  const short = forecast();
  short.hourly.time.length = 8;
  assert.throws(() => summarizeWeather(short, now));
  const invalid = forecast();
  invalid.hourly.precipitation_probability[5] = 101;
  assert.throws(() => summarizeWeather(invalid, now));
});
test("zero precipitation is valid", () => {
  const f = forecast();
  f.hourly.precipitation.fill(0);
  f.hourly.precipitation_probability.fill(0);
  const r = summarizeWeather(f, now);
  assert.equal(r.total, 0);
  assert.equal(r.peak, 0);
  assert.equal(r.probability, 0);
});
test("date and peak-hour labels always use Bangladesh timezone", () => {
  assert.equal(localTime(now), "10:35");
  assert.equal(localDate(new Date("2026-10-11T20:00:00Z")), "2026-10-12");
});
test("schema enforces sentence evidence and restricted affects list", () => {
  assert.equal(analysisSchema.safeParse(a).success, true);
  for (const patch of [
    { severity: 0 },
    { severity: 6 },
    { severity: 1.5 },
    { confidence: 2 },
    { visible_evidence: ["Wrong shape"] },
    { affects: ["Drainage"] },
    { problem_type: "other" },
    { extra: true },
  ])
    assert.equal(analysisSchema.safeParse({ ...a, ...patch }).success, false);
  assert.equal(analysisSchema.safeParse({ ...a, affects: [] }).success, true);
});
test("parse accepts plain or fenced JSON and rejects prose or malformed output politely", () => {
  assert.deepEqual(parseAnalysis(JSON.stringify(a)), a);
  assert.deepEqual(parseAnalysis("```json\n" + JSON.stringify(a) + "\n```"), a);
  for (const text of [
    "not json",
    "```json\n{broken\n```",
    "Here is the result: " + JSON.stringify(a),
    JSON.stringify({ ...a, affects: ["cars"] }),
  ])
    assert.throws(() => parseAnalysis(text), /clearer photo/);
});
test("location schema limits coordinates to Bangladesh bounding box", () => {
  assert.equal(
    locationSchema.safeParse({ lat: 23.81, lng: 90.41, label: "Dhaka" })
      .success,
    true,
  );
  assert.equal(
    locationSchema.safeParse({ lat: 40, lng: 90.41, label: "Elsewhere" })
      .success,
    false,
  );
});
