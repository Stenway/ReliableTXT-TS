import { Base64String, InvalidBase64StringError, InvalidUtf16StringError, NoReliableTxtPreambleError, ReliableTxtDecoder, ReliableTxtDocument, ReliableTxtEncoder, ReliableTxtEncoding, ReliableTxtEncodingUtil, ReliableTxtLines, StringDecodingError, Utf16String } from "../src/reliabletxt.js"

describe("ReliableTxtEncoding", () => {
	test.each([
		[ReliableTxtEncoding.Utf8, 0],
		[ReliableTxtEncoding.Utf16, 1],
		[ReliableTxtEncoding.Utf16Reverse, 2],
		[ReliableTxtEncoding.Utf32, 3],
	])(
		"%p is %p",
		(input, output) => {
			expect(input).toEqual(output)
		}
	)
})

// ----------------------------------------------------------------------

describe("ReliableTxtEncodingUtil.getPreambleSize", () => {
	test.each([
		[ReliableTxtEncoding.Utf8, 3],
		[ReliableTxtEncoding.Utf16, 2],
		[ReliableTxtEncoding.Utf16Reverse, 2],
		[ReliableTxtEncoding.Utf32, 4],
	])(
		"Given %p returns %p",
		(input, output) => {
			expect(ReliableTxtEncodingUtil.getPreambleSize(input)).toEqual(output)
		}
	)

	test("Invalid encoding", () => {
		expect(() => ReliableTxtEncodingUtil.getPreambleSize(4 as ReliableTxtEncoding)).toThrow(RangeError)
	})
})

// ----------------------------------------------------------------------

describe("ReliableTxtEncodingUtil.getPreambleBytes", () => {
	test.each([
		[ReliableTxtEncoding.Utf8, [0xEF, 0xBB, 0xBF]],
		[ReliableTxtEncoding.Utf16, [0xFE, 0xFF]],
		[ReliableTxtEncoding.Utf16Reverse, [0xFF, 0xFE]],
		[ReliableTxtEncoding.Utf32, [0x0, 0x0, 0xFE, 0xFF]],
	])(
		"Given %p returns %p",
		(input, output) => {
			expect(ReliableTxtEncodingUtil.getPreambleBytes(input)).toEqual(new Uint8Array(output))
		}
	)

	test("Invalid encoding", () => {
		expect(() => ReliableTxtEncodingUtil.getPreambleBytes(4 as ReliableTxtEncoding)).toThrow(RangeError)
	})
})

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
		[["\u0000", "\u0000"], "\u0000\n\u0000"],
		[["𝄞", "𝄞"], "𝄞\n𝄞"],
	])(
		"Given %j returns %j",
		(input, output) => {
			expect(ReliableTxtLines.join(input)).toEqual(output)
		}
	)
})

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
	])(
		"Given %p returns %p",
		(input, output) => {
			expect(ReliableTxtLines.split(input)).toEqual(output)
		}
	)
})

describe("ReliableTxtLines.getLineInfo", () => {
	test.each([
		["", 0, 0, 0, 0],
		["a", 0, 0, 0, 0],
		["a", 1, 1, 0, 1],
		["ab", 1, 1, 0, 1],
		["ab", 2, 2, 0, 2],
		["\n", 0, 0, 0, 0],
		["\n", 1, 0, 1, 0],
		["a\nb", 0, 0, 0, 0],
		["a\nb", 1, 1, 0, 1],
		["a\nb", 2, 0, 1, 0],
		["a\nb", 3, 1, 1, 1],
		["\uD834\uDD1E", 0, 0, 0, 0],
		["\uD834\uDD1E", 1, 1, 0, 1],
		["\uD834\uDD1E", 2, 1, 0, 1],
		["\uD834\uDD1Ea", 2, 1, 0, 1],
		["\uD834\uDD1Ea", 3, 2, 0, 2],
		["\uD834\uDD1E\uD834\uDD1E", 3, 2, 0, 2],
		["\uD834\uDD1E\uD834\uDD1E", 4, 2, 0, 2],
		["\n\uD834\uDD1E", 1, 0, 1, 0],
		["\n\uD834\uDD1E", 2, 1, 1, 1],
		["\n\uD834\uDD1E", 3, 1, 1, 1],
		["\n\uD834\uDD1E\uD834\uDD1E", 4, 2, 1, 2],
		["\n\uD834\uDD1E\uD834\uDD1E", 5, 2, 1, 2],
		["a𝄞\n𝄞b\n𝄞", 0, 0, 0, 0],
		["a𝄞\n𝄞b\n𝄞", 1, 1, 0, 1],
		["a𝄞\n𝄞b\n𝄞", 2, 1, 0, 1],
		["a𝄞\n𝄞b\n𝄞", 3, 2, 0, 2],
		["a𝄞\n𝄞b\n𝄞", 4, 0, 1, 0],
	])(
		"Given %p and %p returns %p, %p and %p",
		(input1, input2, output1, output2, output3) => {
			const result = ReliableTxtLines.getLineInfo(input1, input2)
			expect(result).toEqual([output1, output2, output3])
		}
	)

	test.each([
		["", 1],
		["", -1],
		["\uD834", 1],
		["\uD834\uD834", 1],
		["\uDD1E", 1],
	])(
		"Given %p and %p throws",
		(input1, input2) => {
			expect(() => ReliableTxtLines.getLineInfo(input1, input2)).toThrowError()
		}
	)
})

// ----------------------------------------------------------------------

test("InvalidUtf16StringError", () => {
	expect(new InvalidUtf16StringError().message).toEqual("Invalid UTF16 string")
})

// ----------------------------------------------------------------------

test("StringDecodingError", () => {
	expect(new StringDecodingError().message).toEqual("Could not decode string")
})

// ----------------------------------------------------------------------

test("NoReliableTxtPreambleError", () => {
	expect(new NoReliableTxtPreambleError().message).toEqual("Document does not have a ReliableTXT preamble")
})

