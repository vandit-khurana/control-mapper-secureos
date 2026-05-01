const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "control-mapper",
  },
});

async function norm(text) {
  const r = await client.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `
Convert the following into a normalized, canonical security control.

Rules:
- Keep it atomic (one control per statement)
- Remove organization-specific wording
- Preserve security intent
- Use standard terminology (e.g., MFA, encryption, access control)

Control:
${text}
        `,
      },
    ],
    temperature: 0,
  });

  return r.choices[0].message.content.trim();
}

async function normalizeControls(arr) {
  return Promise.all(
    arr.map(async (c) => ({
      ...c,
      normalized: await norm(c.raw_text),
    })),
  );
}

module.exports = { normalizeControls };
