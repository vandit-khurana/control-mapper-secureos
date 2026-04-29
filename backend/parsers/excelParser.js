const XLSX = require("xlsx");

function parseExcel(path) {
  const wb = XLSX.readFile(path);
  const sh = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sh);

  return data.map((r, i) => ({
    control_id: `NCC-${i + 1}`,
    text: r["Control Description"],
  }));
}

module.exports = { parseExcel };