// ----------------------------------------------------------------------

describe("Utf16String.isValid", () => {
	test.each([
		["", true],
		["a", true],
		["\u0000", true],
		["\uD800", false],
		["\uD800a", false],
		["\uDC00", false],
		["\uDC00a", false],
		["\uD800\uDC00", true],
		["\uD800\uDC00a", true],
		["a\uD800\uDC00", true],
		["a\uD800\uDC00a", true],
	])(
		"Given %j returns %p",
		(input, output) => {
			expect(Utf16String.isValid(input)).toEqual(output)
		}
	)
})

describe("Utf16String.validate", () => {
	test.each([
		"\uD800",
		"\uD800a",
		"\uDC00",
		"\uDC00a"
	])(
		"Given %p throws",
		(input) => {
			expect(() => Utf16String.validate(input)).toThrow(InvalidUtf16StringError)
		}
	)

	test.each([
		"",
		"a",
		"\uD800\uDC00",
		"\uD800\uDC00a",
		"a\uD800\uDC00",
		"a\uD800\uDC00a",
	])(
		"Given %p does not throw",
		(input) => {
			expect(Utf16String.validate(input))
		}
	)
})

describe("Utf16String.getCodePointCount", () => {
	test.each([
		["", 0],
		["a", 1],
		["\u0000", 1],
		["\uD800\uDC00", 1],
		["\uD800\uDC00a", 2],
		["a\uD800\uDC00", 2],
		["a\uD800\uDC00a", 3],
	])(
		"Given %j returns %p",
		(input, output) => {
			expect(Utf16String.getCodePointCount(input)).toEqual(output)
		}
	)

	test.each([
		"\uD800",
		"\uD800a",
		"\uD800\uD800",
		"\uDC00",
		"\uDC00a"
	])(
		"Given %p throws",
		(input) => {
			expect(() => Utf16String.getCodePointCount(input)).toThrow(InvalidUtf16StringError)
		}
	)
})

describe("Utf16String.getCodePointArray", () => {
	test.each([
		["", []],
		["a", [0x61]],
		["a\u6771", [0x61, 0x6771]],
		["\uD834\uDD1E", [0x1D11E]],
	])(
		"Given %p returns %p",
		(input, output) => {
			expect(Utf16String.getCodePointArray(input)).toEqual(output)
		}
	)

	test.each([
		"\uD800",
		"\uD800a",
		"\uD800\uD800",
		"\uDC00",
		"\uDC00a"
	])(
		"Given %p throws",
		(input) => {
			expect(() => Utf16String.getCodePointArray(input)).toThrow(InvalidUtf16StringError)
		}
	)
})

describe("Utf16String.getCodePoints", () => {
	test.each([
		["", new Uint32Array([])],
		["a", new Uint32Array([0x61])],
		["\u0000", new Uint32Array([0x0])],
		["a\u6771", new Uint32Array([0x61, 0x6771])],
		["\uD834\uDD1E", new Uint32Array([0x1D11E])],
	])(
		"Given %j returns %p",
		(input, output) => {
			expect(Utf16String.getCodePoints(input)).toEqual(output)
		}
	)

	test.each([
		"\uD800",
		"\uD800a",
		"\uD800\uD800",
		"\uDC00",
		"\uDC00a"
	])(
		"Given %p throws",
		(input) => {
			expect(() => Utf16String.getCodePoints(input)).toThrow(InvalidUtf16StringError)
		}
	)
})

describe("Utf16String.toUtf8Bytes", () => {
	test.each([
		["", new Uint8Array([])],
		["a", new Uint8Array([0x61])],
		["a¥", new Uint8Array([0x61, 0xC2, 0xA5])],
		["\uFEFF", new Uint8Array([0xEF, 0xBB, 0xBF])],
		["\uFEFF\uFEFF", new Uint8Array([0xEF, 0xBB, 0xBF, 0xEF, 0xBB, 0xBF])],
		["a\u6771", new Uint8Array([0x61, 0xE6, 0x9D, 0xB1])],
		["\uD834\uDD1E", new Uint8Array([0xF0, 0x9D, 0x84, 0x9E])],
		["\u0000", new Uint8Array([0x0])],
	])(
		"Given %j returns %p",
		(input, output) => {
			expect(Utf16String.toUtf8Bytes(input)).toEqual(output)
		}
	)
	
	test.each([
		"\uD800",
		"\uD800a",
		"\uD800\uD800",
		"\uDC00",
		"\uDC00a"
	])(
		"Given %p throws",
		(input) => {
			expect(() => Utf16String.toUtf8Bytes(input)).toThrow(InvalidUtf16StringError)
		}
	)
})

describe("Utf16String.toUtf16Bytes", () => {
	test.each([
		["", new Uint8Array([])],
		["a", new Uint8Array([0x0, 0x61])],
		["\uFEFF", new Uint8Array([0xFE, 0xFF])],
		["\uFEFF\uFEFF", new Uint8Array([0xFE, 0xFF, 0xFE, 0xFF])],
		["\uD834\uDD1E", new Uint8Array([0xD8, 0x34, 0xDD, 0x1E])],
		["\u0000", new Uint8Array([0x0, 0x0])],
	])(
		"Given %j returns %p",
		(input, output) => {
			expect(Utf16String.toUtf16Bytes(input)).toEqual(output)
		}
	)

	test.each([
		"\uD800",
		"\uD800a",
		"\uD800\uD800",
		"\uDC00",
		"\uDC00a"
	])(
		"Given %p throws",
		(input) => {
			expect(() => Utf16String.toUtf16Bytes(input)).toThrow(InvalidUtf16StringError)
		}
	)
})

