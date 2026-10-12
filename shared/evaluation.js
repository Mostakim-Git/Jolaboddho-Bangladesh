import { problemLabels } from "./risk.js";
export function summarizeEvaluation(rows) {
  const labels = Object.keys(problemLabels);
  const confusion = Object.fromEntries(
    labels.map((label) => [
      label,
      Object.fromEntries([...labels, "ERROR"].map((p) => [p, 0])),
    ]),
  );
  let correct = 0,
    completed = 0;
  for (const row of rows) {
    const predicted = labels.includes(row.predicted) ? row.predicted : "ERROR";
    confusion[row.expected][predicted]++;
    if (predicted !== "ERROR") completed++;
    if (predicted === row.expected) correct++;
  }
  return {
    attempted: rows.length,
    completed,
    errors: rows.length - completed,
    correct,
    accuracy: rows.length ? correct / rows.length : null,
    confusion,
    perClass: Object.fromEntries(
      labels.map((label) => {
        const actual = rows.filter((r) => r.expected === label);
        const tp = actual.filter((r) => r.predicted === label).length;
        return [
          label,
          {
            count: actual.length,
            recall: actual.length ? tp / actual.length : null,
          },
        ];
      }),
    ),
  };
}
