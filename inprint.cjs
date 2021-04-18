module.exports = {
    files: ["inprintTestFile.ts", "src/**/*.ts"],
    embeddedFeatures: "first",
    inprint: function inprint(params) {
        console.log(params);
    },
    logging: "files",
    prettierOpts: { filepath: __dirname, ...JSON.parse(require("fs").readFileSync("package.json", "utf-8"))?.prettier, parser:"typescript" },
};