describe("Utf16String.toUtf16Bytes LittleEndian", () => {
	test.each([
		["", new Uint8Array([])],
		["a", new Uint8Array([0x61, 0x0])],
		["\uFEFF", new Uint8Array([0xFF, 0xFE])],
		["\uFEFF\uFEFF", new Uint8Array([0xFF, 0xFE, 0xFF, 0xFE])],
		["\uD834\uDD1E", new Uint8Array([0x34, 0xD8, 0x1E, 0xDD])],
		["\u0000", new Uint8Array([0x0, 0x0])],
	])(
		"Given %j returns %p",
		(input, output) => {
			expect(Utf16String.toUtf16Bytes(input, true)).toEqual(output)
		}
	)

	test.each([
		"\uD800",
		"\uD800a",
		"\uD800\uD800",
		"\uDC00",
		"\uDC00a"
	])(
		"Given %p throws",
		(input) => {
			expect(() => Utf16String.toUtf16Bytes(input, true)).toThrow(InvalidUtf16StringError)
		}
	)
})

describe("Utf16String.toUtf32Bytes", () => {
	test.each([
		["", new Uint8Array([])],
		["a", new Uint8Array([0x0, 0x0, 0x0, 0x61])],
		["\uFEFF", new Uint8Array([0x0, 0x0, 0xFE, 0xFF])],
		["\uFEFF\uFEFF", new Uint8Array([0x0, 0x0, 0xFE, 0xFF, 0x0, 0x0, 0xFE, 0xFF])],
		["\uD834\uDD1E", new Uint8Array([0x0, 0x01, 0xD1, 0x1E])],
		["\u0000", new Uint8Array([0x0, 0x0, 0x0, 0x0])],
	])(
		"Given %j returns %p",
		(input, output) => {
			expect(Utf16String.toUtf32Bytes(input)).toEqual(output)
		}
	)

	test.each([
		"\uD800",
		"\uD800a",
		"\uD800\uD800",
		"\uDC00",
		"\uDC00a"
	])(
		"Given %p throws",
		(input) => {
			expect(() => Utf16String.toUtf32Bytes(input)).toThrow(InvalidUtf16StringError)
		}
	)
})

describe("Utf16String.toUtf32Bytes LittleEndian", () => {
	test.each([
		["", new Uint8Array([])],
		["a", new Uint8Array([0x61, 0x0, 0x0, 0x0])],
		["\uFEFF", new Uint8Array([0xFF, 0xFE, 0x0, 0x0])],
		["\uFEFF\uFEFF", new Uint8Array([0xFF, 0xFE, 0x0, 0x0, 0xFF, 0xFE, 0x0, 0x0])],
		["\uD834\uDD1E", new Uint8Array([0x1E, 0xD1, 0x01, 0x0])],
		["\0", new Uint8Array([0x0, 0x0, 0x0, 0x0])],
	])(
		"Given %j returns %p",
		(input, output) => {
			expect(Utf16String.toUtf32Bytes(input, true)).toEqual(output)
		}
	)

	test.each([
		"\uD800",
		"\uD800a",
		"\uD800\uD800",
		"\uDC00",
		"\uDC00a"
	])(
		"Given %p throws",
		(input) => {
			expect(() => Utf16String.toUtf32Bytes(input, true)).toThrow(InvalidUtf16StringError)
		}
	)
})

describe("Utf16String.fromUtf8Bytes", () => {
	test.each([
		[new Uint8Array([]), ""],
		[new Uint8Array([0x61]), "a"],
		[new Uint8Array([0x61, 0xC2, 0xA5]), "a¥"],
		[new Uint8Array([0xEF, 0xBB, 0xBF]), "\uFEFF"],
		[new Uint8Array([0xEF, 0xBB, 0xBF, 0xEF, 0xBB, 0xBF]), "\uFEFF\uFEFF"],
		[new Uint8Array([0x61, 0xE6, 0x9D, 0xB1]), "a\u6771"],
		[new Uint8Array([0xF0, 0x9D, 0x84, 0x9E]), "\uD834\uDD1E"],
		[new Uint8Array([0x0]), "\0"],
	])(
		"Given %p returns %j",
		(input, output) => {
			expect(Utf16String.fromUtf8Bytes(input)).toEqual(output)
		}
	)

	// TODO - gives a TypeError instead of a StringDecodingError when running with Jest
	
	test.each([
		new Uint8Array([0xFF])
	])(
		"Given %p throws",
		(input) => {
			expect(() => Utf16String.fromUtf8Bytes(input)).toThrow()
		}
	)
})

