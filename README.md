# inprint

A very simple precompiler (written in typescript). With it you can make a dynamically generated blocks in your code.

# Installation

```bash
npm i inprint --save-dev
yarn i inprint --save-dev
pnpm i inprint --save-dev

npm i -g inprint
yarn i -g inprint
pnpm i -g inprint
```

# Usage

1. Anywhere in your code add a block you want to generate like this

```javascript
console.log("any code can be here");
// @INPRINT_START {my:"own params", json5:'is supported here!'}
// Anything here will be overwritten by generated code!
// @INPRINT_END
console.log("any code can be here");
```

2. Now add **inprint.cjs** (or **.js**) to your project with the following contents:

```javascript
module.exports.inprint = {
    files:['src/**/*.{ts,tsx,js,jsx}'],
    inprint: function inprint(paramsObject) {
        return "    // " + JSON.stringify(paramsObject);
    }
}
```

3. Run **inprint**

4. The returned content will be inprinted between **@INPRINT** tags:

```javascript
console.log("any code can be here");
// @INPRINT_START {my:"own params", json5:'is supported here!'}
// {my:"own params", json5:'is supported here!'}
// @INPRINT_END
console.log("any code can be here");
```

# Details

inprint function will receive the following additional paramaters:

- **absolutePath** - absolute file path with inprint block

- **content** - current content of the block 

Options:

- **inprint** - required, the function used to generate inprinted content

- **files** - optional, globby input patterns, default is `['src/**/*.{ts,tsx,js,jsx}']`

- **skipNodeModules**- optional, if true will skip all path containing /node_modules/, default is true

# Limitations

- **@INPRINT** tags can't be nested
