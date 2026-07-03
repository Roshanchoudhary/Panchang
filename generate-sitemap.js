const fs = require("fs");
const path = require("path");

const BASE_URL = "https://panchang.org.in";

const LANGUAGES = [
  "as","bn","brx","doi","gu","hi","kn","ks","kok","mai",
  "ml","mni","mr","ne","or","pa","sa","sat","sd","ta","te","ur"
];

// जिन Pages के Language Versions हैं
const LANGUAGE_PAGES = [
  "daily.html",
  "monthly.html",
  "rashifal.html"
];

// Sitemap में शामिल नहीं होंगे
const IGNORE_FILES = [
  "404.html",
  "test.html",
  "admin.html",
  "login.html"
];

function findHtmlFiles(dir) {
  let files = [];

  fs.readdirSync(dir).forEach(file => {

    if (file === ".git" || file === "node_modules") return;

    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      files = files.concat(findHtmlFiles(full));
    } else {

      if (!file.endsWith(".html")) return;

      if (IGNORE_FILES.includes(file)) return;

      files.push(full.replace(/\\/g, "/").replace(/^\.\//, ""));
    }

  });

  return files;
}

const htmlFiles = findHtmlFiles(".");

let urls = [];

htmlFiles.forEach(file => {

  if (file === "index.html") {
    urls.push({
      url: BASE_URL + "/",
      priority: "1.0",
      changefreq: "daily"
    });
    return;
  }

  const filename = path.basename(file);

  const cleanFile = file.replace(/\.html$/, "");

  if (LANGUAGE_PAGES.includes(filename)) {

    LANGUAGES.forEach(lang => {

      urls.push({
        url: `${BASE_URL}/${cleanFile}?lang=${lang}`,
        priority: "0.9",
        changefreq: "daily"
      });

    });

  } else {

    urls.push({
      url: `${BASE_URL}/${cleanFile}`,
      priority: "0.8",
      changefreq: "weekly"
    });

  }

});

urls.sort((a,b)=>a.url.localeCompare(b.url));

const today = new Date().toISOString().split("T")[0];

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

urls.forEach(item => {

xml += `
  <url>
    <loc>${item.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`;

});

xml += `
</urlset>`;

fs.writeFileSync("sitemap.xml", xml, "utf8");

console.log("================================");
console.log("Sitemap Generated Successfully");
console.log("Total URLs:", urls.length);
console.log("================================");
