const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

//  stronger keyword-based filtering
function quickFilter(a, b) {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  // intent buckets
  const buckets = {
    roles: ["roles", "responsibilities"],
    policy: ["policy", "policies", "procedures"],
    risk: ["risk", "assessment"],
    access: ["access", "authentication", "authorization"],
    encryption: ["encryption", "encrypt"],
  };

  for (const key in buckets) {
    const words = buckets[key];

    const aMatch = words.some((w) => aLower.includes(w));
    const bMatch = words.some((w) => bLower.includes(w));

    if (aMatch && bMatch) return true;
  }

  return false;
}

//  ranking score
function quickScore(a, b) {
  const wordsA = a.toLowerCase().split(/\W+/);
  const wordsB = b.toLowerCase().split(/\W+/);

  return wordsA.filter((w) => wordsB.includes(w)).length;
}

//  safe JSON parse
function safeParse(content) {
  try {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function mapControls(source, base) {
  const results = [];

  await Promise.all(
    source.map(async (s) => {
      const sourceText = s.normalized || s.raw_text;

      //  Step 1: filter
      let candidates = base.filter((b) => quickFilter(sourceText, b.text));

      // fallback if nothing matched
      if (candidates.length === 0) {
        candidates = base;
      }

      //  Step 2: rank + top-K
      candidates = candidates
        .map((b) => ({
          ...b,
          score: quickScore(sourceText, b.text),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 7);

      //  Step 3: LLM evaluation (parallel)
      const tasks = candidates.map(async (b) => {
        const prompt = `
Compare the following controls:

Source: ${sourceText}
Base: ${b.text}

Classify as:
- full → if both controls represent the same core requirement, even if phrased differently or one focuses on documentation and the other on enforcement
- partial → if there is strong overlap in intent but not complete coverage
- none → if controls are unrelated

Be strict. Do not force a match.

Respond ONLY in JSON:
{
  "match_type": "full | partial | none",
  "rationale": "..."
}
`;

        try {
          const r = await client.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
          });

          const parsed = safeParse(r.choices[0].message.content);
          if (!parsed) return null;

          if (parsed.match_type && parsed.match_type !== "none") {
            return {
              id: b.control_id,
              type: parsed.match_type,
              rationale: parsed.rationale,
            };
          }
        } catch (err) {
          console.log("LLM error:", err.message);
        }

        return null;
      });

      const matched = (await Promise.all(tasks)).filter(Boolean);

      //  Step 4: precision-first selection
      if (matched.length) {
        const fullMatches = matched.filter((m) => m.type === "full");

        const finalMatches =
          fullMatches.length > 0
            ? fullMatches
            : matched.filter((m) => m.type === "partial").slice(0, 2);

        results.push({
          source_control_ids: [s.control_id],
          normalized_common_control_ids: finalMatches.map((m) => m.id),
          match_type: finalMatches.some((m) => m.type === "full")
            ? "full"
            : "partial",
          rationale: finalMatches.map((m) => m.rationale).join(" | "),
        });
      }
    }),
  );

  return results;
}

module.exports = { mapControls };
