"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  embeddedFeatures: true
};
exports.embeddedFeatures = void 0;

var _indexTs = require("./indexTs");

Object.keys(_indexTs).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _indexTs[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _indexTs[key];
    }
  });
});
// export * from "./indexTs";
// import {indexTsEmbeddedFeature} from "./indexTs";
// export const embeddedFeatures:EmbeddedFeature[] = [indexTsEmbeddedFeature];
// @INPRINT_START {exclude:[""], merge:[{name:"embeddedFeatures:EmbeddedFeature[]", suffix:"EmbeddedFeature"}]}
const embeddedFeatures = [_indexTs.indexTsEmbeddedFeature]; // @INPRINT_END

exports.embeddedFeatures = embeddedFeatures;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lbWJlZGRlZEZlYXR1cmVzL2luZGV4LnRzIl0sIm5hbWVzIjpbImVtYmVkZGVkRmVhdHVyZXMiLCJpbmRleFRzRW1iZWRkZWRGZWF0dXJlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBT0E7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUxBO0FBQ0E7QUFDQTtBQUVBO0FBSU8sTUFBTUEsZ0JBQW1DLEdBQUcsQ0FBQ0MsK0JBQUQsQ0FBNUMsQyxDQUNQIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRW1iZWRkZWRGZWF0dXJlIH0gZnJvbSBcIi4uL0VtYmVkZGVkRmVhdHVyZVwiO1xuXG4vLyBleHBvcnQgKiBmcm9tIFwiLi9pbmRleFRzXCI7XG4vLyBpbXBvcnQge2luZGV4VHNFbWJlZGRlZEZlYXR1cmV9IGZyb20gXCIuL2luZGV4VHNcIjtcbi8vIGV4cG9ydCBjb25zdCBlbWJlZGRlZEZlYXR1cmVzOkVtYmVkZGVkRmVhdHVyZVtdID0gW2luZGV4VHNFbWJlZGRlZEZlYXR1cmVdO1xuXG4vLyBASU5QUklOVF9TVEFSVCB7ZXhjbHVkZTpbXCJcIl0sIG1lcmdlOlt7bmFtZTpcImVtYmVkZGVkRmVhdHVyZXM6RW1iZWRkZWRGZWF0dXJlW11cIiwgc3VmZml4OlwiRW1iZWRkZWRGZWF0dXJlXCJ9XX1cbmV4cG9ydCAqIGZyb20gXCIuL2luZGV4VHNcIjtcblxuaW1wb3J0IHsgaW5kZXhUc0VtYmVkZGVkRmVhdHVyZSB9IGZyb20gXCIuL2luZGV4VHNcIjtcbmV4cG9ydCBjb25zdCBlbWJlZGRlZEZlYXR1cmVzOiBFbWJlZGRlZEZlYXR1cmVbXSA9IFtpbmRleFRzRW1iZWRkZWRGZWF0dXJlXTtcbi8vIEBJTlBSSU5UX0VORFxuIl19