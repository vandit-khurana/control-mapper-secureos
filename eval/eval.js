const dataset = require("./dataset.json");

function simpleEval() {
  let correct = 0;
  dataset.forEach((d) => {
    let pred = d.a.includes("MFA") ? "full" : "partial";
    if (pred === d.label) correct++;
  });
  console.log("Accuracy:", correct / dataset.length);
}

simpleEval();
