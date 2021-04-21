import { readdirSync } from "fs";
import { EmbeddedFeature } from "../EmbeddedFeature";

export const indexTsEmbeddedFeature: EmbeddedFeature = {
    name:"IndexTs",
    description: `Generates reexport for each file inside directory. 
Use exclude:['name1','name2'] to exclude some files. 
Use merge:[{name:'MERGE_NAME', suffix:'MERGE_SUFFIX'}] to merge exported consts with specified MERGE_SUFFIX as an array into one variable MERGE_NAME`,
    func: inprintIndexTs,
};

export function inprintIndexTs(paramsObject: any) {
    if (!paramsObject.absolutePath.endsWith("/index.ts")) return undefined;

    const excludes = new Set([
        ...(paramsObject?.excludes || []),
        ...(paramsObject?.exclude || []),
        ...(paramsObject?.excluding || []),
    ]);

    const merges = [...new Set([...(paramsObject?.merge || [])])];

    excludes.add("index");
    const baseParts = paramsObject.absolutePath.split("/").slice(0, -1).join("/");

    const fileNames = [];
    for (let fileName of readdirSync(baseParts)) {
        const nameWoExt = fileName.split(".").slice(0, -1).join(".");
        if(!paramsObject.includeTests && nameWoExt.endsWith(".test")) continue;
        if (excludes.has(fileName) || excludes.has(nameWoExt)) continue;
        fileNames.push(nameWoExt);
    }
    fileNames.sort();

    const reexports = fileNames.map((f) => `export * from "./${f}";`).join("\n");

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

    return `
${reexports}

${mergeArrayBlocks.join("\n\n")}
`.trim();
}
