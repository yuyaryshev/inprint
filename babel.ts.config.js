let fs = require("fs");
let tsconf = eval("(()=>(" + fs.readFileSync("tsconfig.json", "utf-8") + "))()");

let aliases = {};
for (let k in tsconf.compilerOptions.paths) {
    let v = tsconf.compilerOptions.paths[k];
    aliases[k] = "./" + v[0];
}

module.exports = {
    plugins: [
        // '@babel/transform-duplicate-keys',
        // '@babel/transform-function-name',
        // '@babel/transform-arrow-functions',
        // '@babel/transform-destructuring',
        // '@babel/transform-shorthand-properties',
        // '@babel/transform-member-expression-literals',
        // '@babel/transform-block-scoped-functions',
        // '@babel/transform-property-mutators',
        ["@babel/plugin-proposal-decorators", { legacy: true }],
        "@babel/plugin-syntax-jsx",
        "@babel/plugin-transform-react-jsx",

        "@babel/proposal-optional-chaining",
        "@babel/transform-typescript",
        "@babel/syntax-typescript",
        ["@babel/proposal-class-properties", { legacy: true }],
        "@babel/proposal-object-rest-spread",
        [
            "module-resolver",
            {
                root: ["./"],
                alias: aliases,
            },
        ],
        "@babel/transform-modules-commonjs",
    ],
};

module.exports = {
    presets: ["@babel/preset-typescript", "@babel/preset-react"],
    plugins: [
        ["@babel/plugin-proposal-decorators", { legacy: true }],
        "@babel/proposal-optional-chaining",
        ["@babel/proposal-class-properties", { legacy: true }],
        "@babel/proposal-object-rest-spread",
        [
            "module-resolver",
            {
                root: ["./"],
                alias: aliases,
            },
        ],
        "@babel/transform-modules-commonjs",
    ],
};
