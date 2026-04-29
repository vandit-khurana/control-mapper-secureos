const mammoth = require("mammoth");

async function parseSOC(path) {
  const r = await mammoth.extractRawText({ path });
  const lines = r.value.split("\n").filter((l) => l.trim().length > 40);
  return lines.map((t, i) => ({
    control_id: `SC-${i + 1}`,
    raw_text: t,
  }));
}

module.exports = { parseSOC };
