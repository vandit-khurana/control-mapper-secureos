const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const cache = new Map();

async function emb(t) {
  if (cache.has(t)) return cache.get(t);

  const r = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: t,
  });

  const vec = r.data[0].embedding;
  cache.set(t, vec);
  return vec;
}

async function embedControls(arr) {
  return Promise.all(
    arr.map(async (c) => ({
      ...c,
      vector: await emb(c.normalized || c.text),
    })),
  );
}

module.exports = { embedControls };
