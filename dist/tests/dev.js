"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
let startTimeStamp;
let startText;
function startTime(text) {
    startText = text;
    startTimeStamp = Date.now();
}
function stopTime() {
    const duration = Date.now() - startTimeStamp;
    console.log(startText + "..." + duration + "ms");
}
function testBigFile() {
    const bytes = new Uint8Array(128 * 1024 * 1024 * 3 / 4 - 3);
    console.log(bytes.length);
    startTime("Base64String.rawFromBytes");
    const base64str = src_1.Base64String.rawFromBytes(bytes);
    stopTime();
    startTime("Base64String.rawToBytes");
    const returnedBytes = src_1.Base64String.rawToBytes(base64str);
    stopTime();
    console.log(base64str === src_1.Base64String.fromBytes(returnedBytes));
}
testBigFile();
//# sourceMappingURL=dev.js.map