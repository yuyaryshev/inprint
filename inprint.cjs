module.exports = {
    files: ["inprintTestFile.ts", "src/**/*.ts"],
    embeddedFeatures: "first",
    inprint: function inprint(params) {
        console.log(params);
    },
    logging:'files',
};
