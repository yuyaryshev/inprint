const importantOnly = 0;
const excludeDocs = 1;
const keepDebug = 1;

const nonImportantWarning = !importantOnly ? 2 : 0;
const nonImportantError = !importantOnly ? 1 : 0;

module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "eslint-plugin-tsdoc", "jsdoc", "eslint-plugin-import", "sonarjs"].filter((item) => typeof item === "string"),
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", !importantOnly && "plugin:sonarjs/recommended", "prettier"].filter(
        (item) => typeof item === "string",
    ),
    rules: {
        "no-undef": 0,
        "no-prototype-builtins": 0,
        "no-useless-escape": 0,
        "no-empty": 0,
        "no-constant-condition": 0,
        "import/extensions": [
            "error",
            "ignorePackages",
            {
                js: "ignorePackages",
            },
        ],
        "import/no-default-export": 1,
        "@typescript-eslint/no-unused-vars": 0,
        "@typescript-eslint/no-var-requires": 0,
        "@typescript-eslint/explicit-module-boundary-types": 0,
        "@typescript-eslint/ban-ts-comment": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/no-empty-interface": 0,
        "@typescript-eslint/no-inferrable-types": 0,
        "@typescript-eslint/no-non-null-assertion": 0,
        "@typescript-eslint/no-empty-function": 0,
        "@typescript-eslint/ban-types": 0,
        "jsdoc/require-jsdoc": excludeDocs ? 0 : nonImportantError,
        "jsdoc/require-description": excludeDocs ? 0 : nonImportantError,
        "tsdoc/syntax": 1,
        // "require-jsdoc": ["error", {
        //     "require": {
        //         "FunctionDeclaration": true,
        //         "MethodDefinition": true,
        //         "ClassDeclaration": true,
        //         "ArrowFunctionExpression": false,
        //         "FunctionExpression": false
        //     }
        // }],
        "sonarjs/no-redundant-jump": 1,
        "sonarjs/cognitive-complexity": 0,
        "sonarjs/no-redundant-jump": 0,
        "sonarjs/no-small-switch": 0,
        "sonarjs/no-unused-collection": nonImportantError,
        "sonarjs/no-collapsible-if":0,
        "no-debugger": keepDebug ? 0 : nonImportantError,
        "@typescript-eslint/no-non-null-asserted-optional-chain": 0,
        "sonarjs/no-one-iteration-loop": 0,
    },
};
