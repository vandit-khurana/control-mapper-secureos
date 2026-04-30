require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { parseSOC } = require("./parsers/socParser");
const { parseExcel } = require("./parsers/excelParser");
const { parseTrustCenter } = require("./parsers/trustCenterParser");

const { normalizeControls } = require("./services/normalizeLLM");
const { embedControls } = require("./services/embedder");
const { mapControls } = require("./services/mapper");

const app = express();
app.use(cors());

app.get("/analyze", async (req, res) => {
  try {
    const soc = (await parseSOC("./data/soc2.docx")).slice(0, 5);
    const trust = (await parseTrustCenter(req.query.url)).slice(0, 5);
    const base = parseExcel("./data/controls.xlsx");

    const socN = await normalizeControls(soc);
    const trustN = await normalizeControls(trust);

    const socE = await embedControls(socN);
    const trustE = await embedControls(trustN);
    const baseE = await embedControls(base);

    const mappings = await mapControls([...socE, ...trustE], baseE);

    res.json({
      source_controls: [...soc, ...trust],
      normalized_common_controls: base,
      mappings,
    });
  } catch (e) {
    res.status(500).send(e.toString());
  }
});

app.listen(3000, () => console.log("Server running on 3000"));
