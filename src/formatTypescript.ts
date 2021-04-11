let formatjs: any = undefined;

// @ts-ignore
try {
    formatjs = require("prettier");
} catch (e) {}

let format = formatjs ? formatjs.format : undefined;

export const formatTypescript = (typescriptSourceCode: string, prettierOpts: any): string => {
    if (!format) return typescriptSourceCode;
    try {
        return format(typescriptSourceCode, prettierOpts);
    } catch (e) {
        return typescriptSourceCode;
    }
};

// export const formatTypescript = (s: string): string => s;
