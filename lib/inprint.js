"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inprintFunction = inprintFunction;
exports.handleFile = handleFile;
exports.run = run;
exports.defaultInprintOptions = exports.writeFileSyncIfChanged = exports.usageNotice = exports.endPrefix = exports.startPrefix = exports.inprint_prefix = void 0;

var _json = _interopRequireDefault(require("json5"));

var _globby = _interopRequireDefault(require("globby"));

var _fs = require("fs");

var _path = require("path");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

const inprint_prefix = "@" + "INPRINT";
exports.inprint_prefix = inprint_prefix;
const startPrefix = "_START";
exports.startPrefix = startPrefix;
const endPrefix = "_END";
exports.endPrefix = endPrefix;
const usageNotice = `
USAGE:

// ${inprint_prefix}_START {...any_json_params...}
// Generated code will go here
// ${inprint_prefix}_END
`;
exports.usageNotice = usageNotice;

const writeFileSyncIfChanged = (fileName, content) => {
  let current;

  try {
    current = (0, _fs.readFileSync)(fileName, "utf-8");
  } catch (e) {}

  if (current !== content) {
    (0, _fs.writeFileSync)(fileName, content, "utf-8");
    return true;
  }

  return false;
};

exports.writeFileSyncIfChanged = writeFileSyncIfChanged;

function inprintFunction(params0) {
  const {
    content
  } = params0,
        params = _objectWithoutProperties(params0, ["content"]);

  return "    // " + JSON.stringify(params);
}

const defaultInprintOptions = {
  skipNodeModules: true,
  files: ["src/**/*.{ts,cts,mts,tsx,js,jsx,cjs,mjs}"],
  logging: "short"
};
exports.defaultInprintOptions = defaultInprintOptions;

function handleFile(filePath, options) {
  const contentStr = (0, _fs.readFileSync)(filePath, "utf-8");
  if (!contentStr.includes(inprint_prefix)) return false;
  const [fileHeader, ...parts0] = contentStr.split(inprint_prefix);
  const parts = [];

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

      const params = _objectSpread({
        content: middle,
        absolutePath: filePath
      }, _json.default.parse(paramsStr));

      parts.push({
        header,
        params,
        middle,
        tail,
        newMiddle: ""
      });
    } catch (e) {
      console.error(`CODE00000003 INPRINT_ERROR ${e.message} in ${filePath}`);
      return false;
    }
  }

  for (let part of parts) {
    try {
      part.newMiddle = inprintFunction(part.params);
    } catch (e) {
      part.newMiddle = `// INPRINT_FAILED because of exception:\n${e.message || "NO_ERROR_MESSAGE"}\\n${e.stack || "NO_STACK_TRACE"}`.split("\n").join("\n//     ");
    }
  }

  const newContent = fileHeader + inprint_prefix + parts.map(p => `${p.header}\n${p.newMiddle}\n${p.tail}`).join(inprint_prefix);
  writeFileSyncIfChanged(filePath, newContent);
  return true;
} // const testFilePath = `D:\\b\\Mine\\GIT_Work\\yatasks_one_api\\src\\inprintTestFile.ts`;
// handleFile(testFilePath);


