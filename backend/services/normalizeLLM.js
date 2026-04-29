const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function norm(text) {
  const r = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: `Normalize this control:\n${text}` }],
    temperature: 0,
  });
  return r.choices[0].message.content.trim();
}

async function normalizeControls(arr) {
  const limited = arr.slice(0, 5);
  return Promise.all(
    limited.map(async (c) => ({
      ...c,
      normalized: await norm(c.raw_text),
    }))
  );
}

module.exports = { normalizeControls };
