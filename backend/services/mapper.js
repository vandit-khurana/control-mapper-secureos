const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

// shortlist top K candidates
function getTopCandidates(source, base, k = 3) {
  const scored = base.map((b) => ({
    ...b,
    score: cosine(source.vector, b.vector),
  }));

  return scored.sort((a, b) => b.score - a.score).slice(0, k);
}

async function decideMatch(source, candidates) {
  const prompt = `
Source control:
${source.normalized || source.raw_text}

Candidate controls:
${candidates.map((c, i) => `${i + 1}. ${c.text}`).join("\n")}

For each candidate, return JSON:
[
  {
    "id": "<control_id>",
    "match_type": "full | partial | none",
    "rationale": "<one line reason>"
  }
]
`;

  const r = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  try {
    return JSON.parse(r.choices[0].message.content);
  } catch {
    return [];
  }
}

async function mapControls(source, base) {
  let results = [];

  for (const s of source) {
    const candidates = getTopCandidates(s, base);

    const decisions = await decideMatch(s, candidates);

    const valid = decisions.filter((d) => d.match_type !== "none");

    if (valid.length) {
      results.push({
        source_control_ids: [s.control_id],
        normalized_common_control_ids: valid.map((v) => v.id),
        match_type: valid.some((v) => v.match_type === "full")
          ? "full"
          : "partial",
        rationale: valid.map((v) => v.rationale).join(" | "),
      });
    }
  }

  return results;
}

module.exports = { mapControls };
