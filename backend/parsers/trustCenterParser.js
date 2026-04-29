const axios = require("axios");
const cheerio = require("cheerio");

async function parseTrustCenter(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  let res = [];
  $("p,li").each((i, e) => {
    const t = $(e).text().trim();
    if (t.length > 50) {
      res.push({
        control_id: `TC-${i + 1}`,
        raw_text: t,
      });
    }
  });

  return res;
}

module.exports = { parseTrustCenter };
