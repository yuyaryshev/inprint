console.log(`CODE00000000 inprintTestFile start`);

export function someFunction() {
    console.log(`CODE00000000 someFunction started`);
    // @INPRINT_START {n:0, test:"data1"}
    console.log(`CODE00000000 old data1`);
    // @INPRINT_END
    // @INPRINT_START {n:1, test:"data2"}
    console.log(`CODE00000000 old data2`);
    // @INPRINT_END
    console.log(`CODE00000000 someFunction middle part`);
    // @INPRINT_START {n:2, test:"data3"}
    console.log(`CODE00000000 old data3`);
    // @INPRINT_END
    console.log(`CODE00000000 someFunction finished`);
}
console.log(`CODE00000000 inprintTestFile finish`);
