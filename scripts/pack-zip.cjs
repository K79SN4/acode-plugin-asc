const path = require("node:path");
const fs = require("node:fs");
const JsZip = require("jszip");


const iconFile = path.join(__dirname, "../icon.png");
const pluginJSON = path.join(__dirname, "../plugin.json");
const distFolder = path.join(__dirname, "../dist");
let readmeDotMd = path.join(__dirname, "../readme.md");
if (!fs.existsSync(readmeDotMd)) {
    readmeDotMd = path.join(__dirname, "../README.md");
}
const distZipFile = path.join(__dirname, "../dist.zip");


// create zip file
const zip = new JsZip();
zip.file("icon.png", fs.readFileSync(iconFile));
zip.file("plugin.json", fs.readFileSync(pluginJSON));
zip.file("readme.md", fs.readFileSync(readmeDotMd));
loadFiles("", distFolder);
zip.generateNodeStream({
        type: "nodebuffer",
        streamFiles: true
    })
    .pipe(fs.createWriteStream(distZipFile))
    .on("finish", () => {
        console.log("Plugin dist.zip written ✨");
    });

function loadFiles(root, folder) {
    const distFiles = fs.readdirSync(folder);
    distFiles.forEach(file => {
        const stat = fs.statSync(path.join(folder, file));
        if (stat.isDirectory()) {
            zip.folder(file);
            loadFiles(
                path.join(root, file),
                path.join(folder, file)
            );
            return;
        }
        if (!/LICENSE(?:\.txt)?/.test(file)) {
            zip.file(
                path.join(root, file),
                fs.readFileSync(path.join(folder, file))
            );
        }
    });
}