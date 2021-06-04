import { readdirSync } from "fs";
import { resolve } from "path";
import { EmbeddedFeature } from "../EmbeddedFeature";
import { InprintOptions } from "../InprintOptions";

export const indexTsEmbeddedFeature: EmbeddedFeature = {
    name: "IndexTs",
    keywords: ["index"],
    description: `Generates reexport for each file inside directory. 
Use exclude:['name1','name2'] to exclude some files. 
Use merge:[{name:'MERGE_NAME', suffix:'MERGE_SUFFIX'}] to merge exported consts with specified MERGE_SUFFIX as an array into one variable MERGE_NAME`,
    func: inprintIndexTs,
    help: `// ${"@INPRINT"}_START {exclude:[""], merge:[{name:"embeddedFeatures:EmbeddedFeature[]", suffix:"EmbeddedFeature"}]}
export * from "./indexTs.js";

import { indexTsEmbeddedFeature } from "./indexTs";
export const embeddedFeatures: EmbeddedFeature[] = [indexTsEmbeddedFeature];
// ${"@INPRINT"}_END
    `,
};

const allowedExtensions = new Set(["js", "mjs", "cjs", "jsx", "ts", "tsx"]);

export function inprintIndexTs(paramsObject: any, options: InprintOptions) {
    if (!paramsObject.absolutePath.endsWith("/index.ts")) return undefined;

    const excludes = new Set([
        ...(paramsObject?.excludes || []),
        ...(paramsObject?.exclude || []),
        ...(paramsObject?.excluding || []),
    ]);

    const merges = [...new Set([...(paramsObject?.merge || [])])];

    excludes.add("index");
    const baseParts = resolve(paramsObject.absolutePath.split("/").slice(0, -1).join("/"));

    const fileNames = [];
    for (let dirent of readdirSync(baseParts, { withFileTypes: true })) {
        if (dirent.isDirectory()) continue;
        const fileName = dirent.name;
        const temp = fileName.split(".");
        const ext = temp[temp.length - 1];
        if (!allowedExtensions.has(ext)) continue;
        const nameWoExt = fileName.split(".").slice(0, -1).join(".");
        if (!paramsObject.includeTests && nameWoExt.endsWith(".test")) continue;
        if (excludes.has(fileName) || excludes.has(nameWoExt)) continue;
        fileNames.push(nameWoExt);
    }
    fileNames.sort();

    const reexports = fileNames
        .map((f) => `export * from "./${f}${options.appendJsInImports ? ".js" : ""}";`)
        .join("\n");

    const mergeArrayBlocks = [];
    for (let mergeDefinition of merges) {
        const mergeLines = [];
        const mergeVars = [];
        for (let nameWoExt of fileNames) {
            mergeLines.push(`import {${nameWoExt}${mergeDefinition.suffix}} from "./${nameWoExt}";`);
            mergeVars.push(`${nameWoExt}${mergeDefinition.suffix}`);
        }
        mergeArrayBlocks.push(
            `
${mergeLines.join("\n")}
export const ${mergeDefinition.name} = [${mergeVars.join(", ")}];
`.trim()
        );
    }

    const r = `
${reexports}

${mergeArrayBlocks.join("\n\n")}
`.trim();

    if (!r.length) return `export const unused901723 = 0; // No files found!`;

    return r;
}
