const fs = require("fs");
const https = require("https");
const xml2js = require("xml2js");

const RSS_URL = "https://blog.rss.naver.com/seosuno.xml";
const OUTPUT = "sitemap.xml";

https.get(RSS_URL, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", async () => {
    try {
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(data);

      const items = result.rss.channel[0].item;

      const urls = items.map((item) => {
        // ⭐ 핵심: 공백 제거 + 문자열 변환
        const link = String(item.link[0]).trim();

        // XML 안전 처리 (& 같은 문자)
        const safeLink = link
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        return `
  <url>
    <loc>${safeLink}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
      });

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

      fs.writeFileSync(OUTPUT, sitemap);
      console.log("✅ sitemap.xml 생성 완료");
    } catch (err) {
      console.error("❌ 오류:", err);
    }
  });
}).on("error", (err) => {
  console.error("❌ RSS 요청 실패:", err);
});