function run(options0) {
  if (process.argv[2] === "--version" || process.argv[2] === "-v") {
    // @ts-ignore
    console.log("1.0.8");
    return;
  }

  let optionsPath = undefined;

  try {
    if (!options0) {
      optionsPath = process.argv[2];
      options0 = require(optionsPath);
    }
  } catch (e) {}

  try {
    if (!options0) {
      optionsPath = (0, _path.resolve)(process.cwd(), "inprint.cjs");
      options0 = require(optionsPath);
    }
  } catch (e) {}

  try {
    if (!options0) {
      optionsPath = (0, _path.resolve)(process.cwd(), "inprint.js");
      options0 = require(optionsPath);
    }
  } catch (e) {}

  if (!options0) {
    console.error(`CODE00000004 INPRINT_ERROR Couldn't find options file. Create inprint.cjs or specify path to options in command line argument`);
  } else {
    const options = _objectSpread(_objectSpread({}, defaultInprintOptions), options0);

    let processedCount = 0;

    (async () => {
      if (options.logging) console.log(`CODE00000005 INPRINT options from ${optionsPath}`);
      const paths = await (0, _globby.default)(options.files);

      for (let filePath of paths) {
        if (options.logging === "files") console.log(`CODE00000006 INPRINT ${filePath}`);
        if (filePath.includes("node_modules") && options.skipNodeModules) continue;
        if (handleFile(filePath, options)) processedCount++;
      }

      if (options.logging) console.log(`CODE00000007 INPRINT finished, ${paths.length} - total files, ${processedCount} - processed, ${paths.length - processedCount} - skipped`);
    })();
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbnByaW50LnRzIl0sIm5hbWVzIjpbImlucHJpbnRfcHJlZml4Iiwic3RhcnRQcmVmaXgiLCJlbmRQcmVmaXgiLCJ1c2FnZU5vdGljZSIsIndyaXRlRmlsZVN5bmNJZkNoYW5nZWQiLCJmaWxlTmFtZSIsImNvbnRlbnQiLCJjdXJyZW50IiwiZSIsImlucHJpbnRGdW5jdGlvbiIsInBhcmFtczAiLCJwYXJhbXMiLCJKU09OIiwic3RyaW5naWZ5IiwiZGVmYXVsdElucHJpbnRPcHRpb25zIiwic2tpcE5vZGVNb2R1bGVzIiwiZmlsZXMiLCJsb2dnaW5nIiwiaGFuZGxlRmlsZSIsImZpbGVQYXRoIiwib3B0aW9ucyIsImNvbnRlbnRTdHIiLCJpbmNsdWRlcyIsImZpbGVIZWFkZXIiLCJwYXJ0czAiLCJzcGxpdCIsInBhcnRzIiwiaSIsImxlbmd0aCIsInMiLCJzdGFydHNXaXRoIiwiY29uc29sZSIsImVycm9yIiwiaGVhZGVyIiwibWlkZGxlUGFydHMiLCJsYXN0UGFydCIsInBvcCIsInBhcmFtc1N0ciIsInN1YnN0ciIsInRyaW0iLCJtaWRkbGUiLCJqb2luIiwidGFpbCIsImFic29sdXRlUGF0aCIsIkpTT041IiwicGFyc2UiLCJwdXNoIiwibmV3TWlkZGxlIiwibWVzc2FnZSIsInBhcnQiLCJzdGFjayIsIm5ld0NvbnRlbnQiLCJtYXAiLCJwIiwicnVuIiwib3B0aW9uczAiLCJwcm9jZXNzIiwiYXJndiIsImxvZyIsIm9wdGlvbnNQYXRoIiwidW5kZWZpbmVkIiwicmVxdWlyZSIsImN3ZCIsInByb2Nlc3NlZENvdW50IiwicGF0aHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7QUFFTyxNQUFNQSxjQUFjLEdBQUcsTUFBTSxTQUE3Qjs7QUFDQSxNQUFNQyxXQUFXLEdBQUcsUUFBcEI7O0FBQ0EsTUFBTUMsU0FBUyxHQUFHLE1BQWxCOztBQUNBLE1BQU1DLFdBQVcsR0FBSTtBQUM1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dUIsbUNBQVFOLHFCQUFSLEdBQWtDeUMsUUFBbEMsQ0FBN0I7O0FBQ0EsUUFBSVEsY0FBYyxHQUFHLENBQXJCOztBQUNBLEtBQUMsWUFBWTtBQUNULFVBQUkzQyxPQUFPLENBQUNILE9BQVosRUFBcUJjLE9BQU8sQ0FBQzJCLEdBQVIsQ0FBYSxxQ0FBb0NDLFdBQVksRUFBN0Q7QUFDckIsWUFBTUssS0FBSyxHQUFHLE1BQU0scUJBQU81QyxPQUFPLENBQUNKLEtBQWYsQ0FBcEI7O0FBRUEsV0FBSyxJQUFJRyxRQUFULElBQXFCNkMsS0FBckIsRUFBNEI7QUFDeEIsWUFBSTVDLE9BQU8sQ0FBQ0gsT0FBUixLQUFvQixPQUF4QixFQUFpQ2MsT0FBTyxDQUFDMkIsR0FBUixDQUFhLHdCQUF1QnZDLFFBQVMsRUFBN0M7QUFDakMsWUFBSUEsUUFBUSxDQUFDRyxRQUFULENBQWtCLGNBQWxCLEtBQXFDRixPQUFPLENBQUNMLGVBQWpELEVBQWtFO0FBQ2xFLFlBQUlHLFVBQVUsQ0FBQ0MsUUFBRCxFQUFXQyxPQUFYLENBQWQsRUFBbUMyQyxjQUFjO0FBQ3BEOztBQUNELFVBQUkzQyxPQUFPLENBQUNILE9BQVosRUFDSWMsT0FBTyxDQUFDMkIsR0FBUixDQUNLLGtDQUFpQ00sS0FBSyxDQUFDcEMsTUFBTyxtQkFBa0JtQyxjQUFlLGlCQUM1RUMsS0FBSyxDQUFDcEMsTUFBTixHQUFlbUMsY0FDbEIsWUFITDtBQUtQLEtBZkQ7QUFnQkg7QUFDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBKU09ONSBmcm9tIFwianNvbjVcIjtcbmltcG9ydCBnbG9iYnkgZnJvbSBcImdsb2JieVwiO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IGNvbnN0IGlucHJpbnRfcHJlZml4ID0gXCJAXCIgKyBcIklOUFJJTlRcIjtcbmV4cG9ydCBjb25zdCBzdGFydFByZWZpeCA9IFwiX1NUQVJUXCI7XG5leHBvcnQgY29uc3QgZW5kUHJlZml4ID0gXCJfRU5EXCI7XG5leHBvcnQgY29uc3QgdXNhZ2VOb3RpY2UgPSBgXG5VU0FHRTpcblxuLy8gJHtpbnByaW50X3ByZWZpeH1fU1RBUlQgey4uLmFueV9qc29uX3BhcmFtcy4uLn1cbi8vIEdlbmVyYXRlZCBjb2RlIHdpbGwgZ28gaGVyZVxuLy8gJHtpbnByaW50X3ByZWZpeH1fRU5EXG5gO1xuXG5pbnRlcmZhY2UgSW5wcmludEZpbGVQYXJ0IHtcbiAgICBoZWFkZXI6IHN0cmluZztcbiAgICBwYXJhbXM6IGFueTtcbiAgICBtaWRkbGU6IHN0cmluZztcbiAgICB0YWlsOiBzdHJpbmc7XG4gICAgbmV3TWlkZGxlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCB3cml0ZUZpbGVTeW5jSWZDaGFuZ2VkID0gKGZpbGVOYW1lOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZykgPT4ge1xuICAgIGxldCBjdXJyZW50OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgdHJ5IHtcbiAgICAgICAgY3VycmVudCA9IHJlYWRGaWxlU3luYyhmaWxlTmFtZSwgXCJ1dGYtOFwiKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuXG4gICAgaWYgKGN1cnJlbnQgIT09IGNvbnRlbnQpIHtcbiAgICAgICAgd3JpdGVGaWxlU3luYyhmaWxlTmFtZSwgY29udGVudCwgXCJ1dGYtOFwiKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnByaW50RnVuY3Rpb24ocGFyYW1zMDogYW55KSB7XG4gICAgY29uc3QgeyBjb250ZW50LCAuLi5wYXJhbXMgfSA9IHBhcmFtczA7XG4gICAgcmV0dXJuIFwiICAgIC8vIFwiICsgSlNPTi5zdHJpbmdpZnkocGFyYW1zKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbnByaW50T3B0aW9ucyB7XG4gICAgc2tpcE5vZGVNb2R1bGVzOiBib29sZWFuO1xuICAgIGZpbGVzOiBzdHJpbmcgfCBzdHJpbmdbXTtcbiAgICBsb2dnaW5nOiBcInNob3J0XCIgfCBcImZpbGVzXCIgfCBmYWxzZTtcbn1cblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRJbnByaW50T3B0aW9ucyA9IHtcbiAgICBza2lwTm9kZU1vZHVsZXM6IHRydWUsXG4gICAgZmlsZXM6IFtcInNyYy8qKi8qLnt0cyxjdHMsbXRzLHRzeCxqcyxqc3gsY2pzLG1qc31cIl0sXG4gICAgbG9nZ2luZzogXCJzaG9ydFwiLFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZUZpbGUoZmlsZVBhdGg6IHN0cmluZywgb3B0aW9uczogSW5wcmludE9wdGlvbnMpOiBib29sZWFuIHtcbiAgICBjb25zdCBjb250ZW50U3RyID0gcmVhZEZpbGVTeW5jKGZpbGVQYXRoLCBcInV0Zi04XCIpO1xuXG4gICAgaWYgKCFjb250ZW50U3RyLmluY2x1ZGVzKGlucHJpbnRfcHJlZml4KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgW2ZpbGVIZWFkZXIsIC4uLnBhcnRzMF0gPSBjb250ZW50U3RyLnNwbGl0KGlucHJpbnRfcHJlZml4KTtcbiAgICBjb25zdCBwYXJ0czogSW5wcmludEZpbGVQYXJ0W10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRzMC5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICBjb25zdCBzID0gcGFydHMwW2ldO1xuICAgICAgICBpZiAoIXMuc3RhcnRzV2l0aChzdGFydFByZWZpeCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYENPREUwMDAwMDAwMSBJTlBSSU5UX0VSUk9SIE5vICR7aW5wcmludF9wcmVmaXh9JHtzdGFydFByZWZpeH0gaW4gJHtmaWxlUGF0aH1gKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFydHMwW2kgKyAxXS5zdGFydHNXaXRoKGVuZFByZWZpeCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYENPREUwMDAwMDAwMiBJTlBSSU5UX0VSUk9SIE5vICR7aW5wcmludF9wcmVmaXh9JHtlbmRQcmVmaXh9IGluICR7ZmlsZVBhdGh9YCk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgW2hlYWRlciwgLi4ubWlkZGxlUGFydHNdID0gcy5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RQYXJ0ID0gbWlkZGxlUGFydHMucG9wKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHBhcmFtc1N0ciA9IGhlYWRlci5zdWJzdHIoc3RhcnRQcmVmaXgubGVuZ3RoKS50cmltKCk7XG4gICAgICAgICAgICBjb25zdCBtaWRkbGUgPSBtaWRkbGVQYXJ0cy5qb2luKFwiXFxuXCIpO1xuICAgICAgICAgICAgY29uc3QgdGFpbCA9IGxhc3RQYXJ0ICsgaW5wcmludF9wcmVmaXggKyBwYXJ0czBbaSArIDFdO1xuXG4gICAgICAgICAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgICAgICAgICAgY29udGVudDogbWlkZGxlLFxuICAgICAgICAgICAgICAgIGFic29sdXRlUGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgLi4uSlNPTjUucGFyc2UocGFyYW1zU3RyKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwYXJ0cy5wdXNoKHsgaGVhZGVyLCBwYXJhbXMsIG1pZGRsZSwgdGFpbCwgbmV3TWlkZGxlOiBcIlwiIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBDT0RFMDAwMDAwMDMgSU5QUklOVF9FUlJPUiAke2UubWVzc2FnZX0gaW4gJHtmaWxlUGF0aH1gKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAobGV0IHBhcnQgb2YgcGFydHMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBhcnQubmV3TWlkZGxlID0gaW5wcmludEZ1bmN0aW9uKHBhcnQucGFyYW1zKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcGFydC5uZXdNaWRkbGUgPSBgLy8gSU5QUklOVF9GQUlMRUQgYmVjYXVzZSBvZiBleGNlcHRpb246XFxuJHtlLm1lc3NhZ2UgfHwgXCJOT19FUlJPUl9NRVNTQUdFXCJ9XFxcXG4ke1xuICAgICAgICAgICAgICAgIGUuc3RhY2sgfHwgXCJOT19TVEFDS19UUkFDRVwiXG4gICAgICAgICAgICB9YFxuICAgICAgICAgICAgICAgIC5zcGxpdChcIlxcblwiKVxuICAgICAgICAgICAgICAgIC5qb2luKFwiXFxuLy8gICAgIFwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IG5ld0NvbnRlbnQgPVxuICAgICAgICBmaWxlSGVhZGVyICsgaW5wcmludF9wcmVmaXggKyBwYXJ0cy5tYXAoKHApID0+IGAke3AuaGVhZGVyfVxcbiR7cC5uZXdNaWRkbGV9XFxuJHtwLnRhaWx9YCkuam9pbihpbnByaW50X3ByZWZpeCk7XG4gICAgd3JpdGVGaWxlU3luY0lmQ2hhbmdlZChmaWxlUGF0aCwgbmV3Q29udGVudCk7XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbi8vIGNvbnN0IHRlc3RGaWxlUGF0aCA9IGBEOlxcXFxiXFxcXE1pbmVcXFxcR0lUX1dvcmtcXFxceWF0YXNrc19vbmVfYXBpXFxcXHNyY1xcXFxpbnByaW50VGVzdEZpbGUudHNgO1xuLy8gaGFuZGxlRmlsZSh0ZXN0RmlsZVBhdGgpO1xuXG5leHBvcnQgZnVuY3Rpb24gcnVuKG9wdGlvbnMwPzogSW5wcmludE9wdGlvbnMgfCB1bmRlZmluZWQpIHtcbiAgICBpZiAocHJvY2Vzcy5hcmd2WzJdID09PSBcIi0tdmVyc2lvblwiIHx8IHByb2Nlc3MuYXJndlsyXSA9PT0gXCItdlwiKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgY29uc29sZS5sb2coX19WRVJTSU9OX18pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IG9wdGlvbnNQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKCFvcHRpb25zMCkge1xuICAgICAgICAgICAgb3B0aW9uc1BhdGggPSBwcm9jZXNzLmFyZ3ZbMl07XG4gICAgICAgICAgICBvcHRpb25zMCA9IHJlcXVpcmUob3B0aW9uc1BhdGgpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge31cblxuICAgIHRyeSB7XG4gICAgICAgIGlmICghb3B0aW9uczApIHtcbiAgICAgICAgICAgIG9wdGlvbnNQYXRoID0gcmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBcImlucHJpbnQuY2pzXCIpO1xuICAgICAgICAgICAgb3B0aW9uczAgPSByZXF1aXJlKG9wdGlvbnNQYXRoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICB0cnkge1xuICAgICAgICBpZiAoIW9wdGlvbnMwKSB7XG4gICAgICAgICAgICBvcHRpb25zUGF0aCA9IHJlc29sdmUocHJvY2Vzcy5jd2QoKSwgXCJpbnByaW50LmpzXCIpO1xuICAgICAgICAgICAgb3B0aW9uczAgPSByZXF1aXJlKG9wdGlvbnNQYXRoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICBpZiAoIW9wdGlvbnMwKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICBgQ09ERTAwMDAwMDA0IElOUFJJTlRfRVJST1IgQ291bGRuJ3QgZmluZCBvcHRpb25zIGZpbGUuIENyZWF0ZSBpbnByaW50LmNqcyBvciBzcGVjaWZ5IHBhdGggdG8gb3B0aW9ucyBpbiBjb21tYW5kIGxpbmUgYXJndW1lbnRgXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uczogSW5wcmludE9wdGlvbnMgPSB7IC4uLmRlZmF1bHRJbnByaW50T3B0aW9ucywgLi4ub3B0aW9uczAgfTtcbiAgICAgICAgbGV0IHByb2Nlc3NlZENvdW50ID0gMDtcbiAgICAgICAgKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmxvZ2dpbmcpIGNvbnNvbGUubG9nKGBDT0RFMDAwMDAwMDUgSU5QUklOVCBvcHRpb25zIGZyb20gJHtvcHRpb25zUGF0aH1gKTtcbiAgICAgICAgICAgIGNvbnN0IHBhdGhzID0gYXdhaXQgZ2xvYmJ5KG9wdGlvbnMuZmlsZXMpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBmaWxlUGF0aCBvZiBwYXRocykge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmxvZ2dpbmcgPT09IFwiZmlsZXNcIikgY29uc29sZS5sb2coYENPREUwMDAwMDAwNiBJTlBSSU5UICR7ZmlsZVBhdGh9YCk7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzXCIpICYmIG9wdGlvbnMuc2tpcE5vZGVNb2R1bGVzKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlRmlsZShmaWxlUGF0aCwgb3B0aW9ucykpIHByb2Nlc3NlZENvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5sb2dnaW5nKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgICAgICBgQ09ERTAwMDAwMDA3IElOUFJJTlQgZmluaXNoZWQsICR7cGF0aHMubGVuZ3RofSAtIHRvdGFsIGZpbGVzLCAke3Byb2Nlc3NlZENvdW50fSAtIHByb2Nlc3NlZCwgJHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhzLmxlbmd0aCAtIHByb2Nlc3NlZENvdW50XG4gICAgICAgICAgICAgICAgICAgIH0gLSBza2lwcGVkYFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH0pKCk7XG4gICAgfVxufVxuIl19