const https = require("https");
const fs = require("fs");

const RSS_URL = "https://blog.rss.naver.com/seosuno.xml";

https.get(RSS_URL, (res) => {
  let data = "";

  res.on("data", (chunk) => (data += chunk));

  res.on("end", () => {
    const links = [...data.matchAll(/<link>(.*?)<\/link>/g)]
      .map((m) => m[1])
      .filter((url) => url.includes("blog.naver.com"));

    const today = new Date().toISOString().split("T")[0];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${links
  .map(
    (url) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
  </url>`
  )
  .join("")}
</urlset>`;

    fs.writeFileSync("sitemap.xml", sitemap);
    console.log("✅ sitemap.xml updated");
  });
});