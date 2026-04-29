const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function emb(t) {
  const r = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: t,
  });
  return r.data[0].embedding;
}

async function embedControls(arr) {
  return Promise.all(
    arr.map(async (c) => ({
      ...c,
      vector: await emb(c.normalized || c.text),
    }))
  );
}

module.exports = { embedControls };