describe("Utf16String.fromUtf8Bytes SkipFirstBom", () => {
	test.each([
		[new Uint8Array([]), ""],
		[new Uint8Array([0x61]), "a"],
		[new Uint8Array([0xEF, 0xBB, 0xBF]), ""],
		[new Uint8Array([0xEF, 0xBB, 0xBF, 0xEF, 0xBB, 0xBF]), "\uFEFF"],
		[new Uint8Array([0xEF, 0xBB, 0xBF, 0x61]), "a"],
		[new Uint8Array([0x0]), "\0"],
		[new Uint8Array([0xEF, 0xBB, 0xBF, 0x0]), "\0"],
	])(
		"Given %p returns %j",
		(input, output) => {
			expect(Utf16String.fromUtf8Bytes(input, true)).toEqual(output)
		}
	)
})

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
		[new Uint8Array([0x0, 0x0]), false, "\0"],
		[new Uint8Array([0xFE, 0xFF, 0x0, 0x0]), true, "\0"],
	])(
		"Given %p and %p returns %j",
		(input, skipFirstBom, output) => {
			expect(Utf16String.fromUtf16Bytes(input, false, skipFirstBom)).toEqual(output)
		}
	)

	// TODO - gives a TypeError instead of a StringDecodingError when running with Jest
	
	test.each([
		new Uint8Array([0xFF]),
		new Uint8Array([0xD8, 0x34, 0xDD]),
		new Uint8Array([0xD8, 0x34]),
		new Uint8Array([0xD8, 0x34, 0xD8, 0x34]),
	])(
		"Given %p throws",
		(input) => {
			expect(() => Utf16String.fromUtf16Bytes(input, false)).toThrow()
		}
	)
})

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
		[new Uint8Array([0x0, 0x0]), false, "\0"],
		[new Uint8Array([0xFF, 0xFE, 0x0, 0x0]), true, "\0"],
	])(
		"Given %p and %p returns %j",
		(input, skipFirstBom, output) => {
			expect(Utf16String.fromUtf16Bytes(input, true, skipFirstBom)).toEqual(output)
		}
	)

	// TODO - gives a TypeError instead of a StringDecodingError when running with Jest
	// see https://github.com/facebook/jest/issues/2549 and https://github.com/nodejs/node/issues/31852 and https://backend.cafe/should-you-use-jest-as-a-testing-library
	// test.each([
	// 	new Uint8Array([0xFF])
	// ])(
	// 	"Given %p throws",
	// 	(input) => {
	// 		expect(() => Utf16String.fromUtf8Bytes(input)).toThrow(StringDecodingError)
	// 	}
	// )
	test.each([
		new Uint8Array([0xFF]),
		new Uint8Array([0x34, 0xD8, 0xDD]),
		new Uint8Array([0x34, 0xD8]),
		new Uint8Array([0x34, 0xD8, 0x34, 0xD8]),
	])(
		"Given %p throws",
		(input) => {
			expect(() => Utf16String.fromUtf16Bytes(input, true)).toThrow()
		}
	)
})

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
		[new Uint8Array([0x0, 0x0, 0x0, 0x0]), false, "\0"],
		[new Uint8Array([0x0, 0x0, 0xFE, 0xFF, 0x0, 0x0, 0x0, 0x0]), true, "\0"],
	])(
		"Given %p and %p returns %j",
		(input, skipFirstBom, output) => {
			expect(Utf16String.fromUtf32Bytes(input, false, skipFirstBom)).toEqual(output)
		}
	)

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
	])(
		"Given %p throws",
		(input) => {
			expect(() => Utf16String.fromUtf32Bytes(input, false)).toThrow(StringDecodingError)
		}
	)
})

describe("Utf16String.fromUtf32Bytes LittleEndian", () => {
	test.each([
		[new Uint8Array([]), false, ""],
		[new Uint8Array([0x61, 0x0, 0x0, 0x0]), false, "a"],
		[new Uint8Array([0xFF, 0xFE, 0x0, 0x0]), false, "\uFEFF"],
		[new Uint8Array([0xFF, 0xFE, 0x0, 0x0]), true, ""],
		[new Uint8Array([0xFF, 0xFE, 0x0, 0x0, 0xFF, 0xFE, 0x0, 0x0]), false, "\uFEFF\uFEFF"],
		[new Uint8Array([0xFF, 0xFE, 0x0, 0x0, 0xFF, 0xFE, 0x0, 0x0]), true, "\uFEFF"],
		[new Uint8Array([0x61, 0x0, 0x0, 0x0, 0x71, 0x67, 0x0, 0x0 ]), false, "a\u6771"],
		[new Uint8Array([0x1E, 0xD1, 0x01, 0x0]), false, "\uD834\uDD1E"],
		[new Uint8Array([0x0, 0x0, 0x0, 0x0]), false, "\0"],
		[new Uint8Array([0xFF, 0xFE, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]), true, "\0"],
	])(
		"Given %p and %p returns %j",
		(input, skipFirstBom, output) => {
			expect(Utf16String.fromUtf32Bytes(input, true, skipFirstBom)).toEqual(output)
		}
	)

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
	])(
		"Given %p throws",
		(input) => {
			expect(() => Utf16String.fromUtf32Bytes(input, true)).toThrow(StringDecodingError)
		}
	)
})

describe("Utf16String.fromCodePointArray", () => {
	test.each([
		[[], ""],
		[[0x61], "a"],
		[[0x61, 0x62], "ab"],
		[[0x6771], "\u6771"],
		[[0xFEFF], "\uFEFF"],
		[[0x1D11E], "\uD834\uDD1E"],
		[[0x0], "\0"],
		[[0x0, 0x0], "\0\0"],
	])(
		"Given %p returns %j",
		(input, output) => {
			expect(Utf16String.fromCodePointArray(input)).toEqual(output)
		}
	)

	test.each([
		[[0x110000]],
		[[0xD800]],
	])(
		"Given %p throws",
		(input) => {
			expect(() => Utf16String.fromCodePointArray(input)).toThrow(StringDecodingError)
		}
	)
})

// ----------------------------------------------------------------------

describe("ReliableTxtEncoder.encode", () => {
	test.each([
		["", ReliableTxtEncoding.Utf8, new Uint8Array([0xEF, 0xBB, 0xBF])],
		["a", ReliableTxtEncoding.Utf8, new Uint8Array([0xEF, 0xBB, 0xBF, 0x61])],
		["", ReliableTxtEncoding.Utf16, new Uint8Array([0xFE, 0xFF])],
		["a", ReliableTxtEncoding.Utf16, new Uint8Array([0xFE, 0xFF, 0x0, 0x61])],
		["", ReliableTxtEncoding.Utf16Reverse, new Uint8Array([0xFF, 0xFE])],
		["a", ReliableTxtEncoding.Utf16Reverse, new Uint8Array([0xFF, 0xFE, 0x61, 0x0])],
		["", ReliableTxtEncoding.Utf32, new Uint8Array([0x0, 0x0, 0xFE, 0xFF])],
		["a", ReliableTxtEncoding.Utf32, new Uint8Array([0x0, 0x0, 0xFE, 0xFF, 0x0, 0x0, 0x0, 0x61])],
	])(
		"Given %p and %p returns %p",
		(input, encoding, output) => {
			expect(ReliableTxtEncoder.encode(input, encoding)).toEqual(output)
		}
	)

	test("Invalid encoding", () => {
		expect(() => ReliableTxtEncoder.encode("", 4 as ReliableTxtEncoding)).toThrow(RangeError)
	})
})

