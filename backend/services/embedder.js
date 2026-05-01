let extractor = null;

async function loadModel() {
  if (!extractor) {
    process.env.TRANSFORMERS_BACKEND = "wasm";
    const { pipeline } = await import("@xenova/transformers");
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
}

async function emb(text) {
  await loadModel();
  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });
  return Array.from(output.data);
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
