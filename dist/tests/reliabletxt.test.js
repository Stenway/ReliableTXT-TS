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
//# sourceMappingURL=reliabletxt.test.js.map