// ----------------------------------------------------------------------

describe("ReliableTxtDecoder.getEncodingOrNull", () => {
	test.each([
		[new Uint8Array([0xEF, 0xBB, 0xBF]), ReliableTxtEncoding.Utf8],
		[new Uint8Array([0xEF, 0xBB, 0xBF, 0x61]), ReliableTxtEncoding.Utf8],
		[new Uint8Array([0xFE, 0xFF]), ReliableTxtEncoding.Utf16],
		[new Uint8Array([0xFE, 0xFF, 0x0, 0x61]), ReliableTxtEncoding.Utf16],
		[new Uint8Array([0xFF, 0xFE]), ReliableTxtEncoding.Utf16Reverse],
		[new Uint8Array([0xFF, 0xFE, 0x61, 0x0]), ReliableTxtEncoding.Utf16Reverse],
		[new Uint8Array([0x0, 0x0, 0xFE, 0xFF]), ReliableTxtEncoding.Utf32],
		[new Uint8Array([0x0, 0x0, 0xFE, 0xFF, 0x0, 0x0, 0x0, 0x61]), ReliableTxtEncoding.Utf32],
		[new Uint8Array([]), null],
		[new Uint8Array([0x0]), null],
	])(
		"Given %p returns %p",
		(input, output) => {
			expect(ReliableTxtDecoder.getEncodingOrNull(input)).toEqual(output)
		}
	)
})

describe("ReliableTxtDecoder.getEncoding", () => {
	test.each([
		[new Uint8Array([0xEF, 0xBB, 0xBF]), ReliableTxtEncoding.Utf8],
		[new Uint8Array([0xEF, 0xBB, 0xBF, 0x61]), ReliableTxtEncoding.Utf8],
		[new Uint8Array([0xFE, 0xFF]), ReliableTxtEncoding.Utf16],
		[new Uint8Array([0xFE, 0xFF, 0x0, 0x61]), ReliableTxtEncoding.Utf16],
		[new Uint8Array([0xFF, 0xFE]), ReliableTxtEncoding.Utf16Reverse],
		[new Uint8Array([0xFF, 0xFE, 0x61, 0x0]), ReliableTxtEncoding.Utf16Reverse],
		[new Uint8Array([0x0, 0x0, 0xFE, 0xFF]), ReliableTxtEncoding.Utf32],
		[new Uint8Array([0x0, 0x0, 0xFE, 0xFF, 0x0, 0x0, 0x0, 0x61]), ReliableTxtEncoding.Utf32],
	])(
		"Given %p returns %p",
		(input, output) => {
			expect(ReliableTxtDecoder.getEncoding(input)).toEqual(output)
		}
	)

	test.each([
		[new Uint8Array([])],
		[new Uint8Array([0x0])],
	])(
		"Given %p throws",
		(input) => {
			expect(() => ReliableTxtDecoder.getEncoding(input)).toThrow(NoReliableTxtPreambleError)
		}
	)
})

describe("ReliableTxtDecoder.decode", () => {
	test.each([
		[new Uint8Array([0xEF, 0xBB, 0xBF]), ReliableTxtEncoding.Utf8, ""],
		[new Uint8Array([0xEF, 0xBB, 0xBF, 0x61]), ReliableTxtEncoding.Utf8, "a"],
		[new Uint8Array([0xFE, 0xFF]), ReliableTxtEncoding.Utf16, ""],
		[new Uint8Array([0xFE, 0xFF, 0x0, 0x61]), ReliableTxtEncoding.Utf16, "a"],
		[new Uint8Array([0xFF, 0xFE]), ReliableTxtEncoding.Utf16Reverse, ""],
		[new Uint8Array([0xFF, 0xFE, 0x61, 0x0]), ReliableTxtEncoding.Utf16Reverse, "a"],
		[new Uint8Array([0x0, 0x0, 0xFE, 0xFF]), ReliableTxtEncoding.Utf32, ""],
		[new Uint8Array([0x0, 0x0, 0xFE, 0xFF, 0x0, 0x0, 0x0, 0x61]), ReliableTxtEncoding.Utf32, "a"],
	])(
		"Given %p returns %p and %p",
		(input, encoding, text) => {
			const document = ReliableTxtDecoder.decode(input)
			expect(document.encoding).toEqual(encoding)
			expect(document.text).toEqual(text)
		}
	)

	test.each([
		[new Uint8Array([])],
		[new Uint8Array([0x0])],
	])(
		"Given %p throws",
		(input) => {
			expect(() => ReliableTxtDecoder.decode(input)).toThrow(NoReliableTxtPreambleError)
		}
	)
})

describe("ReliableTxtDecoder.decodePart", () => {
	test.each([
		[new Uint8Array([]), ReliableTxtEncoding.Utf8, ""],
		[new Uint8Array([0xEF, 0xBB, 0xBF]), ReliableTxtEncoding.Utf8, "\uFEFF"],
		[new Uint8Array([0xEF, 0xBB, 0xBF, 0x61]), ReliableTxtEncoding.Utf8, "\uFEFFa"],
		[new Uint8Array([0x61]), ReliableTxtEncoding.Utf8, "a"],
		[new Uint8Array([]), ReliableTxtEncoding.Utf16, ""],
		[new Uint8Array([0xFE, 0xFF]), ReliableTxtEncoding.Utf16, "\uFEFF"],
		[new Uint8Array([0xFE, 0xFF, 0x0, 0x61]), ReliableTxtEncoding.Utf16, "\uFEFFa"],
		[new Uint8Array([0x0, 0x61]), ReliableTxtEncoding.Utf16, "a"],
		[new Uint8Array([]), ReliableTxtEncoding.Utf16Reverse, ""],
		[new Uint8Array([0xFF, 0xFE]), ReliableTxtEncoding.Utf16Reverse, "\uFEFF"],
		[new Uint8Array([0xFF, 0xFE, 0x61, 0x0]), ReliableTxtEncoding.Utf16Reverse, "\uFEFFa"],
		[new Uint8Array([0x61, 0x0]), ReliableTxtEncoding.Utf16Reverse, "a"],
		[new Uint8Array([]), ReliableTxtEncoding.Utf32, ""],
		[new Uint8Array([0x0, 0x0, 0xFE, 0xFF]), ReliableTxtEncoding.Utf32, "\uFEFF"],
		[new Uint8Array([0x0, 0x0, 0xFE, 0xFF, 0x0, 0x0, 0x0, 0x61]), ReliableTxtEncoding.Utf32, "\uFEFFa"],
		[new Uint8Array([0x0, 0x0, 0x0, 0x61]), ReliableTxtEncoding.Utf32, "a"],
	])(
		"Given %p and %p returns %p",
		(input, encoding, output) => {
			expect(ReliableTxtDecoder.decodePart(input, encoding)).toEqual(output)
		}
	)

	expect(() => ReliableTxtDecoder.decodePart(new Uint8Array([]), 4 as ReliableTxtEncoding)).toThrow(RangeError)
})

