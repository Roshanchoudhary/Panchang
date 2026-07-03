const fs = require("fs");
const path = require("path");

const BASE_URL = "https://panchang.org.in";

const LANGUAGES = [
"as","bn","brx","doi","gu","hi","kn","ks","kok","mai",
"ml","mni","mr","ne","or","pa","sa","sat","sd","ta","te","ur"
];

// जिन pages में ?lang= लगेगा
const LANGUAGE_PAGES = [
"daily.html",
"monthly.html",
"rashifal.html"
];

function findHtmlFiles(dir){

    let files=[];

    fs.readdirSync(dir).forEach(file=>{

        if(file==="node_modules" || file===".git")
            return;

        const full=path.join(dir,file);

        if(fs.statSync(full).isDirectory()){

            files=files.concat(findHtmlFiles(full));

        }else if(file.endsWith(".html")){

            files.push(full.replace(/\\/g,"/"));

        }

    });

    return files;
}

const htmlFiles=findHtmlFiles(".");

let urls=[];

htmlFiles.forEach(file=>{

    file=file.replace(/^\.\//,"");

    if(file==="index.html"){

        urls.push(BASE_URL+"/");
        return;

    }

    if(LANGUAGE_PAGES.includes(path.basename(file))){

        LANGUAGES.forEach(lang=>{

            urls.push(BASE_URL+"/"+file+"?lang="+lang);

        });

    }else{

        urls.push(BASE_URL+"/"+file);

    }

});

urls=[...new Set(urls)].sort();

let xml=`<?xml version="1.0" encoding="UTF-8"?>\n`;
xml+=`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

urls.forEach(url=>{

xml+=`
<url>
<loc>${url}</loc>
<changefreq>daily</changefreq>
<priority>${url===BASE_URL+"/"?"1.0":"0.8"}</priority>
</url>`;

});

xml+=`
</urlset>`;

fs.writeFileSync("sitemap.xml",xml);

console.log("Total URLs:",urls.length);
