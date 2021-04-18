import JSON5 from "json5";
import globby from "globby";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { embeddedFeatures } from "./embeddedFeatures";
import { defaultInprintOptions, InprintOptions } from "./InprintOptions";
import { formatTypescript } from "./formatTypescript";

export const inprint_prefix = "@" + "INPRINT";
export const startPrefix = "_START";
export const endPrefix = "_END";
export const usageNotice = `
USAGE:

// ${inprint_prefix}_START {...any_json_params...}
// Generated code will go here
// ${inprint_prefix}_END
`;

interface InprintFilePart {
    header: string;
    params: any;
    middle: string;
    tail: string;
    newMiddle: string;
}

export const writeFileSyncIfChanged = (fileName: string, content: string) => {
    let current: string | undefined;
    try {
        current = readFileSync(fileName, "utf-8");
    } catch (e) {}

    if (current !== content) {
        writeFileSync(fileName, content, "utf-8");
        return true;
    }
    return false;
};

export function handleFile(filePath: string, options: InprintOptions): boolean {
    const contentStr = readFileSync(filePath, "utf-8");

    if (!contentStr.includes(inprint_prefix)) return false;

    const [fileHeader, ...parts0] = contentStr.split(inprint_prefix);
    const parts: InprintFilePart[] = [];
    for (let i = 0; i < parts0.length; i += 2) {
        const s = parts0[i];
        if (!s.startsWith(startPrefix)) {
            console.error(`CODE00000001 INPRINT_ERROR No ${inprint_prefix}${startPrefix} in ${filePath}`);
            return false;
        }

        if (!parts0[i + 1].startsWith(endPrefix)) {
            console.error(`CODE00000002 INPRINT_ERROR No ${inprint_prefix}${endPrefix} in ${filePath}`);
        }

        try {
            const [header, ...middleParts] = s.split("\n");
            const lastPart = middleParts.pop();

            const paramsStr = header.substr(startPrefix.length).trim();
            const middle = middleParts.join("\n");
            const tail = lastPart + inprint_prefix + parts0[i + 1];

            const params = {
                content: middle,
                absolutePath: filePath,
                ...JSON5.parse(paramsStr),
            };
            parts.push({ header, params, middle, tail, newMiddle: "" });
        } catch (e) {
            console.error(`CODE00000003 INPRINT_ERROR ${e.message} in ${filePath}`);
            return false;
        }
    }

    for (let part of parts) {
        try {
            part.newMiddle = doInprint(part.params, options);
        } catch (e) {
            part.newMiddle = `// INPRINT_FAILED because of exception:\n${e.message || "NO_ERROR_MESSAGE"}\\n${
                e.stack || "NO_STACK_TRACE"
            }`
                .split("\n")
                .join("\n//     ");
        }
    }

    const newContent =formatTypescript(
        fileHeader + inprint_prefix + parts.map((p) => `${p.header}\n${p.newMiddle}\n${p.tail}`).join(inprint_prefix), options.prettierOpts);
    writeFileSyncIfChanged(filePath, newContent);
    return true;
}

export function callEmbeddedFeatures(params: any, options: InprintOptions): string | undefined {
    for (let embeddedFeature of embeddedFeatures) {
        const r = embeddedFeature.func(params, options);
        if (r) return r;
    }
    return undefined;
}

export function doInprint(params: any, options: InprintOptions): string {
    if (options.embeddedFeatures === "first" || options.embeddedFeatures === true) {
        const r = callEmbeddedFeatures(params, options);
        if (r) return r;
    }

    if (options.inprint) {
        const r = options.inprint(params, options);
        if (r) return r;
    }

    if (options.embeddedFeatures === "last") {
        const r = callEmbeddedFeatures(params, options);
        if (r) return r;
    }
    return `// INPRINT_ERROR None of inprint functions returned a result. They all returned undefined!`;
}

// const testFilePath = `D:\\b\\Mine\\GIT_Work\\yatasks_one_api\\src\\inprintTestFile.ts`;
// handleFile(testFilePath);

export function run(options0?: InprintOptions | undefined) {
    if (process.argv[2] === "--version" || process.argv[2] === "-v") {
        // @ts-ignore
        console.log(__VERSION__);
        return;
    }

    let optionsPath: string | undefined = undefined;
    if (process.argv[2])
        try {
            if (!options0) {
                optionsPath = process.argv[2];
                options0 = require(optionsPath);
            }
        } catch (e) {
            console.error(`CODE00000004 INPRINT failed to load '${optionsPath}' because of exception:`);
            console.error(e);
            process.exit(1);
            return;
        }

    try {
        if (!options0) {
            optionsPath = resolve(process.cwd(), "inprint.cjs");
            options0 = require(optionsPath);
        }
    } catch (e) {
        if (e.code !== "MODULE_NOT_FOUND") {
            console.error(`CODE00000008 INPRINT failed to load '${optionsPath}' because of exception:`);
            console.error(e);
            process.exit(1);
            return;
        }
    }

    try {
        if (!options0) {
            optionsPath = resolve(process.cwd(), "inprint.js");
            options0 = require(optionsPath);
        }
    } catch (e) {
        if (e.code !== "MODULE_NOT_FOUND") {
            console.error(`CODE00000009 INPRINT failed to load '${optionsPath}' because of exception:`);
            console.error(e);
            process.exit(1);
            return;
        }
    }

    const options: InprintOptions = { ...defaultInprintOptions, ...options0 };
    let processedCount = 0;
    (async () => {
        if (options.logging) console.log(`CODE00000005 INPRINT options from ${optionsPath}`);
        const paths = await globby(options.files);

        for (let filePath of paths) {
            if (options.logging === "files") console.log(`CODE00000006 INPRINT ${filePath}`);
            if (filePath.includes("node_modules") && options.skipNodeModules) continue;
            if (handleFile(filePath, options)) processedCount++;
        }
        if (options.logging)
            console.log(
                `CODE00000007 INPRINT finished, ${paths.length} - total files, ${processedCount} - processed, ${
                    paths.length - processedCount
                } - skipped`
            );
        if(options.forceProcessTermination)
            process.exit(0);
    })();
}
