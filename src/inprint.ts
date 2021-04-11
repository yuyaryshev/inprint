import JSON5 from "json5";
import globby from "globby";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

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

export function inprintFunction(params0: any) {
    const { content, ...params } = params0;
    return "    // " + JSON.stringify(params);
}

export interface InprintOptions {
    skipNodeModules: boolean;
    files: string | string[];
    logging: "short" | "files" | false;
}

export const defaultInprintOptions = {
    skipNodeModules: true,
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    logging: "short",
};

export function handleFile(filePath: string, options: InprintOptions) {
    const contentStr = readFileSync(filePath, "utf-8");

    if (!contentStr.includes(inprint_prefix)) return;

    const [fileHeader, ...parts0] = contentStr.split(inprint_prefix);
    const parts: InprintFilePart[] = [];
    for (let i = 0; i < parts0.length; i += 2) {
        const s = parts0[i];
        if (!s.startsWith(startPrefix)) {
            console.error(`CODE00000001 INPRINT_ERROR No ${inprint_prefix}${startPrefix} in ${filePath}`);
            return;
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
            return;
        }
    }

    for (let part of parts) {
        try {
            part.newMiddle = inprintFunction(part.params);
        } catch (e) {
            part.newMiddle = `// INPRINT_FAILED because of exception:\n${e.message || "NO_ERROR_MESSAGE"}\\n${
                e.stack || "NO_STACK_TRACE"
            }`
                .split("\n")
                .join("\n//     ");
        }
    }

    const newContent =
        fileHeader + inprint_prefix + parts.map((p) => `${p.header}\n${p.newMiddle}\n${p.tail}`).join(inprint_prefix);
    writeFileSyncIfChanged(filePath, newContent);
}

// const testFilePath = `D:\\b\\Mine\\GIT_Work\\yatasks_one_api\\src\\inprintTestFile.ts`;
// handleFile(testFilePath);

let options0: InprintOptions | undefined = undefined;
let optionsPath = process.argv[2];
try {
    if (!options0) {
        optionsPath = process.argv[2];
        options0 = require(optionsPath);
    }
} catch (e) {}

try {
    if (!options0) {
        optionsPath = resolve(process.cwd(), "inprint.cjs");
        options0 = require(optionsPath);
    }
} catch (e) {}

try {
    if (!options0) {
        optionsPath = resolve(process.cwd(), "inprint.js");
        options0 = require(optionsPath);
    }
} catch (e) {}

if (!options0) {
    console.error(
        `CODE00000000 INPRINT_ERROR Couldn't find options file. Create inprint.cjs or specify path to options in command line argument`
    );
} else {
    const options: InprintOptions = { ...defaultInprintOptions, ...options0 };
    (async () => {
        if (options.logging) console.log(`CODE00000000 INPRINT options from ${optionsPath}`);
        const paths = await globby(options.files);

        for (let filePath of paths) {
            if (options.logging === "files") console.log(`CODE00000000 INPRINT ${filePath}`);
            if (filePath.includes("node_modules") && options.skipNodeModules) continue;
            handleFile(filePath, options);
        }
        if (options.logging) console.log(`CODE00000000 INPRINT finished, ${paths.length} - files`);

        //=> ['unicorn', 'rainbow']
    })();
}
