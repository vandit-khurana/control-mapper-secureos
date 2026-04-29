function cosine(a, b) {
  let d = 0,
    ma = 0,
    mb = 0;
  for (let i = 0; i < a.length; i++) {
    d += a[i] * b[i];
    ma += a[i] * a[i];
    mb += b[i] * b[i];
  }
  return d / (Math.sqrt(ma) * Math.sqrt(mb));
}

function classify(s) {
  if (s > 0.85) return "full";
  if (s > 0.6) return "partial";
  return null;
}

function mapControls(source, base) {
  let results = [];

  source.forEach((s) => {
    let matched = [];
    base.forEach((b) => {
      const score = cosine(s.vector, b.vector);
      const type = classify(score);
      if (type) {
        matched.push({ id: b.control_id, score, type });
      }
    });

    if (matched.length) {
      results.push({
        source_control_ids: [s.control_id],
        normalized_common_control_ids: matched.map((m) => m.id),
        match_type: matched.some((m) => m.type === "full") ? "full" : "partial",
        rationale: "Semantic similarity between controls",
      });
    }
  });

  return results;
}

module.exports = { mapControls };
