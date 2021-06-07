const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin;

const pathes = (() => {
    const proj = path.resolve(__dirname);
    const projParts = proj.split(path.sep);
    const projName = projParts[projParts.length - 1];
    const root = path.resolve(__dirname, "");

    return {
        root,
        proj,
        projName,
        dist: path.resolve(proj, "dist"),
        distCompiled: path.resolve(proj, "distCompiled", projName),
    };
})();

for (let k in pathes) console.log(`pathes.${k} = ${pathes[k]}`);

// Based on:
// https://github.com/gaearon/react-hot-loader
// https://github.com/gaearon/react-hot-loader/blob/master/examples/typescript/webpack.config.babel.js

const NODE_ENV = "development";

let BUILD_DATE = new Date();
BUILD_DATE.setTime(BUILD_DATE.getTime() + 3 * 60 * 60 * 1000);
BUILD_DATE = JSON.stringify(BUILD_DATE);
BUILD_DATE = BUILD_DATE.substr(1, 10) + " " + BUILD_DATE.substr(12, 8);

console.log("");
console.log("BUILD_DATE = " + BUILD_DATE);
console.log("");

let package_json;
let manifest_json;

package_json = JSON.parse(fs.readFileSync(path.resolve(pathes.root, "package.json"), { encoding: "utf-8" }));
manifest_json = JSON.parse(fs.readFileSync(path.resolve(pathes.dist, "manifest.json"), { encoding: "utf-8" }));
let tsconf = eval("(()=>(" + fs.readFileSync("tsconfig.json", "utf-8") + "))()");

let moduleAliases = {};
for (let k in tsconf.compilerOptions.paths) {
    let v = tsconf.compilerOptions.paths[k];
    moduleAliases[k] = path.resolve(pathes.root, "ts_out", v[0]);
}

let excludedModules = [
    "fs",
    "sql-prettier",
    "prettier",
    "express",
    "socket.io",
    "better-sqlite3",
    "sqlite3",
    "child_process",
];

module.exports = {
    // TODO REMOVED ON 2020-13-11
    // node: {
    //     fs: "empty",
    //     child_process: "empty",
    // },
    mode: "development",
    entry: [path.resolve(pathes.proj, "src/client/indexSmall.tsx")],
    devtool: "inline-source-map",
    devServer: {
        contentBase: "./dist",
        hot: true,
    },
    resolve: {
        fallback: {
            crypto: false,
            fs: false,
            child_process: false,
            path: false,
            constants: false,
            util: false,
            assert: false,
            stream: false,
            //            crypto: require.resolve("crypto-browserify"),
            //            fs:null,
        },
        //        root:               path.join(pathes.proj, 'js'),
        //        modulesDirectories: ['node_modules'],
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: {
            "react-dom": "@hot-loader/react-dom",
            ...moduleAliases,
        },
    },
    output: {
        path: pathes.distCompiled,
        filename: "bundle.js",
    },
    module: {
        rules: [
            {
                test: (modulePath0) => {
                    let modulePath = modulePath0.split(path.sep);
                    for (let excludedModule of excludedModules) if (modulePath.includes(excludedModule)) return true;
                    return false;
                },
                use: "null-loader",
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader", // compiles Sass to CSS, using Node Sass by default
                ],
            },
            {
                test: /\.(j|t)sx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true,
                        babelrc: false,
                        presets: ["@babel/preset-typescript", "@babel/preset-react"],
                        plugins: [
                            ["@babel/plugin-proposal-decorators", { legacy: true }],
                            "@babel/proposal-optional-chaining",
                            ["@babel/proposal-class-properties", { legacy: true }],
                            "@babel/proposal-object-rest-spread",
                            "react-hot-loader/babel",
                            [
                                "module-resolver",
                                {
                                    root: ["./"],
                                    alias: moduleAliases,
                                },
                            ],
                            // "@babel/transform-modules-commonjs",
                        ],
                    },
                },
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            BROWSER: "true",
            "process.env.BROWSER": "true",
            NODE_ENV: JSON.stringify(NODE_ENV),
            BUILD_DATE: JSON.stringify(BUILD_DATE),
            //             BASE_URL:JSON.stringify(private_js ? private_js.url : 'http://localhost')
        }),
        new CleanWebpackPlugin(),
        //        new webpack.NamedModulesPlugin(), // TODO REMOVED ON 2020-13-11
        new HtmlWebpackPlugin({ title: manifest_json.name }),
        new webpack.HotModuleReplacementPlugin(),
    ],
    //	watchOptions : {
    //		aggregateTimeout : 300
    //	},
    // "cheap-inline-module-source-map"
};

// console.log('YYAWEBPACK', JSON.stringify(module.exports.resolve.alias,null, "\t"));
