import { InprintHandler } from "./InprintHandler";

export interface EmbeddedFeature {
    name: string;
    description: string;
    func: InprintHandler;
}
