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
  files: ["src/**/*.{ts,tsx,js,jsx}"],
  logging: "short"
};
exports.defaultInprintOptions = defaultInprintOptions;

function handleFile(filePath, options) {
  const contentStr = (0, _fs.readFileSync)(filePath, "utf-8");
  if (!contentStr.includes(inprint_prefix)) return;
  const [fileHeader, ...parts0] = contentStr.split(inprint_prefix);
  const parts = [];

  for (let i = 0; i < parts0.length; i += 2) {
    const s = parts0[i];

    if (!s.startsWith(startPrefix)) {
      console.error(`CODE00000001 INPRINT_ERROR No ${inprint_prefix}${startPrefix} in ${filePath}`);
      return;
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
      return;
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
} // const testFilePath = `D:\\b\\Mine\\GIT_Work\\yatasks_one_api\\src\\inprintTestFile.ts`;
// handleFile(testFilePath);


function run(options0) {
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

    (async () => {
      if (options.logging) console.log(`CODE00000005 INPRINT options from ${optionsPath}`);
      const paths = await (0, _globby.default)(options.files);

      for (let filePath of paths) {
        if (options.logging === "files") console.log(`CODE00000006 INPRINT ${filePath}`);
        if (filePath.includes("node_modules") && options.skipNodeModules) continue;
        handleFile(filePath, options);
      }

      if (options.logging) console.log(`CODE00000007 INPRINT finished, ${paths.length} - files`); //=> ['unicorn', 'rainbow']
    })();
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbnByaW50LnRzIl0sIm5hbWVzIjpbImlucHJpbnRfcHJlZml4Iiwic3RhcnRQcmVmaXgiLCJlbmRQcmVmaXgiLCJ1c2FnZU5vdGljZSIsIndyaXRlRmlsZVN5bmNJZkNoYW5nZWQiLCJmaWxlTmFtZSIsImNvbnRlbnQiLCJjdXJyZW50IiwiZSIsImlucHJpbnRGdW5jdGlvbiIsInBhcmFtczAiLCJwYXJhbXMiLCJKU09OIiwic3RyaW5naWZ5IiwiZGVmYXVsdElucHJpbnRPcHRpb25zIiwic2tpcE5vZGVNb2R1bGVzIiwiZmlsZXMiLCJsb2dnaW5nIiwiaGFuZGxlRmlsZSIsImZpbGVQYXRoIiwib3B0aW9ucyIsImNvbnRlbnRTdHIiLCJpbmNsdWRlcyIsImZpbGVIZWFkZXIiLCJwYXJ0czAiLCJzcGxpdCIsInBhcnRzIiwiaSIsImxlbmd0aCIsInMiLCJzdGFydHNXaXRoIiwiY29uc29sZSIsImVycm9yIiwiaGVhZGVyIiwibWlkZGxlUGFydHMiLCJsYXN0UGFydCIsInBvcCIsInBhcmFtc1N0ciIsInN1YnN0ciIsInRyaW0iLCJtaWRkbGUiLCJqb2luIiwidGFpbCIsImFic29sdXRlUGF0aCIsIkpTT041IiwicGFyc2UiLCJwdXNoIiwibmV3TWlkZGxlIiwibWVzc2FnZSIsInBhcnQiLCJzdGFjayIsIm5ld0NvbnRlbnQiLCJtYXAiLCJwIiwicnVuIiwib3B0aW9uczAiLCJvcHRpb25zUGF0aCIsInVuZGVmaW5lZCIsInByb2Nlc3MiLCJhcmd2IiwicmVxdWlyZSIsImN3ZCIsImxvZyIsInBhdGhzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FBRU8sTUFBTUEsY0FBYyxHQUFHLE1BQU0sU0FBN0I7O0FBQ0EsTUFBTUMsV0FBVyxHQUFHLFFBQXBCOztBQUNBLE1BQU1DLFNBQVMsR0FBRyxNQUFsQjs7QUFDQSxNQUFNQyxXQUFXLEdBQUk7QUFDNUI7QUFDQTtBQUNBLEtBQUtILGNBQWU7QUFDcEI7QUFDQSxLQUFLQSxjQUFlO0FBQ3BCLENBTk87OztBQWdCQSxNQUFNSSxzQkFBc0IsR0FBRyxDQUFDQyxRQUFELEVBQW1CQyxPQUFuQixLQUF1QztBQUN6RSxNQUFJQyxPQUFKOztBQUNBLE1BQUk7QUFDQUEsSUFBQUEsT0FBTyxHQUFHLHNCQUFhRixRQUFiLEVBQXVCLE9BQXZCLENBQVY7QUFDSCxHQUZELENBRUUsT0FBT0csQ0FBUCxFQUFVLENBQUU7O0FBRWQsTUFBSUQsT0FBTyxLQUFLRCxPQUFoQixFQUF5QjtBQUNyQiwyQkFBY0QsUUFBZCxFQUF3QkMsT0FBeEIsRUFBaUMsT0FBakM7QUFDQSxXQUFPLElBQVA7QUFDSDs7QUFDRCxTQUFPLEtBQVA7QUFDSCxDQVhNOzs7O0FBYUEsU0FBU0csZUFBVCxDQUF5QkMsT0FBekIsRUFBdUM7QUFDMUMsUUFBTTtBQUFFSixJQUFBQTtBQUFGLE1BQXlCSSxPQUEvQjtBQUFBLFFBQW9CQyxNQUFwQiw0QkFBK0JELE9BQS9COztBQUNBLFNBQU8sWUFBWUUsSUFBSSxDQUFDQyxTQUFMLENBQWVGLE1BQWYsQ0FBbkI7QUFDSDs7QUFRTSxNQUFNRyxxQkFBcUIsR0FBRztBQUNqQ0MsRUFBQUEsZUFBZSxFQUFFLElBRGdCO0FBRWpDQyxFQUFBQSxLQUFLLEVBQUUsQ0FBQywwQkFBRCxDQUYwQjtBQUdqQ0MsRUFBQUEsT0FBTyxFQUFFO0FBSHdCLENBQTlCOzs7QUFNQSxTQUFTQyxVQUFULENBQW9CQyxRQUFwQixFQUFzQ0MsT0FBdEMsRUFBK0Q7QUFDbEUsUUFBTUMsVUFBVSxHQUFHLHNCQUFhRixRQUFiLEVBQXVCLE9BQXZCLENBQW5CO0FBRUEsTUFBSSxDQUFDRSxVQUFVLENBQUNDLFFBQVgsQ0FBb0J0QixjQUFwQixDQUFMLEVBQTBDO0FBRTFDLFFBQU0sQ0FBQ3VCLFVBQUQsRUFBYSxHQUFHQyxNQUFoQixJQUEwQkgsVUFBVSxDQUFDSSxLQUFYLENBQWlCekIsY0FBakIsQ0FBaEM7QUFDQSxRQUFNMEIsS0FBd0IsR0FBRyxFQUFqQzs7QUFDQSxPQUFLLElBQUlDLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdILE1BQU0sQ0FBQ0ksTUFBM0IsRUFBbUNELENBQUMsSUFBSSxDQUF4QyxFQUEyQztBQUN2QyxVQUFNRSxDQUFDLEdBQUdMLE1BQU0sQ0FBQ0csQ0FBRCxDQUFoQjs7QUFDQSxRQUFJLENBQUNFLENBQUMsQ0FBQ0MsVUFBRixDQUFhN0IsV0FBYixDQUFMLEVBQWdDO0FBQzVCOEIsTUFBQUEsT0FBTyxDQUFDQyxLQUFSLENBQWUsaUNBQWdDaEMsY0FBZSxHQUFFQyxXQUFZLE9BQU1rQixRQUFTLEVBQTNGO0FBQ0E7QUFDSDs7QUFFRCxRQUFJLENBQUNLLE1BQU0sQ0FBQ0csQ0FBQyxHQUFHLENBQUwsQ0FBTixDQUFjRyxVQUFkLENBQXlCNUIsU0FBekIsQ0FBTCxFQUEwQztBQUN0QzZCLE1BQUFBLE9BQU8sQ0FBQ0MsS0FBUixDQUFlLGlDQUFnQ2hDLGNBQWUsR0FBRUUsU0FBVSxPQUFNaUIsUUFBUyxFQUF6RjtBQUNIOztBQUVELFFBQUk7QUFDQSxZQUFNLENBQUNjLE1BQUQsRUFBUyxHQUFHQyxXQUFaLElBQTJCTCxDQUFDLENBQUNKLEtBQUYsQ0FBUSxJQUFSLENBQWpDO0FBQ0EsWUFBTVUsUUFBUSxHQUFHRCxXQUFXLENBQUNFLEdBQVosRUFBakI7QUFFQSxZQUFNQyxTQUFTLEdBQUdKLE1BQU0sQ0FBQ0ssTUFBUCxDQUFjckMsV0FBVyxDQUFDMkIsTUFBMUIsRUFBa0NXLElBQWxDLEVBQWxCO0FBQ0EsWUFBTUMsTUFBTSxHQUFHTixXQUFXLENBQUNPLElBQVosQ0FBaUIsSUFBakIsQ0FBZjtBQUNBLFlBQU1DLElBQUksR0FBR1AsUUFBUSxHQUFHbkMsY0FBWCxHQUE0QndCLE1BQU0sQ0FBQ0csQ0FBQyxHQUFHLENBQUwsQ0FBL0M7O0FBRUEsWUFBTWhCLE1BQU07QUFDUkwsUUFBQUEsT0FBTyxFQUFFa0MsTUFERDtBQUVSRyxRQUFBQSxZQUFZLEVBQUV4QjtBQUZOLFNBR0x5QixjQUFNQyxLQUFOLENBQVlSLFNBQVosQ0FISyxDQUFaOztBQUtBWCxNQUFBQSxLQUFLLENBQUNvQixJQUFOLENBQVc7QUFBRWIsUUFBQUEsTUFBRjtBQUFVdEIsUUFBQUEsTUFBVjtBQUFrQjZCLFFBQUFBLE1BQWxCO0FBQTBCRSxRQUFBQSxJQUExQjtBQUFnQ0ssUUFBQUEsU0FBUyxFQUFFO0FBQTNDLE9BQVg7QUFDSCxLQWRELENBY0UsT0FBT3ZDLENBQVAsRUFBVTtBQUNSdUIsTUFBQUEsT0FBTyxDQUFDQyxLQUFSLENBQWUsOEJBQTZCeEIsQ0FBQyxDQUFDd0MsT0FBUSxPQUFNN0IsUUFBUyxFQUFyRTtBQUNBO0FBQ0g7QUFDSjs7QUFFRCxPQUFLLElBQUk4QixJQUFULElBQWlCdkIsS0FBakIsRUFBd0I7QUFDcEIsUUFBSTtBQUNBdUIsTUFBQUEsSUFBSSxDQUFDRixTQUFMLEdBQWlCdEMsZUFBZSxDQUFDd0MsSUFBSSxDQUFDdEMsTUFBTixDQUFoQztBQUNILEtBRkQsQ0FFRSxPQUFPSCxDQUFQLEVBQVU7QUFDUnlDLE1BQUFBLElBQUksQ0FBQ0YsU0FBTCxHQUFrQiw0Q0FBMkN2QyxDQUFDLENBQUN3QyxPQUFGLElBQWEsa0JBQW1CLE1BQ3pGeEMsQ0FBQyxDQUFDMEMsS0FBRixJQUFXLGdCQUNkLEVBRmdCLENBR1p6QixLQUhZLENBR04sSUFITSxFQUlaZ0IsSUFKWSxDQUlQLFdBSk8sQ0FBakI7QUFLSDtBQUNKOztBQUVELFFBQU1VLFVBQVUsR0FDWjVCLFVBQVUsR0FBR3ZCLGNBQWIsR0FBOEIwQixLQUFLLENBQUMwQixHQUFOLENBQVdDLENBQUQsSUFBUSxHQUFFQSxDQUFDLENBQUNwQixNQUFPLEtBQUlvQixDQUFDLENBQUNOLFNBQVUsS0FBSU0sQ0FBQyxDQUFDWCxJQUFLLEVBQXhELEVBQTJERCxJQUEzRCxDQUFnRXpDLGNBQWhFLENBRGxDO0FBRUFJLEVBQUFBLHNCQUFzQixDQUFDZSxRQUFELEVBQVdnQyxVQUFYLENBQXRCO0FBQ0gsQyxDQUVEO0FBQ0E7OztBQUVPLFNBQVNHLEdBQVQsQ0FBYUMsUUFBYixFQUFvRDtBQUN2RCxNQUFJQyxXQUErQixHQUFHQyxTQUF0Qzs7QUFDQSxNQUFJO0FBQ0EsUUFBSSxDQUFDRixRQUFMLEVBQWU7QUFDWEMsTUFBQUEsV0FBVyxHQUFHRSxPQUFPLENBQUNDLElBQVIsQ0FBYSxDQUFiLENBQWQ7QUFDQUosTUFBQUEsUUFBUSxHQUFHSyxPQUFPLENBQUNKLFdBQUQsQ0FBbEI7QUFDSDtBQUNKLEdBTEQsQ0FLRSxPQUFPaEQsQ0FBUCxFQUFVLENBQUU7O0FBRWQsTUFBSTtBQUNBLFFBQUksQ0FBQytDLFFBQUwsRUFBZTtBQUNYQyxNQUFBQSxXQUFXLEdBQUcsbUJBQVFFLE9BQU8sQ0FBQ0csR0FBUixFQUFSLEVBQXVCLGFBQXZCLENBQWQ7QUFDQU4sTUFBQUEsUUFBUSxHQUFHSyxPQUFPLENBQUNKLFdBQUQsQ0FBbEI7QUFDSDtBQUNKLEdBTEQsQ0FLRSxPQUFPaEQsQ0FBUCxFQUFVLENBQUU7O0FBRWQsTUFBSTtBQUNBLFFBQUksQ0FBQytDLFFBQUwsRUFBZTtBQUNYQyxNQUFBQSxXQUFXLEdBQUcsbUJBQVFFLE9BQU8sQ0FBQ0csR0FBUixFQUFSLEVBQXVCLFlBQXZCLENBQWQ7QUFDQU4sTUFBQUEsUUFBUSxHQUFHSyxPQUFPLENBQUNKLFdBQUQsQ0FBbEI7QUFDSDtBQUNKLEdBTEQsQ0FLRSxPQUFPaEQsQ0FBUCxFQUFVLENBQUU7O0FBRWQsTUFBSSxDQUFDK0MsUUFBTCxFQUFlO0FBQ1h4QixJQUFBQSxPQUFPLENBQUNDLEtBQVIsQ0FDSywrSEFETDtBQUdILEdBSkQsTUFJTztBQUNILFVBQU1aLE9BQXVCLG1DQUFRTixxQkFBUixHQUFrQ3lDLFFBQWxDLENBQTdCOztBQUNBLEtBQUMsWUFBWTtBQUNULFVBQUluQyxPQUFPLENBQUNILE9BQVosRUFBcUJjLE9BQU8sQ0FBQytCLEdBQVIsQ0FBYSxxQ0FBb0NOLFdBQVksRUFBN0Q7QUFDckIsWUFBTU8sS0FBSyxHQUFHLE1BQU0scUJBQU8zQyxPQUFPLENBQUNKLEtBQWYsQ0FBcEI7O0FBRUEsV0FBSyxJQUFJRyxRQUFULElBQXFCNEMsS0FBckIsRUFBNEI7QUFDeEIsWUFBSTNDLE9BQU8sQ0FBQ0gsT0FBUixLQUFvQixPQUF4QixFQUFpQ2MsT0FBTyxDQUFDK0IsR0FBUixDQUFhLHdCQUF1QjNDLFFBQVMsRUFBN0M7QUFDakMsWUFBSUEsUUFBUSxDQUFDRyxRQUFULENBQWtCLGNBQWxCLEtBQXFDRixPQUFPLENBQUNMLGVBQWpELEVBQWtFO0FBQ2xFRyxRQUFBQSxVQUFVLENBQUNDLFFBQUQsRUFBV0MsT0FBWCxDQUFWO0FBQ0g7O0FBQ0QsVUFBSUEsT0FBTyxDQUFDSCxPQUFaLEVBQXFCYyxPQUFPLENBQUMrQixHQUFSLENBQWEsa0NBQWlDQyxLQUFLLENBQUNuQyxNQUFPLFVBQTNELEVBVFosQ0FXVDtBQUNILEtBWkQ7QUFhSDtBQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEpTT041IGZyb20gXCJqc29uNVwiO1xuaW1wb3J0IGdsb2JieSBmcm9tIFwiZ2xvYmJ5XCI7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMsIHdyaXRlRmlsZVN5bmMgfSBmcm9tIFwiZnNcIjtcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xuXG5leHBvcnQgY29uc3QgaW5wcmludF9wcmVmaXggPSBcIkBcIiArIFwiSU5QUklOVFwiO1xuZXhwb3J0IGNvbnN0IHN0YXJ0UHJlZml4ID0gXCJfU1RBUlRcIjtcbmV4cG9ydCBjb25zdCBlbmRQcmVmaXggPSBcIl9FTkRcIjtcbmV4cG9ydCBjb25zdCB1c2FnZU5vdGljZSA9IGBcblVTQUdFOlxuXG4vLyAke2lucHJpbnRfcHJlZml4fV9TVEFSVCB7Li4uYW55X2pzb25fcGFyYW1zLi4ufVxuLy8gR2VuZXJhdGVkIGNvZGUgd2lsbCBnbyBoZXJlXG4vLyAke2lucHJpbnRfcHJlZml4fV9FTkRcbmA7XG5cbmludGVyZmFjZSBJbnByaW50RmlsZVBhcnQge1xuICAgIGhlYWRlcjogc3RyaW5nO1xuICAgIHBhcmFtczogYW55O1xuICAgIG1pZGRsZTogc3RyaW5nO1xuICAgIHRhaWw6IHN0cmluZztcbiAgICBuZXdNaWRkbGU6IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IHdyaXRlRmlsZVN5bmNJZkNoYW5nZWQgPSAoZmlsZU5hbWU6IHN0cmluZywgY29udGVudDogc3RyaW5nKSA9PiB7XG4gICAgbGV0IGN1cnJlbnQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICB0cnkge1xuICAgICAgICBjdXJyZW50ID0gcmVhZEZpbGVTeW5jKGZpbGVOYW1lLCBcInV0Zi04XCIpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICBpZiAoY3VycmVudCAhPT0gY29udGVudCkge1xuICAgICAgICB3cml0ZUZpbGVTeW5jKGZpbGVOYW1lLCBjb250ZW50LCBcInV0Zi04XCIpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlucHJpbnRGdW5jdGlvbihwYXJhbXMwOiBhbnkpIHtcbiAgICBjb25zdCB7IGNvbnRlbnQsIC4uLnBhcmFtcyB9ID0gcGFyYW1zMDtcbiAgICByZXR1cm4gXCIgICAgLy8gXCIgKyBKU09OLnN0cmluZ2lmeShwYXJhbXMpO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElucHJpbnRPcHRpb25zIHtcbiAgICBza2lwTm9kZU1vZHVsZXM6IGJvb2xlYW47XG4gICAgZmlsZXM6IHN0cmluZyB8IHN0cmluZ1tdO1xuICAgIGxvZ2dpbmc6IFwic2hvcnRcIiB8IFwiZmlsZXNcIiB8IGZhbHNlO1xufVxuXG5leHBvcnQgY29uc3QgZGVmYXVsdElucHJpbnRPcHRpb25zID0ge1xuICAgIHNraXBOb2RlTW9kdWxlczogdHJ1ZSxcbiAgICBmaWxlczogW1wic3JjLyoqLyoue3RzLHRzeCxqcyxqc3h9XCJdLFxuICAgIGxvZ2dpbmc6IFwic2hvcnRcIixcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVGaWxlKGZpbGVQYXRoOiBzdHJpbmcsIG9wdGlvbnM6IElucHJpbnRPcHRpb25zKSB7XG4gICAgY29uc3QgY29udGVudFN0ciA9IHJlYWRGaWxlU3luYyhmaWxlUGF0aCwgXCJ1dGYtOFwiKTtcblxuICAgIGlmICghY29udGVudFN0ci5pbmNsdWRlcyhpbnByaW50X3ByZWZpeCkpIHJldHVybjtcblxuICAgIGNvbnN0IFtmaWxlSGVhZGVyLCAuLi5wYXJ0czBdID0gY29udGVudFN0ci5zcGxpdChpbnByaW50X3ByZWZpeCk7XG4gICAgY29uc3QgcGFydHM6IElucHJpbnRGaWxlUGFydFtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJ0czAubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgY29uc3QgcyA9IHBhcnRzMFtpXTtcbiAgICAgICAgaWYgKCFzLnN0YXJ0c1dpdGgoc3RhcnRQcmVmaXgpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBDT0RFMDAwMDAwMDEgSU5QUklOVF9FUlJPUiBObyAke2lucHJpbnRfcHJlZml4fSR7c3RhcnRQcmVmaXh9IGluICR7ZmlsZVBhdGh9YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXBhcnRzMFtpICsgMV0uc3RhcnRzV2l0aChlbmRQcmVmaXgpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBDT0RFMDAwMDAwMDIgSU5QUklOVF9FUlJPUiBObyAke2lucHJpbnRfcHJlZml4fSR7ZW5kUHJlZml4fSBpbiAke2ZpbGVQYXRofWApO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IFtoZWFkZXIsIC4uLm1pZGRsZVBhcnRzXSA9IHMuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgICAgICBjb25zdCBsYXN0UGFydCA9IG1pZGRsZVBhcnRzLnBvcCgpO1xuXG4gICAgICAgICAgICBjb25zdCBwYXJhbXNTdHIgPSBoZWFkZXIuc3Vic3RyKHN0YXJ0UHJlZml4Lmxlbmd0aCkudHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgbWlkZGxlID0gbWlkZGxlUGFydHMuam9pbihcIlxcblwiKTtcbiAgICAgICAgICAgIGNvbnN0IHRhaWwgPSBsYXN0UGFydCArIGlucHJpbnRfcHJlZml4ICsgcGFydHMwW2kgKyAxXTtcblxuICAgICAgICAgICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IG1pZGRsZSxcbiAgICAgICAgICAgICAgICBhYnNvbHV0ZVBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgIC4uLkpTT041LnBhcnNlKHBhcmFtc1N0ciksXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcGFydHMucHVzaCh7IGhlYWRlciwgcGFyYW1zLCBtaWRkbGUsIHRhaWwsIG5ld01pZGRsZTogXCJcIiB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQ09ERTAwMDAwMDAzIElOUFJJTlRfRVJST1IgJHtlLm1lc3NhZ2V9IGluICR7ZmlsZVBhdGh9YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGxldCBwYXJ0IG9mIHBhcnRzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwYXJ0Lm5ld01pZGRsZSA9IGlucHJpbnRGdW5jdGlvbihwYXJ0LnBhcmFtcyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHBhcnQubmV3TWlkZGxlID0gYC8vIElOUFJJTlRfRkFJTEVEIGJlY2F1c2Ugb2YgZXhjZXB0aW9uOlxcbiR7ZS5tZXNzYWdlIHx8IFwiTk9fRVJST1JfTUVTU0FHRVwifVxcXFxuJHtcbiAgICAgICAgICAgICAgICBlLnN0YWNrIHx8IFwiTk9fU1RBQ0tfVFJBQ0VcIlxuICAgICAgICAgICAgfWBcbiAgICAgICAgICAgICAgICAuc3BsaXQoXCJcXG5cIilcbiAgICAgICAgICAgICAgICAuam9pbihcIlxcbi8vICAgICBcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBuZXdDb250ZW50ID1cbiAgICAgICAgZmlsZUhlYWRlciArIGlucHJpbnRfcHJlZml4ICsgcGFydHMubWFwKChwKSA9PiBgJHtwLmhlYWRlcn1cXG4ke3AubmV3TWlkZGxlfVxcbiR7cC50YWlsfWApLmpvaW4oaW5wcmludF9wcmVmaXgpO1xuICAgIHdyaXRlRmlsZVN5bmNJZkNoYW5nZWQoZmlsZVBhdGgsIG5ld0NvbnRlbnQpO1xufVxuXG4vLyBjb25zdCB0ZXN0RmlsZVBhdGggPSBgRDpcXFxcYlxcXFxNaW5lXFxcXEdJVF9Xb3JrXFxcXHlhdGFza3Nfb25lX2FwaVxcXFxzcmNcXFxcaW5wcmludFRlc3RGaWxlLnRzYDtcbi8vIGhhbmRsZUZpbGUodGVzdEZpbGVQYXRoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJ1bihvcHRpb25zMD86IElucHJpbnRPcHRpb25zIHwgdW5kZWZpbmVkKSB7XG4gICAgbGV0IG9wdGlvbnNQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKCFvcHRpb25zMCkge1xuICAgICAgICAgICAgb3B0aW9uc1BhdGggPSBwcm9jZXNzLmFyZ3ZbMl07XG4gICAgICAgICAgICBvcHRpb25zMCA9IHJlcXVpcmUob3B0aW9uc1BhdGgpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge31cblxuICAgIHRyeSB7XG4gICAgICAgIGlmICghb3B0aW9uczApIHtcbiAgICAgICAgICAgIG9wdGlvbnNQYXRoID0gcmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBcImlucHJpbnQuY2pzXCIpO1xuICAgICAgICAgICAgb3B0aW9uczAgPSByZXF1aXJlKG9wdGlvbnNQYXRoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICB0cnkge1xuICAgICAgICBpZiAoIW9wdGlvbnMwKSB7XG4gICAgICAgICAgICBvcHRpb25zUGF0aCA9IHJlc29sdmUocHJvY2Vzcy5jd2QoKSwgXCJpbnByaW50LmpzXCIpO1xuICAgICAgICAgICAgb3B0aW9uczAgPSByZXF1aXJlKG9wdGlvbnNQYXRoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICBpZiAoIW9wdGlvbnMwKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICBgQ09ERTAwMDAwMDA0IElOUFJJTlRfRVJST1IgQ291bGRuJ3QgZmluZCBvcHRpb25zIGZpbGUuIENyZWF0ZSBpbnByaW50LmNqcyBvciBzcGVjaWZ5IHBhdGggdG8gb3B0aW9ucyBpbiBjb21tYW5kIGxpbmUgYXJndW1lbnRgXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uczogSW5wcmludE9wdGlvbnMgPSB7IC4uLmRlZmF1bHRJbnByaW50T3B0aW9ucywgLi4ub3B0aW9uczAgfTtcbiAgICAgICAgKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmxvZ2dpbmcpIGNvbnNvbGUubG9nKGBDT0RFMDAwMDAwMDUgSU5QUklOVCBvcHRpb25zIGZyb20gJHtvcHRpb25zUGF0aH1gKTtcbiAgICAgICAgICAgIGNvbnN0IHBhdGhzID0gYXdhaXQgZ2xvYmJ5KG9wdGlvbnMuZmlsZXMpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBmaWxlUGF0aCBvZiBwYXRocykge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmxvZ2dpbmcgPT09IFwiZmlsZXNcIikgY29uc29sZS5sb2coYENPREUwMDAwMDAwNiBJTlBSSU5UICR7ZmlsZVBhdGh9YCk7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzXCIpICYmIG9wdGlvbnMuc2tpcE5vZGVNb2R1bGVzKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBoYW5kbGVGaWxlKGZpbGVQYXRoLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcHRpb25zLmxvZ2dpbmcpIGNvbnNvbGUubG9nKGBDT0RFMDAwMDAwMDcgSU5QUklOVCBmaW5pc2hlZCwgJHtwYXRocy5sZW5ndGh9IC0gZmlsZXNgKTtcblxuICAgICAgICAgICAgLy89PiBbJ3VuaWNvcm4nLCAncmFpbmJvdyddXG4gICAgICAgIH0pKCk7XG4gICAgfVxufVxuIl19