// ----------------------------------------------------------------------

describe("ReliableTxtDocument Constructor", () => {
	test("Empty", () => {
		const document = new ReliableTxtDocument()
		expect(document.text).toEqual("")
		expect(document.encoding).toEqual(ReliableTxtEncoding.Utf8)
	})

	test("Text", () => {
		const document = new ReliableTxtDocument("abc")
		expect(document.text).toEqual("abc")
		expect(document.encoding).toEqual(ReliableTxtEncoding.Utf8)
	})

	test("TextAndEncoding", () => {
		const document = new ReliableTxtDocument("abc", ReliableTxtEncoding.Utf16)
		expect(document.text).toEqual("abc")
		expect(document.encoding).toEqual(ReliableTxtEncoding.Utf16)
	})
})

describe("ReliableTxtDocument.getBytes + fromBytes", () => {
	test.each([
		["", ReliableTxtEncoding.Utf8, new Uint8Array([0xEF, 0xBB, 0xBF])],
		["", ReliableTxtEncoding.Utf16, new Uint8Array([0xFE, 0xFF])],
		["", ReliableTxtEncoding.Utf16Reverse, new Uint8Array([0xFF, 0xFE])],
		["", ReliableTxtEncoding.Utf32, new Uint8Array([0x0, 0x0, 0xFE, 0xFF])],
		["a", ReliableTxtEncoding.Utf8, new Uint8Array([0xEF, 0xBB, 0xBF, 0x61])],
		["a", ReliableTxtEncoding.Utf16, new Uint8Array([0xFE, 0xFF, 0x0, 0x61])],
		["a", ReliableTxtEncoding.Utf16Reverse, new Uint8Array([0xFF, 0xFE, 0x61, 0x0])],
		["a", ReliableTxtEncoding.Utf32, new Uint8Array([0x0, 0x0, 0xFE, 0xFF, 0x0, 0x0, 0x0, 0x61])],
	])(
		"Given %p and %p returns %p",
		(input, encoding, output) => {
			expect(new ReliableTxtDocument(input, encoding).getBytes()).toEqual(output)

			const document = ReliableTxtDocument.fromBytes(output)
			expect(document.encoding).toBe(encoding)
			expect(document.text).toBe(input)
		}
	)
})

describe("ReliableTxtDocument.setLines + getLines + fromLines", () => {
	test.each([
		[[""], ""],
		[["Line1"], "Line1"],
		[["Line1", "Line2"], "Line1\nLine2"],
		[["Line1", "Line2", "Line3"], "Line1\nLine2\nLine3"],
		[["", "Line2", "Line3"], "\nLine2\nLine3"],
		[["Line1", "", "Line3"], "Line1\n\nLine3"],
		[["Line1", "Line2", ""], "Line1\nLine2\n"],
	])(
		"Given %p returns %p",
		(input, output) => {
			const document = new ReliableTxtDocument()
			document.setLines(input)
			expect(document.text).toEqual(output)
			expect(document.getLines()).toEqual(input)

			const fromDocument = ReliableTxtDocument.fromLines(input)
			expect(fromDocument.text).toEqual(output)
			expect(fromDocument.getLines()).toEqual(input)
		}
	)

	test("Empty", () => {
		const document = new ReliableTxtDocument()
		document.setLines([])
		expect(document.text).toEqual("")
		expect(document.getLines()).toEqual([""])
	})
})

describe("ReliableTxtDocument.fromLines Encoding", () => {
	test.each([
		[ReliableTxtEncoding.Utf8],
		[ReliableTxtEncoding.Utf16],
		[ReliableTxtEncoding.Utf16Reverse],
		[ReliableTxtEncoding.Utf32],
	])(
		"Given %p returns %p",
		(encoding) => {
			const fromDocument = ReliableTxtDocument.fromLines([], encoding)
			expect(fromDocument.encoding).toEqual(encoding)
		}
	)
})

describe("ReliableTxtDocument.setCodePoints + getCodePoints + fromCodePoints", () => {
	test.each([
		[[], ""],
		[[0x61], "a"],
		[[0x61, 0x62], "ab"],
		[[0x6771], "\u6771"],
		[[0x1D11E], "\uD834\uDD1E"],
	])(
		"Given %p returns %p",
		(input, output) => {
			const document = new ReliableTxtDocument()
			document.setCodePoints(input)
			expect(document.text).toEqual(output)
			expect(document.getCodePoints()).toEqual(input)

			const fromDocument = ReliableTxtDocument.fromCodePoints(input)
			expect(fromDocument.text).toEqual(output)
			expect(fromDocument.getCodePoints()).toEqual(input)
		}
	)
})

