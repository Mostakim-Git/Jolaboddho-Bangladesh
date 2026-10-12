export const problemLabels = {
  blocked_drain: "Blocked drain",
  flooded_road: "Flooded road",
  blocked_canal: "Blocked canal",
  broken_culvert: "Broken culvert",
  garbage_in_drain: "Garbage in drain",
  none: "No visible drainage problem",
};
// Advisory heuristic, not a calibrated hydrological model. No AI is used here.
export function calculateRisk(analysis, weather) {
  if (!analysis || !weather) return null;
  const severity = analysis.problem_type === "none" ? 0 : analysis.severity;
  const points = {
    photo: severity === 0 ? 0 : severity <= 2 ? 1 : severity === 3 ? 2 : 3,
    total: weather.total < 20 ? 0 : weather.total <= 50 ? 2 : 3,
    peak: weather.peak < 5 ? 0 : weather.peak <= 15 ? 1 : 2,
    probability:
      weather.probability < 40 ? 0 : weather.probability <= 70 ? 1 : 2,
  };
  const score = Object.values(points).reduce((sum, value) => sum + value, 0);
  const level = score <= 3 ? "LOW" : score <= 6 ? "MEDIUM" : "HIGH";
  return {
    level,
    score,
    points,
    reasons: [
      severity
        ? `${problemLabels[analysis.problem_type]} identified with severity ${severity}/5 (${points.photo} photo points).`
        : "No visible drainage problem identified; photo contributes 0 points. Weather can still pose a risk.",
      `${weather.total.toFixed(1)} mm expected over 24 hours; peak ${weather.peak.toFixed(1)} mm/h (${points.total + points.peak} rain points).`,
      `Highest hourly rain probability is ${weather.probability}% (${points.probability} probability points).`,
    ],
  };
}

export function summarizeWeather(data, now = new Date()) {
  const h = data.hourly;
  if (!h || !Array.isArray(h.time))
    throw new Error(
      "The weather service returned incomplete data. Please try again.",
    );
  const startHour = Math.floor(now.getTime() / 3600000) * 3600;
  const rows = h.time
    .map((time, i) => ({
      time,
      rain: h.precipitation?.[i],
      probability: h.precipitation_probability?.[i],
    }))
    .filter((r) => r.time >= startHour)
    .slice(0, 24);
  if (
    rows.length !== 24 ||
    rows.some(
      (r, i) =>
        r.time !== startHour + i * 3600 ||
        !Number.isFinite(r.rain) ||
        r.rain < 0 ||
        !Number.isFinite(r.probability) ||
        r.probability < 0 ||
        r.probability > 100,
    )
  )
    throw new Error(
      "A complete 24-hour forecast is not available. Please try again shortly.",
    );
  const peakRow = rows.reduce((a, b) => (b.rain > a.rain ? b : a));
  return {
    total: rows.reduce((sum, r) => sum + r.rain, 0),
    peak: peakRow.rain,
    probability: Math.max(...rows.map((r) => r.probability)),
    peakTime: peakRow.time,
    rows,
    fetchedAt: now.toISOString(),
    source: "live",
  };
}
export function localTime(value) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  }).format(new Date(typeof value === "number" ? value * 1000 : value));
}

export function localDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
