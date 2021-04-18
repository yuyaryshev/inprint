let formatjs: any = undefined;

// @ts-ignore
try {
    formatjs = require("prettier");
} catch (e) {}

export const formatTypescript = (typescriptSourceCode: string, prettierOpts: any): string => {
    if (!formatjs.format) return typescriptSourceCode;
    try {
        // console.log(`formatTypescript started`);
        const r = formatjs.format(typescriptSourceCode, prettierOpts);
        // console.log(`formatTypescript finished successfully`);
        return r;
    } catch (e) {
        // console.warn(`formatTypescript failed`, e);
        return typescriptSourceCode;
    }
};

// export const formatTypescript = (s: string): string => s;