describe("ReliableTxtDocument.fromCodePoints Encoding", () => {
	test.each([
		[ReliableTxtEncoding.Utf8],
		[ReliableTxtEncoding.Utf16],
		[ReliableTxtEncoding.Utf16Reverse],
		[ReliableTxtEncoding.Utf32],
	])(
		"Given %p returns %p",
		(encoding) => {
			const fromDocument = ReliableTxtDocument.fromCodePoints([], encoding)
			expect(fromDocument.encoding).toEqual(encoding)
		}
	)
})

describe("ReliableTxtDocument.toBase64String + fromBase64String", () => {
	test.each([
		[""],
		["a"],
		["a~¥»½¿ßäïœ€東𝄞𠀇"],
	])(
		"Given %p",
		(input) => {
			for (let i=0; i<3; i++) {
				const encoding: ReliableTxtEncoding = i
				const document = new ReliableTxtDocument(input, encoding)
				expect(document.encoding).toEqual(encoding)
				const base64Str = document.toBase64String()
				expect(base64Str.startsWith("Base64|")).toEqual(true)
				expect(base64Str.endsWith("|")).toEqual(true)
				const fromDocument = ReliableTxtDocument.fromBase64String(base64Str)
				expect(fromDocument.text).toEqual(input)
				expect(fromDocument.encoding).toEqual(encoding)
			}
		}
	)
})

describe("ReliableTxtDocument.toBase64String", () => {
	test.each([
		["", ReliableTxtEncoding.Utf8, "Base64|77u/|"],
		["Many hands make light work.", ReliableTxtEncoding.Utf8, "Base64|77u/TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu|"],
		["\u0000", ReliableTxtEncoding.Utf8, "Base64|77u/AA|"],
		["Man", ReliableTxtEncoding.Utf8, "Base64|77u/TWFu|"],
		["a¥ßä€東𝄞", ReliableTxtEncoding.Utf8, "Base64|77u/YcKlw5/DpOKCrOadsfCdhJ4|"],
		["Man", ReliableTxtEncoding.Utf16, "Base64|/v8ATQBhAG4|"],
		["Man", ReliableTxtEncoding.Utf16Reverse, "Base64|//5NAGEAbgA|"],
		["Man", ReliableTxtEncoding.Utf32, "Base64|AAD+/wAAAE0AAABhAAAAbg|"],
	])(
		"Given %j and %p returns %p",
		(input1, input2, output) => {
			const document = new ReliableTxtDocument(input1, input2)
			expect(document.toBase64String()).toEqual(output)
		}
	)
})

describe("ReliableTxtDocument.fromBase64String", () => {
	test.each([
		["Base64|77u/|", "", ReliableTxtEncoding.Utf8],
		["Base64|77u/AA|", "\u0000", ReliableTxtEncoding.Utf8],
		["Base64|77u/TWFu|", "Man", ReliableTxtEncoding.Utf8],
		["Base64|77u/8J2Eng|", "𝄞", ReliableTxtEncoding.Utf8],
		["Base64|/v8ATQBhAG4|", "Man", ReliableTxtEncoding.Utf16],
		["Base64|//5NAGEAbgA|", "Man", ReliableTxtEncoding.Utf16Reverse],
		["Base64|AAD+/wAAAE0AAABhAAAAbg|", "Man", ReliableTxtEncoding.Utf32],
	])(
		"Given %p returns %j and %p",
		(input, output1, output2) => {
			const fromDocument = ReliableTxtDocument.fromBase64String(input)
			expect(fromDocument.text).toEqual(output1)
			expect(fromDocument.encoding).toEqual(output2)
		}
	)

	test.each([
		["Base64||"],
		["Base64|TWFu|"],
		["BASE64|77u/TWFu|"],
		["77u/TWFu"],
	])(
		"Given %p throws",
		(input) => {
			expect(() => ReliableTxtDocument.fromBase64String(input)).toThrow()
		}
	)
})

// ----------------------------------------------------------------------

test("InvalidBase64StringError", () => {
	expect(new InvalidBase64StringError().message).toEqual("Invalid Base64 string")
})

// ----------------------------------------------------------------------

describe("Base64String.rawFromBytes + rawToBytes", () => {
	test.each([
		[[], ""],
		[[0x4d], "TQ"],
		[[0x4d, 0x61], "TWE"],
		[[0x4d, 0x61, 0x6e], "TWFu"],
		[[0x4d, 0x61, 0x6e, 0x4d], "TWFuTQ"],
		[[0x0], "AA"],
		[[0x0, 0x0], "AAA"],
		[[0x0, 0x0, 0x0], "AAAA"],
		[[0x0, 0x0, 0x1], "AAAB"],
		[[0x20, 0x21, 0x22], "ICEi"],
		[[0xA5, 0xDF], "pd8"],
		[[0xFF], "/w"],
		[[0xFF, 0xFF], "//8"],
		[[0xFF, 0xFF, 0xFF], "////"],
		[[0xFF, 0xFF, 0xFE], "///+"],
		[[0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF], "////////"],
	])(
		"Given %p returns %p",
		(input, output) => {
			const bytes = new Uint8Array(input)
			const base64Str = Base64String.rawFromBytes(bytes)
			expect(base64Str).toEqual(output)
			expect(Base64String.rawToBytes(base64Str)).toEqual(bytes)
		}
	)
})

describe("Base64String.rawToBytes", () => {
	test.each([
		["a"],
		["&aaa"],
		["ßaaa"],
		["&aa="],
		["ßaa="],
		["&a=="],
		["ßa=="],
	])(
		"Given %p throws",
		(input) => {
			expect(() => Base64String.rawToBytes(input)).toThrow()
		}
	)
})

test("Base64String.rawFromBytes + rawToBytes 256", () => {
	const byteValues = [...Array(256).keys()]
	expect(byteValues.length).toEqual(256)
	const bytes = new Uint8Array(byteValues)
	const base64Str = Base64String.rawFromBytes(bytes)
	expect(base64Str).toEqual("AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w")
	expect(Base64String.rawToBytes(base64Str)).toEqual(bytes)
})

