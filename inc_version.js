const fs = require("fs");

let version_json = {};
try {
    version_json = JSON.parse(fs.readFileSync("version.json", "utf-8"));
} catch (e) {
    if (e.code !== "ENOENT") throw e;
}
version_json.build = (version_json.build || 0) + 1;
fs.writeFileSync("version.json", JSON.stringify(version_json, undefined, "    "), "utf-8");
console.log(`version_json.build = ${version_json.build}`);
