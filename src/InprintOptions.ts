import { InprintHandler } from "./InprintHandler";

export interface InprintOptions {
    skipNodeModules: boolean;
    files: string | string[];
    logging: "short" | "files" | false;
    inprint: InprintHandler;
    embeddedFeatures: "first" | true | "last" | false;
}

export const defaultInprintOptions = {
    skipNodeModules: true,
    files: ["src/**/*.{ts,cts,mts,tsx,js,jsx,cjs,mjs}"],
    logging: "short",
    embeddedFeatures: false,
};
