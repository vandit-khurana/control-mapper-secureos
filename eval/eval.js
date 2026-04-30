const dataset = require("./dataset.json");
const { embedControls } = require("../backend/services/embedder");
const { mapControls } = require("../backend/services/mapper");

async function runEval() {
  let correct = 0;

  for (const d of dataset) {
    const source = [{ control_id: "S1", raw_text: d.a }];
    const base = [{ control_id: "B1", text: d.b }];

    const sE = await embedControls(source);
    const bE = await embedControls(base);

    const res = await mapControls(sE, bE);

    const pred = res.length ? res[0].match_type : "none";

    if (pred === d.label) correct++;
  }

  console.log("Accuracy:", correct / dataset.length);
}

runEval();
