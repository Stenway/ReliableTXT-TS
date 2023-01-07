"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
describe("ReliableTxtEncoding", () => {
    test.each([
        [src_1.ReliableTxtEncoding.Utf8, 0],
        [src_1.ReliableTxtEncoding.Utf16, 1],
        [src_1.ReliableTxtEncoding.Utf16Reverse, 2],
        [src_1.ReliableTxtEncoding.Utf32, 3],
    ])("%p is %p", (input, output) => {
        expect(input).toEqual(output);
    });
});
// ----------------------------------------------------------------------
describe("ReliableTxtEncodingUtil.getPreambleSize", () => {
    test.each([
        [src_1.ReliableTxtEncoding.Utf8, 3],
        [src_1.ReliableTxtEncoding.Utf16, 2],
        [src_1.ReliableTxtEncoding.Utf16Reverse, 2],
        [src_1.ReliableTxtEncoding.Utf32, 4],
    ])("Given %p returns %p", (input, output) => {
        expect(src_1.ReliableTxtEncodingUtil.getPreambleSize(input)).toEqual(output);
    });
    test("Invalid encoding", () => {
        expect(() => src_1.ReliableTxtEncodingUtil.getPreambleSize(4)).toThrow(RangeError);
    });
});
// ----------------------------------------------------------------------
describe("ReliableTxtLines.join", () => {
    test.each([
        [[], ""],
        [[""], ""],
        [["", ""], "\n"],
        [["", "", ""], "\n\n"],
        [["Line1"], "Line1"],
        [["Line1", "Line2"], "Line1\nLine2"],
        [["Line1", "Line2", "Line3"], "Line1\nLine2\nLine3"],
        [["", "Line2", "Line3"], "\nLine2\nLine3"],
        [["Line1", "", "Line3"], "Line1\n\nLine3"],
        [["Line1", "Line2", ""], "Line1\nLine2\n"],
        [["Line1\r", "Line2"], "Line1\r\nLine2"],
    ])("Given %p returns %p", (input, output) => {
        expect(src_1.ReliableTxtLines.join(input)).toEqual(output);
    });
});
describe("ReliableTxtLines.split", () => {
    test.each([
        ["", [""]],
        ["\n", ["", ""]],
        ["\n\n", ["", "", ""]],
        ["Line1", ["Line1"]],
        ["Line1\nLine2", ["Line1", "Line2"]],
        ["Line1\nLine2\nLine3", ["Line1", "Line2", "Line3"]],
        ["Line1\nLine2\n", ["Line1", "Line2", ""]],
        ["Line1\r\nLine2", ["Line1\r", "Line2"]],
    ])("Given %p returns %p", (input, output) => {
        expect(src_1.ReliableTxtLines.split(input)).toEqual(output);
    });
});
// ----------------------------------------------------------------------
test("InvalidUtf16StringError", () => {
    expect(new src_1.InvalidUtf16StringError().message).toEqual("Invalid UTF16 string");
});
// ----------------------------------------------------------------------
test("StringDecodingError", () => {
    expect(new src_1.StringDecodingError().message).toEqual("Could not decode string");
});
// ----------------------------------------------------------------------
test("NoReliableTxtPreambleError", () => {
    expect(new src_1.NoReliableTxtPreambleError().message).toEqual("Document does not have a ReliableTXT preamble");
});
// ----------------------------------------------------------------------
describe("Utf16String.isValid", () => {
    test.each([
        ["", true],
        ["a", true],
        ["\uD800", false],
        ["\uD800a", false],
        ["\uDC00", false],
        ["\uDC00a", false],
        ["\uD800\uDC00", true],
        ["\uD800\uDC00a", true],
        ["a\uD800\uDC00", true],
        ["a\uD800\uDC00a", true],
    ])("Given %p returns %p", (input, output) => {
        expect(src_1.Utf16String.isValid(input)).toEqual(output);
    });
});
describe("Utf16String.validate", () => {
    test.each([
        "\uD800",
        "\uD800a",
        "\uDC00",
        "\uDC00a"
    ])("Given %p throws", (input) => {
        expect(() => src_1.Utf16String.validate(input)).toThrow(src_1.InvalidUtf16StringError);
    });
    test.each([
        "",
        "a",
        "\uD800\uDC00",
        "\uD800\uDC00a",
        "a\uD800\uDC00",
        "a\uD800\uDC00a",
    ])("Given %p does not throw", (input) => {
        expect(src_1.Utf16String.validate(input));
    });
});
describe("Utf16String.getCodePointCount", () => {
    test.each([
        ["", 0],
        ["a", 1],
        ["\uD800\uDC00", 1],
        ["\uD800\uDC00a", 2],
        ["a\uD800\uDC00", 2],
        ["a\uD800\uDC00a", 3],
    ])("Given %p returns %p", (input, output) => {
        expect(src_1.Utf16String.getCodePointCount(input)).toEqual(output);
    });
    test.each([
        "\uD800",
        "\uD800a",
        "\uD800\uD800",
        "\uDC00",
        "\uDC00a"
    ])("Given %p throws", (input) => {
        expect(() => src_1.Utf16String.getCodePointCount(input)).toThrow(src_1.InvalidUtf16StringError);
    });
});
describe("Utf16String.getCodePointArray", () => {
    test.each([
        ["", []],
        ["a", [0x61]],
        ["a\u6771", [0x61, 0x6771]],
        ["\uD834\uDD1E", [0x1D11E]],
    ])("Given %p returns %p", (input, output) => {
        expect(src_1.Utf16String.getCodePointArray(input)).toEqual(output);
    });
    test.each([
        "\uD800",
        "\uD800a",
        "\uD800\uD800",
        "\uDC00",
        "\uDC00a"
    ])("Given %p throws", (input) => {
        expect(() => src_1.Utf16String.getCodePointArray(input)).toThrow(src_1.InvalidUtf16StringError);
    });
});
describe("Utf16String.getCodePoints", () => {
    test.each([
        ["", new Uint32Array([])],
        ["a", new Uint32Array([0x61])],
        ["a\u6771", new Uint32Array([0x61, 0x6771])],
        ["\uD834\uDD1E", new Uint32Array([0x1D11E])],
    ])("Given %p returns %p", (input, output) => {
        expect(src_1.Utf16String.getCodePoints(input)).toEqual(output);
    });
    test.each([
        "\uD800",
        "\uD800a",
        "\uD800\uD800",
        "\uDC00",
        "\uDC00a"
    ])("Given %p throws", (input) => {
        expect(() => src_1.Utf16String.getCodePoints(input)).toThrow(src_1.InvalidUtf16StringError);
    });
});
describe("Utf16String.toUtf8Bytes", () => {
    test.each([
        ["", new Uint8Array([])],
        ["a", new Uint8Array([0x61])],
        ["a¥", new Uint8Array([0x61, 0xC2, 0xA5])],
        ["\uFEFF", new Uint8Array([0xEF, 0xBB, 0xBF])],
        ["\uFEFF\uFEFF", new Uint8Array([0xEF, 0xBB, 0xBF, 0xEF, 0xBB, 0xBF])],
        ["a\u6771", new Uint8Array([0x61, 0xE6, 0x9D, 0xB1])],
        ["\uD834\uDD1E", new Uint8Array([0xF0, 0x9D, 0x84, 0x9E])],
    ])("Given %p returns %p", (input, output) => {
        expect(src_1.Utf16String.toUtf8Bytes(input)).toEqual(output);
    });
    test.each([
        ["\0", new Uint8Array([0x0])],
    ])("Zero test", (input, output) => {
        expect(src_1.Utf16String.toUtf8Bytes(input)).toEqual(output);
    });
    test.each([
        "\uD800",
        "\uD800a",
        "\uD800\uD800",
        "\uDC00",
        "\uDC00a"
    ])("Given %p throws", (input) => {
        expect(() => src_1.Utf16String.toUtf8Bytes(input)).toThrow(src_1.InvalidUtf16StringError);
    });
});
describe("Utf16String.toUtf16Bytes", () => {
    test.each([
        ["", new Uint8Array([])],
        ["a", new Uint8Array([0x0, 0x61])],
        ["\uFEFF", new Uint8Array([0xFE, 0xFF])],
        ["\uFEFF\uFEFF", new Uint8Array([0xFE, 0xFF, 0xFE, 0xFF])],
        ["\uD834\uDD1E", new Uint8Array([0xD8, 0x34, 0xDD, 0x1E])],
    ])("Given %p returns %p", (input, output) => {
        expect(src_1.Utf16String.toUtf16Bytes(input)).toEqual(output);
    });
    test.each([
        ["\0", new Uint8Array([0x0, 0x0])],
    ])("Zero test", (input, output) => {
        expect(src_1.Utf16String.toUtf16Bytes(input)).toEqual(output);
    });
    test.each([
        "\uD800",
        "\uD800a",
        "\uD800\uD800",
        "\uDC00",
        "\uDC00a"
    ])("Given %p throws", (input) => {
        expect(() => src_1.Utf16String.toUtf16Bytes(input)).toThrow(src_1.InvalidUtf16StringError);
    });
});
describe("Utf16String.toUtf16Bytes LittleEndian", () => {
    test.each([
        ["", new Uint8Array([])],
        ["a", new Uint8Array([0x61, 0x0])],
        ["\uFEFF", new Uint8Array([0xFF, 0xFE])],
        ["\uFEFF\uFEFF", new Uint8Array([0xFF, 0xFE, 0xFF, 0xFE])],
        ["\uD834\uDD1E", new Uint8Array([0x34, 0xD8, 0x1E, 0xDD])],
    ])("Given %p returns %p", (input, output) => {
        expect(src_1.Utf16String.toUtf16Bytes(input, true)).toEqual(output);
    });
    test.each([
        ["\0", new Uint8Array([0x0, 0x0])],
    ])("Zero test", (input, output) => {
        expect(src_1.Utf16String.toUtf16Bytes(input, true)).toEqual(output);
    });
    test.each([
        "\uD800",
        "\uD800a",
        "\uD800\uD800",
        "\uDC00",
        "\uDC00a"
    ])("Given %p throws", (input) => {
        expect(() => src_1.Utf16String.toUtf16Bytes(input, true)).toThrow(src_1.InvalidUtf16StringError);
    });
});
describe("Utf16String.toUtf32Bytes", () => {
    test.each([
        ["", new Uint8Array([])],
        ["a", new Uint8Array([0x0, 0x0, 0x0, 0x61])],
        ["\uFEFF", new Uint8Array([0x0, 0x0, 0xFE, 0xFF])],
        ["\uFEFF\uFEFF", new Uint8Array([0x0, 0x0, 0xFE, 0xFF, 0x0, 0x0, 0xFE, 0xFF])],
        ["\uD834\uDD1E", new Uint8Array([0x0, 0x01, 0xD1, 0x1E])],
    ])("Given %p returns %p", (input, output) => {
        expect(src_1.Utf16String.toUtf32Bytes(input)).toEqual(output);
    });
    test.each([
        ["\0", new Uint8Array([0x0, 0x0, 0x0, 0x0])],
    ])("Zero test", (input, output) => {
        expect(src_1.Utf16String.toUtf32Bytes(input)).toEqual(output);
    });
    test.each([
        "\uD800",
        "\uD800a",
        "\uD800\uD800",
        "\uDC00",
        "\uDC00a"
    ])("Given %p throws", (input) => {
        expect(() => src_1.Utf16String.toUtf32Bytes(input)).toThrow(src_1.InvalidUtf16StringError);
    });
});
describe("Utf16String.toUtf32Bytes LittleEndian", () => {
    test.each([
        ["", new Uint8Array([])],
        ["a", new Uint8Array([0x61, 0x0, 0x0, 0x0])],
        ["\uFEFF", new Uint8Array([0xFF, 0xFE, 0x0, 0x0])],
        ["\uFEFF\uFEFF", new Uint8Array([0xFF, 0xFE, 0x0, 0x0, 0xFF, 0xFE, 0x0, 0x0])],
        ["\uD834\uDD1E", new Uint8Array([0x1E, 0xD1, 0x01, 0x0])],
    ])("Given %p returns %p", (input, output) => {
        expect(src_1.Utf16String.toUtf32Bytes(input, true)).toEqual(output);
    });
    test.each([
        ["\0", new Uint8Array([0x0, 0x0, 0x0, 0x0])],
    ])("Zero test", (input, output) => {
        expect(src_1.Utf16String.toUtf32Bytes(input, true)).toEqual(output);
    });
    test.each([
        "\uD800",
        "\uD800a",
        "\uD800\uD800",
        "\uDC00",
        "\uDC00a"
    ])("Given %p throws", (input) => {
        expect(() => src_1.Utf16String.toUtf32Bytes(input, true)).toThrow(src_1.InvalidUtf16StringError);
    });
});
describe("Utf16String.fromUtf8Bytes", () => {
    test.each([
        [new Uint8Array([]), ""],
        [new Uint8Array([0x61]), "a"],
        [new Uint8Array([0x61, 0xC2, 0xA5]), "a¥"],
        [new Uint8Array([0xEF, 0xBB, 0xBF]), "\uFEFF"],
        [new Uint8Array([0xEF, 0xBB, 0xBF, 0xEF, 0xBB, 0xBF]), "\uFEFF\uFEFF"],
        [new Uint8Array([0x61, 0xE6, 0x9D, 0xB1]), "a\u6771"],
        [new Uint8Array([0xF0, 0x9D, 0x84, 0x9E]), "\uD834\uDD1E"],
    ])("Given %p returns %p", (input, output) => {
        expect(src_1.Utf16String.fromUtf8Bytes(input)).toEqual(output);
    });
    test.each([
        [new Uint8Array([0x0]), "\0"],
    ])("Zero test", (input, output) => {
        expect(src_1.Utf16String.fromUtf8Bytes(input)).toEqual(output);
    });
    // TODO - gives a TypeError instead of a StringDecodingError when running with Jest
    /*test.each([
        new Uint8Array([0xFF])
    ])(
        "Given %p throws",
        (input) => {
            expect(() => Utf16String.fromUtf8Bytes(input)).toThrow(StringDecodingError)
        }
    )*/
    test.each([
        new Uint8Array([0xFF])
    ])("Given %p throws", (input) => {
        expect(() => src_1.Utf16String.fromUtf8Bytes(input)).toThrow();
    });
});
describe("Utf16String.fromUtf8Bytes SkipFirstBom", () => {
    test.each([
        [new Uint8Array([]), ""],
        [new Uint8Array([0x61]), "a"],
        [new Uint8Array([0xEF, 0xBB, 0xBF]), ""],
        [new Uint8Array([0xEF, 0xBB, 0xBF, 0xEF, 0xBB, 0xBF]), "\uFEFF"],
        [new Uint8Array([0xEF, 0xBB, 0xBF, 0x61]), "a"],
    ])("Given %p returns %p", (input, output) => {
        expect(src_1.Utf16String.fromUtf8Bytes(input, true)).toEqual(output);
    });
    test.each([
        [new Uint8Array([0x0]), "\0"],
        [new Uint8Array([0xEF, 0xBB, 0xBF, 0x0]), "\0"],
    ])("Zero test", (input, output) => {
        expect(src_1.Utf16String.fromUtf8Bytes(input, true)).toEqual(output);
    });
});
describe("Utf16String.fromUtf16Bytes", () => {
    test.each([
        [new Uint8Array([]), false, ""],
        [new Uint8Array([0x0, 0x61]), false, "a"],
        [new Uint8Array([0xFE, 0xFF]), false, "\uFEFF"],
        [new Uint8Array([0xFE, 0xFF]), true, ""],
        [new Uint8Array([0xFE, 0xFF, 0xFE, 0xFF]), false, "\uFEFF\uFEFF"],
        [new Uint8Array([0xFE, 0xFF, 0xFE, 0xFF]), true, "\uFEFF"],
        [new Uint8Array([0x0, 0x61, 0x67, 0x71]), false, "a\u6771"],
        [new Uint8Array([0xD8, 0x34, 0xDD, 0x1E]), false, "\uD834\uDD1E"],
    ])("Given %p and %p returns %p", (input, skipFirstBom, output) => {
        expect(src_1.Utf16String.fromUtf16Bytes(input, false, skipFirstBom)).toEqual(output);
    });
    test.each([
        [new Uint8Array([0x0, 0x0]), false, "\0"],
        [new Uint8Array([0xFE, 0xFF, 0x0, 0x0]), true, "\0"],
    ])("Zero test", (input, skipFirstBom, output) => {
        expect(src_1.Utf16String.fromUtf16Bytes(input, false, skipFirstBom)).toEqual(output);
    });
    // TODO - gives a TypeError instead of a StringDecodingError when running with Jest
    /*test.each([
        new Uint8Array([0xFF])
    ])(
        "Given %p throws",
        (input) => {
            expect(() => Utf16String.fromUtf16Bytes(input, false)).toThrow(StringDecodingError)
        }
    )*/
    test.each([
        new Uint8Array([0xFF]),
        new Uint8Array([0xD8, 0x34, 0xDD]),
        new Uint8Array([0xD8, 0x34]),
        new Uint8Array([0xD8, 0x34, 0xD8, 0x34]),
    ])("Given %p throws", (input) => {
        expect(() => src_1.Utf16String.fromUtf16Bytes(input, false)).toThrow();
    });
});
describe("Utf16String.fromUtf16Bytes LittleEndian", () => {
    test.each([
        [new Uint8Array([]), false, ""],
        [new Uint8Array([0x61, 0x0]), false, "a"],
        [new Uint8Array([0xFF, 0xFE]), false, "\uFEFF"],
        [new Uint8Array([0xFF, 0xFE]), true, ""],
        [new Uint8Array([0xFF, 0xFE, 0xFF, 0xFE]), false, "\uFEFF\uFEFF"],
        [new Uint8Array([0xFF, 0xFE, 0xFF, 0xFE]), true, "\uFEFF"],
        [new Uint8Array([0x61, 0x0, 0x71, 0x67]), false, "a\u6771"],
        [new Uint8Array([0x34, 0xD8, 0x1E, 0xDD]), false, "\uD834\uDD1E"],
    ])("Given %p and %p returns %p", (input, skipFirstBom, output) => {
        expect(src_1.Utf16String.fromUtf16Bytes(input, true, skipFirstBom)).toEqual(output);
    });
    test.each([
        [new Uint8Array([0x0, 0x0]), false, "\0"],
        [new Uint8Array([0xFF, 0xFE, 0x0, 0x0]), true, "\0"],
    ])("Zero test", (input, skipFirstBom, output) => {
        expect(src_1.Utf16String.fromUtf16Bytes(input, true, skipFirstBom)).toEqual(output);
    });
    // TODO - gives a TypeError instead of a StringDecodingError when running with Jest
    // see https://github.com/facebook/jest/issues/2549 and https://github.com/nodejs/node/issues/31852 and https://backend.cafe/should-you-use-jest-as-a-testing-library
    /*test.each([
        new Uint8Array([0xFF])
    ])(
        "Given %p throws",
        (input) => {
            expect(() => Utf16String.fromUtf16Bytes(input, false)).toThrow(StringDecodingError)
        }
    )*/
    test.each([
        new Uint8Array([0xFF]),
        new Uint8Array([0x34, 0xD8, 0xDD]),
        new Uint8Array([0x34, 0xD8]),
        new Uint8Array([0x34, 0xD8, 0x34, 0xD8]),
    ])("Given %p throws", (input) => {
        expect(() => src_1.Utf16String.fromUtf16Bytes(input, true)).toThrow();
    });
});
describe("Utf16String.fromUtf32Bytes", () => {
    test.each([
        [new Uint8Array([]), false, ""],
        [new Uint8Array([0x0, 0x0, 0x0, 0x61]), false, "a"],
        [new Uint8Array([0x0, 0x0, 0xFE, 0xFF]), false, "\uFEFF"],
        [new Uint8Array([0x0, 0x0, 0xFE, 0xFF]), true, ""],
        [new Uint8Array([0x0, 0x0, 0xFE, 0xFF, 0x0, 0x0, 0xFE, 0xFF]), false, "\uFEFF\uFEFF"],
        [new Uint8Array([0x0, 0x0, 0xFE, 0xFF, 0x0, 0x0, 0xFE, 0xFF]), true, "\uFEFF"],
        [new Uint8Array([0x0, 0x0, 0x0, 0x61, 0x0, 0x0, 0x67, 0x71]), false, "a\u6771"],
        [new Uint8Array([0x0, 0x01, 0xD1, 0x1E]), false, "\uD834\uDD1E"],
    ])("Given %p and %p returns %p", (input, skipFirstBom, output) => {
        expect(src_1.Utf16String.fromUtf32Bytes(input, false, skipFirstBom)).toEqual(output);
    });
    test.each([
        [new Uint8Array([0x0, 0x0, 0x0, 0x0]), false, "\0"],
        [new Uint8Array([0x0, 0x0, 0xFE, 0xFF, 0x0, 0x0, 0x0, 0x0]), true, "\0"],
    ])("Zero test", (input, skipFirstBom, output) => {
        expect(src_1.Utf16String.fromUtf32Bytes(input, false, skipFirstBom)).toEqual(output);
    });
    test.each([
        new Uint8Array([0xFF]),
        new Uint8Array([0xFF, 0xFF]),
        new Uint8Array([0xFF, 0xFF, 0xFF]),
        new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF]),
        new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF]),
        new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]),
        new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]),
        new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]),
        new Uint8Array([0x0, 0x0, 0xD8, 0x0]),
        new Uint8Array([0x0, 0x11, 0x00, 0x0]),
    ])("Given %p throws", (input) => {
        expect(() => src_1.Utf16String.fromUtf32Bytes(input, false)).toThrow(src_1.StringDecodingError);
    });
});
describe("Utf16String.fromUtf32Bytes LittleEndian", () => {
    test.each([
        [new Uint8Array([]), false, ""],
        [new Uint8Array([0x61, 0x0, 0x0, 0x0]), false, "a"],
        [new Uint8Array([0xFF, 0xFE, 0x0, 0x0]), false, "\uFEFF"],
        [new Uint8Array([0xFF, 0xFE, 0x0, 0x0]), true, ""],
        [new Uint8Array([0xFF, 0xFE, 0x0, 0x0, 0xFF, 0xFE, 0x0, 0x0]), false, "\uFEFF\uFEFF"],
        [new Uint8Array([0xFF, 0xFE, 0x0, 0x0, 0xFF, 0xFE, 0x0, 0x0]), true, "\uFEFF"],
        [new Uint8Array([0x61, 0x0, 0x0, 0x0, 0x71, 0x67, 0x0, 0x0]), false, "a\u6771"],
        [new Uint8Array([0x1E, 0xD1, 0x01, 0x0]), false, "\uD834\uDD1E"],
    ])("Given %p and %p returns %p", (input, skipFirstBom, output) => {
        expect(src_1.Utf16String.fromUtf32Bytes(input, true, skipFirstBom)).toEqual(output);
    });
    test.each([
        [new Uint8Array([0x0, 0x0, 0x0, 0x0]), false, "\0"],
        [new Uint8Array([0xFF, 0xFE, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]), true, "\0"],
    ])("Zero test", (input, skipFirstBom, output) => {
        expect(src_1.Utf16String.fromUtf32Bytes(input, true, skipFirstBom)).toEqual(output);
    });
    test.each([
        new Uint8Array([0xFF]),
        new Uint8Array([0xFF, 0xFF]),
        new Uint8Array([0xFF, 0xFF, 0xFF]),
        new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF]),
        new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF]),
        new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]),
        new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]),
        new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]),
        new Uint8Array([0x0, 0xD8, 0x0, 0x0]),
        new Uint8Array([0x0, 0x0, 0x11, 0x0]),
    ])("Given %p throws", (input) => {
        expect(() => src_1.Utf16String.fromUtf32Bytes(input, true)).toThrow(src_1.StringDecodingError);
    });
});
describe("Utf16String.fromCodePointArray", () => {
    test.each([
        [[], ""],
        [[0x61], "a"],
        [[0x61, 0x62], "ab"],
        [[0x6771], "\u6771"],
        [[0xFEFF], "\uFEFF"],
        [[0x1D11E], "\uD834\uDD1E"],
    ])("Given %p returns %p", (input, output) => {
        expect(src_1.Utf16String.fromCodePointArray(input)).toEqual(output);
    });
    test.each([
        [[0x0], "\0"],
        [[0x0, 0x0], "\0\0"],
    ])("Zero test", (input, output) => {
        expect(src_1.Utf16String.fromCodePointArray(input)).toEqual(output);
    });
    test.each([
        [[0x110000]],
        [[0xD800]],
    ])("Given %p throws", (input) => {
        expect(() => src_1.Utf16String.fromCodePointArray(input)).toThrow(src_1.StringDecodingError);
    });
});
// ----------------------------------------------------------------------
describe("ReliableTxtEncoder.encode", () => {
    test.each([
        ["", src_1.ReliableTxtEncoding.Utf8, new Uint8Array([0xEF, 0xBB, 0xBF])],
        ["a", src_1.ReliableTxtEncoding.Utf8, new Uint8Array([0xEF, 0xBB, 0xBF, 0x61])],
        ["", src_1.ReliableTxtEncoding.Utf16, new Uint8Array([0xFE, 0xFF])],
        ["a", src_1.ReliableTxtEncoding.Utf16, new Uint8Array([0xFE, 0xFF, 0x0, 0x61])],
        ["", src_1.ReliableTxtEncoding.Utf16Reverse, new Uint8Array([0xFF, 0xFE])],
        ["a", src_1.ReliableTxtEncoding.Utf16Reverse, new Uint8Array([0xFF, 0xFE, 0x61, 0x0])],
        ["", src_1.ReliableTxtEncoding.Utf32, new Uint8Array([0x0, 0x0, 0xFE, 0xFF])],
        ["a", src_1.ReliableTxtEncoding.Utf32, new Uint8Array([0x0, 0x0, 0xFE, 0xFF, 0x0, 0x0, 0x0, 0x61])],
    ])("Given %p and %p returns %p", (input, encoding, output) => {
        expect(src_1.ReliableTxtEncoder.encode(input, encoding)).toEqual(output);
    });
    test("Invalid encoding", () => {
        expect(() => src_1.ReliableTxtEncoder.encode("", 4)).toThrow(RangeError);
    });
});
// ----------------------------------------------------------------------
describe("ReliableTxtDecoder.getEncodingOrNull", () => {
    test.each([
        [new Uint8Array([0xEF, 0xBB, 0xBF]), src_1.ReliableTxtEncoding.Utf8],
        [new Uint8Array([0xEF, 0xBB, 0xBF, 0x61]), src_1.ReliableTxtEncoding.Utf8],
        [new Uint8Array([0xFE, 0xFF]), src_1.ReliableTxtEncoding.Utf16],
        [new Uint8Array([0xFE, 0xFF, 0x0, 0x61]), src_1.ReliableTxtEncoding.Utf16],
        [new Uint8Array([0xFF, 0xFE]), src_1.ReliableTxtEncoding.Utf16Reverse],
        [new Uint8Array([0xFF, 0xFE, 0x61, 0x0]), src_1.ReliableTxtEncoding.Utf16Reverse],
        [new Uint8Array([0x0, 0x0, 0xFE, 0xFF]), src_1.ReliableTxtEncoding.Utf32],
        [new Uint8Array([0x0, 0x0, 0xFE, 0xFF, 0x0, 0x0, 0x0, 0x61]), src_1.ReliableTxtEncoding.Utf32],
        [new Uint8Array([]), null],
        [new Uint8Array([0x0]), null],
    ])("Given %p returns %p", (input, output) => {
        expect(src_1.ReliableTxtDecoder.getEncodingOrNull(input)).toEqual(output);
    });
});
describe("ReliableTxtDecoder.getEncoding", () => {
    test.each([
        [new Uint8Array([0xEF, 0xBB, 0xBF]), src_1.ReliableTxtEncoding.Utf8],
        [new Uint8Array([0xEF, 0xBB, 0xBF, 0x61]), src_1.ReliableTxtEncoding.Utf8],
        [new Uint8Array([0xFE, 0xFF]), src_1.ReliableTxtEncoding.Utf16],
        [new Uint8Array([0xFE, 0xFF, 0x0, 0x61]), src_1.ReliableTxtEncoding.Utf16],
        [new Uint8Array([0xFF, 0xFE]), src_1.ReliableTxtEncoding.Utf16Reverse],
        [new Uint8Array([0xFF, 0xFE, 0x61, 0x0]), src_1.ReliableTxtEncoding.Utf16Reverse],
        [new Uint8Array([0x0, 0x0, 0xFE, 0xFF]), src_1.ReliableTxtEncoding.Utf32],
        [new Uint8Array([0x0, 0x0, 0xFE, 0xFF, 0x0, 0x0, 0x0, 0x61]), src_1.ReliableTxtEncoding.Utf32],
    ])("Given %p returns %p", (input, output) => {
        expect(src_1.ReliableTxtDecoder.getEncoding(input)).toEqual(output);
    });
    test.each([
        [new Uint8Array([])],
        [new Uint8Array([0x0])],
    ])("Given %p throws", (input) => {
        expect(() => src_1.ReliableTxtDecoder.getEncoding(input)).toThrow(src_1.NoReliableTxtPreambleError);
    });
});
describe("ReliableTxtDecoder.decode", () => {
    test.each([
        [new Uint8Array([0xEF, 0xBB, 0xBF]), src_1.ReliableTxtEncoding.Utf8, ""],
        [new Uint8Array([0xEF, 0xBB, 0xBF, 0x61]), src_1.ReliableTxtEncoding.Utf8, "a"],
        [new Uint8Array([0xFE, 0xFF]), src_1.ReliableTxtEncoding.Utf16, ""],
        [new Uint8Array([0xFE, 0xFF, 0x0, 0x61]), src_1.ReliableTxtEncoding.Utf16, "a"],
        [new Uint8Array([0xFF, 0xFE]), src_1.ReliableTxtEncoding.Utf16Reverse, ""],
        [new Uint8Array([0xFF, 0xFE, 0x61, 0x0]), src_1.ReliableTxtEncoding.Utf16Reverse, "a"],
        [new Uint8Array([0x0, 0x0, 0xFE, 0xFF]), src_1.ReliableTxtEncoding.Utf32, ""],
        [new Uint8Array([0x0, 0x0, 0xFE, 0xFF, 0x0, 0x0, 0x0, 0x61]), src_1.ReliableTxtEncoding.Utf32, "a"],
    ])("Given %p returns %p and %p", (input, encoding, text) => {
        const document = src_1.ReliableTxtDecoder.decode(input);
        expect(document.encoding).toEqual(encoding);
        expect(document.text).toEqual(text);
    });
    test.each([
        [new Uint8Array([])],
        [new Uint8Array([0x0])],
    ])("Given %p throws", (input) => {
        expect(() => src_1.ReliableTxtDecoder.decode(input)).toThrow(src_1.NoReliableTxtPreambleError);
    });
});
describe("ReliableTxtDecoder.decodePart", () => {
    test.each([
        [new Uint8Array([]), src_1.ReliableTxtEncoding.Utf8, ""],
        [new Uint8Array([0xEF, 0xBB, 0xBF]), src_1.ReliableTxtEncoding.Utf8, "\uFEFF"],
        [new Uint8Array([0xEF, 0xBB, 0xBF, 0x61]), src_1.ReliableTxtEncoding.Utf8, "\uFEFFa"],
        [new Uint8Array([0x61]), src_1.ReliableTxtEncoding.Utf8, "a"],
        [new Uint8Array([]), src_1.ReliableTxtEncoding.Utf16, ""],
        [new Uint8Array([0xFE, 0xFF]), src_1.ReliableTxtEncoding.Utf16, "\uFEFF"],
        [new Uint8Array([0xFE, 0xFF, 0x0, 0x61]), src_1.ReliableTxtEncoding.Utf16, "\uFEFFa"],
        [new Uint8Array([0x0, 0x61]), src_1.ReliableTxtEncoding.Utf16, "a"],
        [new Uint8Array([]), src_1.ReliableTxtEncoding.Utf16Reverse, ""],
        [new Uint8Array([0xFF, 0xFE]), src_1.ReliableTxtEncoding.Utf16Reverse, "\uFEFF"],
        [new Uint8Array([0xFF, 0xFE, 0x61, 0x0]), src_1.ReliableTxtEncoding.Utf16Reverse, "\uFEFFa"],
        [new Uint8Array([0x61, 0x0]), src_1.ReliableTxtEncoding.Utf16Reverse, "a"],
        [new Uint8Array([]), src_1.ReliableTxtEncoding.Utf32, ""],
        [new Uint8Array([0x0, 0x0, 0xFE, 0xFF]), src_1.ReliableTxtEncoding.Utf32, "\uFEFF"],
        [new Uint8Array([0x0, 0x0, 0xFE, 0xFF, 0x0, 0x0, 0x0, 0x61]), src_1.ReliableTxtEncoding.Utf32, "\uFEFFa"],
        [new Uint8Array([0x0, 0x0, 0x0, 0x61]), src_1.ReliableTxtEncoding.Utf32, "a"],
    ])("Given %p and %p returns %p", (input, encoding, output) => {
        expect(src_1.ReliableTxtDecoder.decodePart(input, encoding)).toEqual(output);
    });
    expect(() => src_1.ReliableTxtDecoder.decodePart(new Uint8Array([]), 4)).toThrow(RangeError);
});
// ----------------------------------------------------------------------
describe("ReliableTxtDocument Constructor", () => {
    test("Empty", () => {
        const document = new src_1.ReliableTxtDocument();
        expect(document.text).toEqual("");
        expect(document.encoding).toEqual(src_1.ReliableTxtEncoding.Utf8);
    });
    test("Text", () => {
        const document = new src_1.ReliableTxtDocument("abc");
        expect(document.text).toEqual("abc");
        expect(document.encoding).toEqual(src_1.ReliableTxtEncoding.Utf8);
    });
    test("TextAndEncoding", () => {
        const document = new src_1.ReliableTxtDocument("abc", src_1.ReliableTxtEncoding.Utf16);
        expect(document.text).toEqual("abc");
        expect(document.encoding).toEqual(src_1.ReliableTxtEncoding.Utf16);
    });
});
describe("ReliableTxtDocument.getBytes + fromBytes", () => {
    test.each([
        ["", src_1.ReliableTxtEncoding.Utf8, new Uint8Array([0xEF, 0xBB, 0xBF])],
        ["", src_1.ReliableTxtEncoding.Utf16, new Uint8Array([0xFE, 0xFF])],
        ["", src_1.ReliableTxtEncoding.Utf16Reverse, new Uint8Array([0xFF, 0xFE])],
        ["", src_1.ReliableTxtEncoding.Utf32, new Uint8Array([0x0, 0x0, 0xFE, 0xFF])],
        ["a", src_1.ReliableTxtEncoding.Utf8, new Uint8Array([0xEF, 0xBB, 0xBF, 0x61])],
        ["a", src_1.ReliableTxtEncoding.Utf16, new Uint8Array([0xFE, 0xFF, 0x0, 0x61])],
        ["a", src_1.ReliableTxtEncoding.Utf16Reverse, new Uint8Array([0xFF, 0xFE, 0x61, 0x0])],
        ["a", src_1.ReliableTxtEncoding.Utf32, new Uint8Array([0x0, 0x0, 0xFE, 0xFF, 0x0, 0x0, 0x0, 0x61])],
    ])("Given %p and %p returns %p", (input, encoding, output) => {
        expect(new src_1.ReliableTxtDocument(input, encoding).getBytes()).toEqual(output);
        const document = src_1.ReliableTxtDocument.fromBytes(output);
        expect(document.encoding).toBe(encoding);
        expect(document.text).toBe(input);
    });
});
describe("ReliableTxtDocument.setLines + getLines + fromLines", () => {
    test.each([
        [[""], ""],
        [["Line1"], "Line1"],
        [["Line1", "Line2"], "Line1\nLine2"],
        [["Line1", "Line2", "Line3"], "Line1\nLine2\nLine3"],
        [["", "Line2", "Line3"], "\nLine2\nLine3"],
        [["Line1", "", "Line3"], "Line1\n\nLine3"],
        [["Line1", "Line2", ""], "Line1\nLine2\n"],
    ])("Given %p returns %p", (input, output) => {
        const document = new src_1.ReliableTxtDocument();
        document.setLines(input);
        expect(document.text).toEqual(output);
        expect(document.getLines()).toEqual(input);
        const fromDocument = src_1.ReliableTxtDocument.fromLines(input);
        expect(fromDocument.text).toEqual(output);
        expect(fromDocument.getLines()).toEqual(input);
    });
    test("Empty", () => {
        const document = new src_1.ReliableTxtDocument();
        document.setLines([]);
        expect(document.text).toEqual("");
        expect(document.getLines()).toEqual([""]);
    });
});
describe("ReliableTxtDocument.fromLines Encoding", () => {
    test.each([
        [src_1.ReliableTxtEncoding.Utf8],
        [src_1.ReliableTxtEncoding.Utf16],
        [src_1.ReliableTxtEncoding.Utf16Reverse],
        [src_1.ReliableTxtEncoding.Utf32],
    ])("Given %p returns %p", (encoding) => {
        const fromDocument = src_1.ReliableTxtDocument.fromLines([], encoding);
        expect(fromDocument.encoding).toEqual(encoding);
    });
});
describe("ReliableTxtDocument.setCodePoints + getCodePoints + fromCodePoints", () => {
    test.each([
        [[], ""],
        [[0x61], "a"],
        [[0x61, 0x62], "ab"],
        [[0x6771], "\u6771"],
        [[0x1D11E], "\uD834\uDD1E"],
    ])("Given %p returns %p", (input, output) => {
        const document = new src_1.ReliableTxtDocument();
        document.setCodePoints(input);
        expect(document.text).toEqual(output);
        expect(document.getCodePoints()).toEqual(input);
        const fromDocument = src_1.ReliableTxtDocument.fromCodePoints(input);
        expect(fromDocument.text).toEqual(output);
        expect(fromDocument.getCodePoints()).toEqual(input);
    });
});
describe("ReliableTxtDocument.fromCodePoints Encoding", () => {
    test.each([
        [src_1.ReliableTxtEncoding.Utf8],
        [src_1.ReliableTxtEncoding.Utf16],
        [src_1.ReliableTxtEncoding.Utf16Reverse],
        [src_1.ReliableTxtEncoding.Utf32],
    ])("Given %p returns %p", (encoding) => {
        const fromDocument = src_1.ReliableTxtDocument.fromCodePoints([], encoding);
        expect(fromDocument.encoding).toEqual(encoding);
    });
});
describe("ReliableTxtDocument.toBase64String + fromBase64String", () => {
    test.each([
        [""],
        ["a"],
        ["a~¥»½¿ßäïœ€東𝄞𠀇"],
    ])("Given %p", (input) => {
        for (let i = 0; i < 3; i++) {
            const encoding = i;
            const document = new src_1.ReliableTxtDocument(input, encoding);
            expect(document.encoding).toEqual(encoding);
            const base64Str = document.toBase64String();
            expect(base64Str.startsWith("Base64|")).toEqual(true);
            expect(base64Str.endsWith("|")).toEqual(true);
            const fromDocument = src_1.ReliableTxtDocument.fromBase64String(base64Str);
            expect(fromDocument.text).toEqual(input);
            expect(fromDocument.encoding).toEqual(encoding);
        }
    });
});
describe("ReliableTxtDocument.toBase64String", () => {
    test.each([
        ["", src_1.ReliableTxtEncoding.Utf8, "Base64|77u/|"],
        ["Many hands make light work.", src_1.ReliableTxtEncoding.Utf8, "Base64|77u/TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu|"],
        ["\u0000", src_1.ReliableTxtEncoding.Utf8, "Base64|77u/AA==|"],
        ["Man", src_1.ReliableTxtEncoding.Utf8, "Base64|77u/TWFu|"],
        ["a¥ßä€東𝄞", src_1.ReliableTxtEncoding.Utf8, "Base64|77u/YcKlw5/DpOKCrOadsfCdhJ4=|"],
        ["Man", src_1.ReliableTxtEncoding.Utf16, "Base64|/v8ATQBhAG4=|"],
        ["Man", src_1.ReliableTxtEncoding.Utf16Reverse, "Base64|//5NAGEAbgA=|"],
        ["Man", src_1.ReliableTxtEncoding.Utf32, "Base64|AAD+/wAAAE0AAABhAAAAbg==|"],
    ])("Given %p and %p returns %p", (input1, input2, output) => {
        const document = new src_1.ReliableTxtDocument(input1, input2);
        expect(document.toBase64String()).toEqual(output);
    });
});
describe("ReliableTxtDocument.fromBase64String", () => {
    test.each([
        ["Base64|77u/|", "", src_1.ReliableTxtEncoding.Utf8],
        ["Base64|77u/AA==|", "\u0000", src_1.ReliableTxtEncoding.Utf8],
        ["Base64|77u/TWFu|", "Man", src_1.ReliableTxtEncoding.Utf8],
        ["Base64|77u/8J2Eng==|", "𝄞", src_1.ReliableTxtEncoding.Utf8],
        ["Base64|/v8ATQBhAG4=|", "Man", src_1.ReliableTxtEncoding.Utf16],
        ["Base64|//5NAGEAbgA=|", "Man", src_1.ReliableTxtEncoding.Utf16Reverse],
        ["Base64|AAD+/wAAAE0AAABhAAAAbg==|", "Man", src_1.ReliableTxtEncoding.Utf32],
    ])("Given %p returns %p and %p", (input, output1, output2) => {
        const fromDocument = src_1.ReliableTxtDocument.fromBase64String(input);
        expect(fromDocument.text).toEqual(output1);
        expect(fromDocument.encoding).toEqual(output2);
    });
    test.each([
        ["Base64||"],
        ["Base64|TWFu|"],
        ["BASE64|77u/TWFu|"],
        ["77u/TWFu"],
    ])("Given %p throws", (input) => {
        expect(() => src_1.ReliableTxtDocument.fromBase64String(input)).toThrow();
    });
});
// ----------------------------------------------------------------------
test("InvalidBase64StringError", () => {
    expect(new src_1.InvalidBase64StringError().message).toEqual("Invalid Base64 string");
});
// ----------------------------------------------------------------------
describe("Base64String.rawFromBytes + rawToBytes", () => {
    test.each([
        [[], ""],
        [[0x4d], "TQ=="],
        [[0x4d, 0x61], "TWE="],
        [[0x4d, 0x61, 0x6e], "TWFu"],
        [[0x4d, 0x61, 0x6e, 0x4d], "TWFuTQ=="],
        [[0x0], "AA=="],
        [[0x0, 0x0], "AAA="],
        [[0x0, 0x0, 0x0], "AAAA"],
        [[0x0, 0x0, 0x1], "AAAB"],
        [[0x20, 0x21, 0x22], "ICEi"],
        [[0xA5, 0xDF], "pd8="],
        [[0xFF], "/w=="],
        [[0xFF, 0xFF], "//8="],
        [[0xFF, 0xFF, 0xFF], "////"],
        [[0xFF, 0xFF, 0xFE], "///+"],
        [[0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF], "////////"],
    ])("Given %p returns %p", (input, output) => {
        const bytes = new Uint8Array(input);
        const base64Str = src_1.Base64String.rawFromBytes(bytes);
        expect(base64Str).toEqual(output);
        expect(src_1.Base64String.rawToBytes(base64Str)).toEqual(bytes);
    });
});
describe("Base64String.rawToBytes", () => {
    test.each([
        ["a"],
        ["&aaa"],
        ["ßaaa"],
        ["&aa="],
        ["ßaa="],
        ["&a=="],
        ["ßa=="],
    ])("Given %p throws", (input) => {
        expect(() => src_1.Base64String.rawToBytes(input)).toThrow();
    });
});
test("Base64String.rawFromBytes + rawToBytes 256", () => {
    const byteValues = [...Array(256).keys()];
    expect(byteValues.length).toEqual(256);
    const bytes = new Uint8Array(byteValues);
    const base64Str = src_1.Base64String.rawFromBytes(bytes);
    expect(base64Str).toEqual("AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==");
    expect(src_1.Base64String.rawToBytes(base64Str)).toEqual(bytes);
});
describe("Base64String.rawFromText + rawToText", () => {
    test.each([
        ["", src_1.ReliableTxtEncoding.Utf8, "77u/"],
        ["M", src_1.ReliableTxtEncoding.Utf8, "77u/TQ=="],
        ["Ma", src_1.ReliableTxtEncoding.Utf8, "77u/TWE="],
        ["Man", src_1.ReliableTxtEncoding.Utf8, "77u/TWFu"],
        ["Many", src_1.ReliableTxtEncoding.Utf8, "77u/TWFueQ=="],
        ["\uFEFF", src_1.ReliableTxtEncoding.Utf8, "77u/77u/"],
        ["Many hands make light work.", src_1.ReliableTxtEncoding.Utf8, "77u/TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu"],
        ["", src_1.ReliableTxtEncoding.Utf16, "/v8="],
        ["M", src_1.ReliableTxtEncoding.Utf16, "/v8ATQ=="],
        ["Ma", src_1.ReliableTxtEncoding.Utf16, "/v8ATQBh"],
        ["Man", src_1.ReliableTxtEncoding.Utf16, "/v8ATQBhAG4="],
        ["\uFEFF", src_1.ReliableTxtEncoding.Utf16, "/v/+/w=="],
        ["", src_1.ReliableTxtEncoding.Utf16Reverse, "//4="],
        ["M", src_1.ReliableTxtEncoding.Utf16Reverse, "//5NAA=="],
        ["Ma", src_1.ReliableTxtEncoding.Utf16Reverse, "//5NAGEA"],
        ["Man", src_1.ReliableTxtEncoding.Utf16Reverse, "//5NAGEAbgA="],
        ["\uFEFF", src_1.ReliableTxtEncoding.Utf16Reverse, "//7//g=="],
        ["", src_1.ReliableTxtEncoding.Utf32, "AAD+/w=="],
        ["M", src_1.ReliableTxtEncoding.Utf32, "AAD+/wAAAE0="],
        ["Ma", src_1.ReliableTxtEncoding.Utf32, "AAD+/wAAAE0AAABh"],
        ["Man", src_1.ReliableTxtEncoding.Utf32, "AAD+/wAAAE0AAABhAAAAbg=="],
        ["\uFEFF", src_1.ReliableTxtEncoding.Utf32, "AAD+/wAA/v8="],
    ])("Given %p returns %p", (input1, input2, output) => {
        const base64Str = src_1.Base64String.rawFromText(input1, input2);
        expect(base64Str).toEqual(output);
        expect(src_1.Base64String.rawToText(base64Str)).toEqual(input1);
    });
    test("Without encoding", () => {
        const base64Str = src_1.Base64String.rawFromText("Man");
        expect(base64Str).toEqual("77u/TWFu");
        expect(src_1.Base64String.rawToText(base64Str)).toEqual("Man");
    });
});
describe("Base64String.fromBytes + toBytes", () => {
    test.each([
        [[], "Base64||"],
        [[0x4d], "Base64|TQ==|"],
        [[0x4d, 0x61], "Base64|TWE=|"],
        [[0x4d, 0x61, 0x6e], "Base64|TWFu|"],
        [[0x4d, 0x61, 0x6e, 0x4d], "Base64|TWFuTQ==|"],
        [[0x0], "Base64|AA==|"],
        [[0x0, 0x0], "Base64|AAA=|"],
        [[0x0, 0x0, 0x0], "Base64|AAAA|"],
        [[0x0, 0x0, 0x1], "Base64|AAAB|"],
        [[0x20, 0x21, 0x22], "Base64|ICEi|"],
        [[0xA5, 0xDF], "Base64|pd8=|"],
        [[0xFF], "Base64|/w==|"],
        [[0xFF, 0xFF], "Base64|//8=|"],
        [[0xFF, 0xFF, 0xFF], "Base64|////|"],
        [[0xFF, 0xFF, 0xFE], "Base64|///+|"],
        [[0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF], "Base64|////////|"],
    ])("Given %p returns %p", (input, output) => {
        const bytes = new Uint8Array(input);
        const base64Str = src_1.Base64String.fromBytes(bytes);
        expect(base64Str).toEqual(output);
        expect(src_1.Base64String.toBytes(base64Str)).toEqual(bytes);
    });
});
describe("Base64String.toBytes", () => {
    test.each([
        ["AAAA"],
        ["BASE64|AAAA|"],
        ["Base64|AAAA"],
        ["Base64|"],
    ])("Given %p throws", (input) => {
        expect(() => src_1.Base64String.toBytes(input)).toThrow();
    });
});
describe("Base64String.fromText + toText", () => {
    test.each([
        ["Man", src_1.ReliableTxtEncoding.Utf8, "Base64|77u/TWFu|"],
        ["Man", src_1.ReliableTxtEncoding.Utf16, "Base64|/v8ATQBhAG4=|"],
        ["Man", src_1.ReliableTxtEncoding.Utf16Reverse, "Base64|//5NAGEAbgA=|"],
        ["Man", src_1.ReliableTxtEncoding.Utf32, "Base64|AAD+/wAAAE0AAABhAAAAbg==|"],
    ])("Given %p returns %p", (input1, input2, output) => {
        const base64Str = src_1.Base64String.fromText(input1, input2);
        expect(base64Str).toEqual(output);
        expect(src_1.Base64String.toText(base64Str)).toEqual(input1);
    });
    test("Without encoding", () => {
        const base64Str = src_1.Base64String.fromText("Man");
        expect(base64Str).toEqual("Base64|77u/TWFu|");
        expect(src_1.Base64String.toText(base64Str)).toEqual("Man");
    });
});
//# sourceMappingURL=reliabletxt.test.js.map