import { InprintOptions } from "./InprintOptions";

export type InprintHandler = (params: any, options: InprintOptions) => string | undefined;