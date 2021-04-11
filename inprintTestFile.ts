console.log(`CODE00000000 inprintTestFile start`);

export function someFunction() {
    console.log(`CODE00000000 someFunction started`);
    // @INPRINT_START {n:0, test:"data111122"}
    // {"absolutePath":"inprintTestFile.ts","n":0,"test":"data111122"}
    // @INPRINT_END
    // @INPRINT_START {n:1, test:"data2333"}
    // {"absolutePath":"inprintTestFile.ts","n":1,"test":"data2333"}
    // @INPRINT_END
    console.log(`CODE00000000 someFunction middle part`);
    // @INPRINT_START {n:2, test:"data3"}
    // {"absolutePath":"inprintTestFile.ts","n":2,"test":"data3"}
    // @INPRINT_END
    console.log(`CODE00000000 someFunction finished`);
}
console.log(`CODE00000000 inprintTestFile finish`);
