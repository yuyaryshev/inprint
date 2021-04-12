import { InprintHandler } from "./InprintHandler";

export interface InprintOptions {
    skipNodeModules: boolean;
    files: string | string[];
    logging: "short" | "files" | false;
    inprint?: InprintHandler | undefined;
    embeddedFeatures: "first" | true | "last" | false;
    prettierOpts?:any;
    forceProcessTermination?:boolean;
}

export const defaultInprintOptions = {
    skipNodeModules: true,
    files: ["src/**/*.{ts,cts,mts,tsx,js,jsx,cjs,mjs}"],
    logging: "short" as const,
    embeddedFeatures: true,
};
