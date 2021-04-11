# inprint

A very simple precompiler on typescript.

# Installation

```
npm i -g inprint
yarn i -g inprint
pnpm i -g inprint
```

# Usage

Anywhere in your code add a block you want to generate like this

```
console.log("any code can be here");
// @INPRINT_START {my:"own params", json5:'is supported here!'}
// Anything here will be overwritten by generated code!
// @INPRINT_END
console.log("any code can be here");
```

Now add **inprint.cjs** (or **.js**) to your project with the following contents:

```
module.exports.inprint = {
    files:['src/**/*.{ts,tsx,js,jsx}'],
    inprint: function inprint(paramsObject) {
        return "    // " + JSON.stringify(paramsObject);
    }
}
```

The returned content will be inprinted inbetween @INPRINT tags

inprint function will receive the following additional paramaters:

- **absolutePath** - absolute file path with inprint block

- **content** - current content of the block 

Options:

- **inprint** - required, the function used to generate inprinted content

- **files** - optional, globby input patterns, default is `['src/**/*.{ts,tsx,js,jsx}']`

- **skipNodeModules**- optional, if true will skip all path containing /node_modules/, default is true
