const mammoth = require("mammoth");

const CONTROL_KEYWORDS = [
  "must",
  "required",
  "are performed",
  "is implemented",
  "are documented",
  "are logged",
  "are reviewed",
];

function isControl(line) {
  const l = line.toLowerCase();
  return CONTROL_KEYWORDS.some((k) => l.includes(k));
}

async function parseSOC(path) {
  const r = await mammoth.extractRawText({ path });

  const lines = r.value
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 30 && isControl(l));

  return lines.map((t, i) => ({
    control_id: `SC-${i + 1}`,
    raw_text: t,
  }));
}

module.exports = { parseSOC };