describe("Base64String.rawFromText + rawToText", () => {
	test.each([
		["", ReliableTxtEncoding.Utf8, "77u/"],
		["M", ReliableTxtEncoding.Utf8, "77u/TQ"],
		["Ma", ReliableTxtEncoding.Utf8, "77u/TWE"],
		["Man", ReliableTxtEncoding.Utf8, "77u/TWFu"],
		["Many", ReliableTxtEncoding.Utf8, "77u/TWFueQ"],
		["\uFEFF", ReliableTxtEncoding.Utf8, "77u/77u/"],
		["\u0000", ReliableTxtEncoding.Utf8, "77u/AA"],
		["Many hands make light work.", ReliableTxtEncoding.Utf8, "77u/TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu"],
		["", ReliableTxtEncoding.Utf16, "/v8"],
		["M", ReliableTxtEncoding.Utf16, "/v8ATQ"],
		["Ma", ReliableTxtEncoding.Utf16, "/v8ATQBh"],
		["Man", ReliableTxtEncoding.Utf16, "/v8ATQBhAG4"],
		["\uFEFF", ReliableTxtEncoding.Utf16, "/v/+/w"],
		["\u0000", ReliableTxtEncoding.Utf16, "/v8AAA"],
		["", ReliableTxtEncoding.Utf16Reverse, "//4"],
		["M", ReliableTxtEncoding.Utf16Reverse, "//5NAA"],
		["Ma", ReliableTxtEncoding.Utf16Reverse, "//5NAGEA"],
		["Man", ReliableTxtEncoding.Utf16Reverse, "//5NAGEAbgA"],
		["\uFEFF", ReliableTxtEncoding.Utf16Reverse, "//7//g"],
		["\u0000", ReliableTxtEncoding.Utf16Reverse, "//4AAA"],
		["", ReliableTxtEncoding.Utf32, "AAD+/w"],
		["M", ReliableTxtEncoding.Utf32, "AAD+/wAAAE0"],
		["Ma", ReliableTxtEncoding.Utf32, "AAD+/wAAAE0AAABh"],
		["Man", ReliableTxtEncoding.Utf32, "AAD+/wAAAE0AAABhAAAAbg"],
		["\uFEFF", ReliableTxtEncoding.Utf32, "AAD+/wAA/v8"],
		["\u0000", ReliableTxtEncoding.Utf32, "AAD+/wAAAAA"],
	])(
		"Given %j returns %p",
		(input1, input2, output) => {
			const base64Str = Base64String.rawFromText(input1, input2)
			expect(base64Str).toEqual(output)
			expect(Base64String.rawToText(base64Str)).toEqual(input1)
		}
	)
	
	test("Without encoding", () => {
		const base64Str = Base64String.rawFromText("Man")
		expect(base64Str).toEqual("77u/TWFu")
		expect(Base64String.rawToText(base64Str)).toEqual("Man")
	})
})

describe("Base64String.fromBytes + toBytes", () => {
	test.each([
		[[], "Base64||"],
		[[0x4d], "Base64|TQ|"],
		[[0x4d, 0x61], "Base64|TWE|"],
		[[0x4d, 0x61, 0x6e], "Base64|TWFu|"],
		[[0x4d, 0x61, 0x6e, 0x4d], "Base64|TWFuTQ|"],
		[[0x0], "Base64|AA|"],
		[[0x0, 0x0], "Base64|AAA|"],
		[[0x0, 0x0, 0x0], "Base64|AAAA|"],
		[[0x0, 0x0, 0x1], "Base64|AAAB|"],
		[[0x20, 0x21, 0x22], "Base64|ICEi|"],
		[[0xA5, 0xDF], "Base64|pd8|"],
		[[0xFF], "Base64|/w|"],
		[[0xFF, 0xFF], "Base64|//8|"],
		[[0xFF, 0xFF, 0xFF], "Base64|////|"],
		[[0xFF, 0xFF, 0xFE], "Base64|///+|"],
		[[0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF], "Base64|////////|"],
	])(
		"Given %p returns %p",
		(input, output) => {
			const bytes = new Uint8Array(input)
			const base64Str = Base64String.fromBytes(bytes)
			expect(base64Str).toEqual(output)
			expect(Base64String.toBytes(base64Str)).toEqual(bytes)
		}
	)
})

describe("Base64String.toBytes", () => {
	test.each([
		["AAAA"],
		["BASE64|AAAA|"],
		["Base64|AAAA"],
		["Base64|"],
	])(
		"Given %p throws",
		(input) => {
			expect(() => Base64String.toBytes(input)).toThrow()
		}
	)
})

describe("Base64String.fromText + toText", () => {
	test.each([
		["Man", ReliableTxtEncoding.Utf8, "Base64|77u/TWFu|"],
		["Man", ReliableTxtEncoding.Utf16, "Base64|/v8ATQBhAG4|"],
		["Man", ReliableTxtEncoding.Utf16Reverse, "Base64|//5NAGEAbgA|"],
		["Man", ReliableTxtEncoding.Utf32, "Base64|AAD+/wAAAE0AAABhAAAAbg|"],
		["", ReliableTxtEncoding.Utf8, "Base64|77u/|"],
		["a", ReliableTxtEncoding.Utf8, "Base64|77u/YQ|"],
		["\u0000", ReliableTxtEncoding.Utf8, "Base64|77u/AA|"],
		["𝄞", ReliableTxtEncoding.Utf8, "Base64|77u/8J2Eng|"],
	])(
		"Given %j and %p returns %p",
		(input1, input2, output) => {
			const base64Str = Base64String.fromText(input1, input2)
			expect(base64Str).toEqual(output)
			expect(Base64String.toText(base64Str)).toEqual(input1)
		}
	)
	
	test("Without encoding", () => {
		const base64Str = Base64String.fromText("Man")
		expect(base64Str).toEqual("Base64|77u/TWFu|")
		expect(Base64String.toText(base64Str)).toEqual("Man")
	})
})