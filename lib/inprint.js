"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
      part.newMiddle = options.inprint(part.params);
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
    console.log("1.0.12");
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

    if (!options.inprint) {
      console.error(`CODE00000012 INPRINT_ERROR no 'inprint' function specified!`);
      return false;
    }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbnByaW50LnRzIl0sIm5hbWVzIjpbImlucHJpbnRfcHJlZml4Iiwic3RhcnRQcmVmaXgiLCJlbmRQcmVmaXgiLCJ1c2FnZU5vdGljZSIsIndyaXRlRmlsZVN5bmNJZkNoYW5nZWQiLCJmaWxlTmFtZSIsImNvbnRlbnQiLCJjdXJyZW50IiwiZSIsImRlZmF1bHRJbnByaW50T3B0aW9ucyIsInNraXBOb2RlTW9kdWxlcyIsImZpbGVzIiwibG9nZ2luZyIsImhhbmRsZUZpbGUiLCJmaWxlUGF0aCIsIm9wdGlvbnMiLCJjb250ZW50U3RyIiwiaW5jbHVkZXMiLCJmaWxlSGVhZGVyIiwicGFydHMwIiwic3BsaXQiLCJwYXJ0cyIsImkiLCJsZW5ndGgiLCJzIiwic3RhcnRzV2l0aCIsImNvbnNvbGUiLCJlcnJvciIsImhlYWRlciIsIm1pZGRsZVBhcnRzIiwibGFzdFBhcnQiLCJwb3AiLCJwYXJhbXNTdHIiLCJzdWJzdHIiLCJ0cmltIiwibWlkZGxlIiwiam9pbiIsInRhaWwiLCJwYXJhbXMiLCJhYnNvbHV0ZVBhdGgiLCJKU09ONSIsInBhcnNlIiwicHVzaCIsIm5ld01pZGRsZSIsIm1lc3NhZ2UiLCJwYXJ0IiwiaW5wcmludCIsInN0YWNrIiwibmV3Q29udGVudCIsIm1hcCIsInAiLCJydW4iLCJvcHRpb25zMCIsInByb2Nlc3MiLCJhcmd2IiwibG9nIiwib3B0aW9uc1BhdGgiLCJ1bmRlZmluZWQiLCJyZXF1aXJlIiwiY3dkIiwicHJvY2Vzc2VkQ291bnQiLCJwYXRocyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUFFTyxNQUFNQSxjQUFjLEdBQUcsTUFBTSxTQUE3Qjs7QUFDQSxNQUFNQyxXQUFXLEdBQUcsUUFBcEI7O0FBQ0EsTUFBTUMsU0FBUyxHQUFHLE1BQWxCOztBQUNBLE1BQU1DLFdBQVcsR0FBSTtBQUM1QjtBQUNBO0FBQ0EsS0FBS0gsY0FBZTtBQUNwQjtBQUNBLEtBQUtBLGNB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QUFPLENBQUNILE9BQVosRUFBcUJjLE9BQU8sQ0FBQzZCLEdBQVIsQ0FBYSxxQ0FBb0NDLFdBQVksRUFBN0Q7QUFDckIsWUFBTUssS0FBSyxHQUFHLE1BQU0scUJBQU85QyxPQUFPLENBQUNKLEtBQWYsQ0FBcEI7O0FBRUEsV0FBSyxJQUFJRyxRQUFULElBQXFCK0MsS0FBckIsRUFBNEI7QUFDeEIsWUFBSTlDLE9BQU8sQ0FBQ0gsT0FBUixLQUFvQixPQUF4QixFQUFpQ2MsT0FBTyxDQUFDNkIsR0FBUixDQUFhLHdCQUF1QnpDLFFBQVMsRUFBN0M7QUFDakMsWUFBSUEsUUFBUSxDQUFDRyxRQUFULENBQWtCLGNBQWxCLEtBQXFDRixPQUFPLENBQUNMLGVBQWpELEVBQWtFO0FBQ2xFLFlBQUlHLFVBQVUsQ0FBQ0MsUUFBRCxFQUFXQyxPQUFYLENBQWQsRUFBbUM2QyxjQUFjO0FBQ3BEOztBQUNELFVBQUk3QyxPQUFPLENBQUNILE9BQVosRUFDSWMsT0FBTyxDQUFDNkIsR0FBUixDQUNLLGtDQUFpQ00sS0FBSyxDQUFDdEMsTUFBTyxtQkFBa0JxQyxjQUFlLGlCQUM1RUMsS0FBSyxDQUFDdEMsTUFBTixHQUFlcUMsY0FDbEIsWUFITDtBQUtQLEtBZkQ7QUFnQkg7QUFDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBKU09ONSBmcm9tIFwianNvbjVcIjtcbmltcG9ydCBnbG9iYnkgZnJvbSBcImdsb2JieVwiO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IGNvbnN0IGlucHJpbnRfcHJlZml4ID0gXCJAXCIgKyBcIklOUFJJTlRcIjtcbmV4cG9ydCBjb25zdCBzdGFydFByZWZpeCA9IFwiX1NUQVJUXCI7XG5leHBvcnQgY29uc3QgZW5kUHJlZml4ID0gXCJfRU5EXCI7XG5leHBvcnQgY29uc3QgdXNhZ2VOb3RpY2UgPSBgXG5VU0FHRTpcblxuLy8gJHtpbnByaW50X3ByZWZpeH1fU1RBUlQgey4uLmFueV9qc29uX3BhcmFtcy4uLn1cbi8vIEdlbmVyYXRlZCBjb2RlIHdpbGwgZ28gaGVyZVxuLy8gJHtpbnByaW50X3ByZWZpeH1fRU5EXG5gO1xuXG5pbnRlcmZhY2UgSW5wcmludEZpbGVQYXJ0IHtcbiAgICBoZWFkZXI6IHN0cmluZztcbiAgICBwYXJhbXM6IGFueTtcbiAgICBtaWRkbGU6IHN0cmluZztcbiAgICB0YWlsOiBzdHJpbmc7XG4gICAgbmV3TWlkZGxlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCB3cml0ZUZpbGVTeW5jSWZDaGFuZ2VkID0gKGZpbGVOYW1lOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZykgPT4ge1xuICAgIGxldCBjdXJyZW50OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgdHJ5IHtcbiAgICAgICAgY3VycmVudCA9IHJlYWRGaWxlU3luYyhmaWxlTmFtZSwgXCJ1dGYtOFwiKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuXG4gICAgaWYgKGN1cnJlbnQgIT09IGNvbnRlbnQpIHtcbiAgICAgICAgd3JpdGVGaWxlU3luYyhmaWxlTmFtZSwgY29udGVudCwgXCJ1dGYtOFwiKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW5wcmludE9wdGlvbnMge1xuICAgIHNraXBOb2RlTW9kdWxlczogYm9vbGVhbjtcbiAgICBmaWxlczogc3RyaW5nIHwgc3RyaW5nW107XG4gICAgbG9nZ2luZzogXCJzaG9ydFwiIHwgXCJmaWxlc1wiIHwgZmFsc2U7XG4gICAgaW5wcmludDogKHBhcmFtczogYW55KSA9PiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0SW5wcmludE9wdGlvbnMgPSB7XG4gICAgc2tpcE5vZGVNb2R1bGVzOiB0cnVlLFxuICAgIGZpbGVzOiBbXCJzcmMvKiovKi57dHMsY3RzLG10cyx0c3gsanMsanN4LGNqcyxtanN9XCJdLFxuICAgIGxvZ2dpbmc6IFwic2hvcnRcIixcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVGaWxlKGZpbGVQYXRoOiBzdHJpbmcsIG9wdGlvbnM6IElucHJpbnRPcHRpb25zKTogYm9vbGVhbiB7XG4gICAgY29uc3QgY29udGVudFN0ciA9IHJlYWRGaWxlU3luYyhmaWxlUGF0aCwgXCJ1dGYtOFwiKTtcblxuICAgIGlmICghY29udGVudFN0ci5pbmNsdWRlcyhpbnByaW50X3ByZWZpeCkpIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IFtmaWxlSGVhZGVyLCAuLi5wYXJ0czBdID0gY29udGVudFN0ci5zcGxpdChpbnByaW50X3ByZWZpeCk7XG4gICAgY29uc3QgcGFydHM6IElucHJpbnRGaWxlUGFydFtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJ0czAubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgY29uc3QgcyA9IHBhcnRzMFtpXTtcbiAgICAgICAgaWYgKCFzLnN0YXJ0c1dpdGgoc3RhcnRQcmVmaXgpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBDT0RFMDAwMDAwMDEgSU5QUklOVF9FUlJPUiBObyAke2lucHJpbnRfcHJlZml4fSR7c3RhcnRQcmVmaXh9IGluICR7ZmlsZVBhdGh9YCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXBhcnRzMFtpICsgMV0uc3RhcnRzV2l0aChlbmRQcmVmaXgpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBDT0RFMDAwMDAwMDIgSU5QUklOVF9FUlJPUiBObyAke2lucHJpbnRfcHJlZml4fSR7ZW5kUHJlZml4fSBpbiAke2ZpbGVQYXRofWApO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IFtoZWFkZXIsIC4uLm1pZGRsZVBhcnRzXSA9IHMuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgICAgICBjb25zdCBsYXN0UGFydCA9IG1pZGRsZVBhcnRzLnBvcCgpO1xuXG4gICAgICAgICAgICBjb25zdCBwYXJhbXNTdHIgPSBoZWFkZXIuc3Vic3RyKHN0YXJ0UHJlZml4Lmxlbmd0aCkudHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgbWlkZGxlID0gbWlkZGxlUGFydHMuam9pbihcIlxcblwiKTtcbiAgICAgICAgICAgIGNvbnN0IHRhaWwgPSBsYXN0UGFydCArIGlucHJpbnRfcHJlZml4ICsgcGFydHMwW2kgKyAxXTtcblxuICAgICAgICAgICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IG1pZGRsZSxcbiAgICAgICAgICAgICAgICBhYnNvbHV0ZVBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgIC4uLkpTT041LnBhcnNlKHBhcmFtc1N0ciksXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcGFydHMucHVzaCh7IGhlYWRlciwgcGFyYW1zLCBtaWRkbGUsIHRhaWwsIG5ld01pZGRsZTogXCJcIiB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQ09ERTAwMDAwMDAzIElOUFJJTlRfRVJST1IgJHtlLm1lc3NhZ2V9IGluICR7ZmlsZVBhdGh9YCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGxldCBwYXJ0IG9mIHBhcnRzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwYXJ0Lm5ld01pZGRsZSA9IG9wdGlvbnMuaW5wcmludChwYXJ0LnBhcmFtcyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHBhcnQubmV3TWlkZGxlID0gYC8vIElOUFJJTlRfRkFJTEVEIGJlY2F1c2Ugb2YgZXhjZXB0aW9uOlxcbiR7ZS5tZXNzYWdlIHx8IFwiTk9fRVJST1JfTUVTU0FHRVwifVxcXFxuJHtcbiAgICAgICAgICAgICAgICBlLnN0YWNrIHx8IFwiTk9fU1RBQ0tfVFJBQ0VcIlxuICAgICAgICAgICAgfWBcbiAgICAgICAgICAgICAgICAuc3BsaXQoXCJcXG5cIilcbiAgICAgICAgICAgICAgICAuam9pbihcIlxcbi8vICAgICBcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBuZXdDb250ZW50ID1cbiAgICAgICAgZmlsZUhlYWRlciArIGlucHJpbnRfcHJlZml4ICsgcGFydHMubWFwKChwKSA9PiBgJHtwLmhlYWRlcn1cXG4ke3AubmV3TWlkZGxlfVxcbiR7cC50YWlsfWApLmpvaW4oaW5wcmludF9wcmVmaXgpO1xuICAgIHdyaXRlRmlsZVN5bmNJZkNoYW5nZWQoZmlsZVBhdGgsIG5ld0NvbnRlbnQpO1xuICAgIHJldHVybiB0cnVlO1xufVxuXG4vLyBjb25zdCB0ZXN0RmlsZVBhdGggPSBgRDpcXFxcYlxcXFxNaW5lXFxcXEdJVF9Xb3JrXFxcXHlhdGFza3Nfb25lX2FwaVxcXFxzcmNcXFxcaW5wcmludFRlc3RGaWxlLnRzYDtcbi8vIGhhbmRsZUZpbGUodGVzdEZpbGVQYXRoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJ1bihvcHRpb25zMD86IElucHJpbnRPcHRpb25zIHwgdW5kZWZpbmVkKSB7XG4gICAgaWYgKHByb2Nlc3MuYXJndlsyXSA9PT0gXCItLXZlcnNpb25cIiB8fCBwcm9jZXNzLmFyZ3ZbMl0gPT09IFwiLXZcIikge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGNvbnNvbGUubG9nKF9fVkVSU0lPTl9fKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBvcHRpb25zUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIHRyeSB7XG4gICAgICAgIGlmICghb3B0aW9uczApIHtcbiAgICAgICAgICAgIG9wdGlvbnNQYXRoID0gcHJvY2Vzcy5hcmd2WzJdO1xuICAgICAgICAgICAgb3B0aW9uczAgPSByZXF1aXJlKG9wdGlvbnNQYXRoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICB0cnkge1xuICAgICAgICBpZiAoIW9wdGlvbnMwKSB7XG4gICAgICAgICAgICBvcHRpb25zUGF0aCA9IHJlc29sdmUocHJvY2Vzcy5jd2QoKSwgXCJpbnByaW50LmNqc1wiKTtcbiAgICAgICAgICAgIG9wdGlvbnMwID0gcmVxdWlyZShvcHRpb25zUGF0aCk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7fVxuXG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKCFvcHRpb25zMCkge1xuICAgICAgICAgICAgb3B0aW9uc1BhdGggPSByZXNvbHZlKHByb2Nlc3MuY3dkKCksIFwiaW5wcmludC5qc1wiKTtcbiAgICAgICAgICAgIG9wdGlvbnMwID0gcmVxdWlyZShvcHRpb25zUGF0aCk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7fVxuXG4gICAgaWYgKCFvcHRpb25zMCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgICAgYENPREUwMDAwMDAwNCBJTlBSSU5UX0VSUk9SIENvdWxkbid0IGZpbmQgb3B0aW9ucyBmaWxlLiBDcmVhdGUgaW5wcmludC5janMgb3Igc3BlY2lmeSBwYXRoIHRvIG9wdGlvbnMgaW4gY29tbWFuZCBsaW5lIGFyZ3VtZW50YFxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IElucHJpbnRPcHRpb25zID0geyAuLi5kZWZhdWx0SW5wcmludE9wdGlvbnMsIC4uLm9wdGlvbnMwIH07XG4gICAgICAgIGlmICghb3B0aW9ucy5pbnByaW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBDT0RFMDAwMDAwMTIgSU5QUklOVF9FUlJPUiBubyAnaW5wcmludCcgZnVuY3Rpb24gc3BlY2lmaWVkIWApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHByb2Nlc3NlZENvdW50ID0gMDtcbiAgICAgICAgKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmxvZ2dpbmcpIGNvbnNvbGUubG9nKGBDT0RFMDAwMDAwMDUgSU5QUklOVCBvcHRpb25zIGZyb20gJHtvcHRpb25zUGF0aH1gKTtcbiAgICAgICAgICAgIGNvbnN0IHBhdGhzID0gYXdhaXQgZ2xvYmJ5KG9wdGlvbnMuZmlsZXMpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBmaWxlUGF0aCBvZiBwYXRocykge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmxvZ2dpbmcgPT09IFwiZmlsZXNcIikgY29uc29sZS5sb2coYENPREUwMDAwMDAwNiBJTlBSSU5UICR7ZmlsZVBhdGh9YCk7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzXCIpICYmIG9wdGlvbnMuc2tpcE5vZGVNb2R1bGVzKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlRmlsZShmaWxlUGF0aCwgb3B0aW9ucykpIHByb2Nlc3NlZENvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5sb2dnaW5nKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgICAgICBgQ09ERTAwMDAwMDA3IElOUFJJTlQgZmluaXNoZWQsICR7cGF0aHMubGVuZ3RofSAtIHRvdGFsIGZpbGVzLCAke3Byb2Nlc3NlZENvdW50fSAtIHByb2Nlc3NlZCwgJHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhzLmxlbmd0aCAtIHByb2Nlc3NlZENvdW50XG4gICAgICAgICAgICAgICAgICAgIH0gLSBza2lwcGVkYFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH0pKCk7XG4gICAgfVxufVxuIl19