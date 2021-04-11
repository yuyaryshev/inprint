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
module.exports = {
    files:['src/**/*.{ts,tsx,js,jsx}'],
    embeddedFeatures: false,    // Highly recommended if don't use them!
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

- **embeddedFeatures** - 'first' | 'last' | false - used to automatically run embedded generation functions (see the list below), 'first' - to run them before your inprint code, 'last' - to run only if your code returned undefined, false - don't run them ever, default is **false**. 

# Limitations

- **@INPRINT** tags can't be nested

# Debugging inprint function

Create **inprintDebug.cjs** with contents 

```javascript
require("inprint").run();
```

run it in your favorite IDE to debug the scripts.

# Run programmatically

```javascript
require("inprint").run(options);
```

# Embedded Features

This package also contains some functions which I use for my own project automation.

If you want to disable them use:

```javascript
embeddedFeatures: false,
```

If you want to use them add to options file:

```javascript
embeddedFeatures: 'first'
```

You can also call them with:

```javascript
require("inprint").callEmbeddedFeatures(params, options);
```

Using just one function is also possible, for example:

```javascript
require("inprint").inprintIndexTs(params, options);
```

List of embedded features:

## IndexTs

Generates reexports for each file in folder:

```javascript
// @INPRINT_START {exclude:[""], merge:[{name:"embeddedFeatures:EmbeddedFeature[]", suffix:"EmbeddedFeature"}]}
export * from "./indexTs";

import {indexTsEmbeddedFeature} from "./indexTs";
export const embeddedFeatures:EmbeddedFeature[] = [indexTsEmbeddedFeature];
// @INPRINT_END
```

###### Params:

- **exclude** - array of excluded filenames

- **merge** - array of merged variables, defined as objects
  
  - **suffix** - name of a const exported from each file
  
  - **name** - name of result variable
