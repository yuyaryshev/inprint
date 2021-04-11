import { EmbeddedFeature } from "../EmbeddedFeature";

// export * from "./indexTs";
// import {indexTsEmbeddedFeature} from "./indexTs";
// export const embeddedFeatures:EmbeddedFeature[] = [indexTsEmbeddedFeature];

// @INPRINT_START {exclude:[""], merge:[{name:"embeddedFeatures:EmbeddedFeature[]", suffix:"EmbeddedFeature"}]}
export * from "./indexTs";

import {indexTsEmbeddedFeature} from "./indexTs";
export const embeddedFeatures:EmbeddedFeature[] = [indexTsEmbeddedFeature];
// @INPRINT_END
