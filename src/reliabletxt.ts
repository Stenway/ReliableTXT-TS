/* (C) Stefan John / Stenway / ReliableTXT.com / 2023 */

export enum ReliableTxtEncoding {
	Utf8,
	Utf16,
	Utf16Reverse,
	Utf32
}

// ----------------------------------------------------------------------

export abstract class ReliableTxtEncodingUtil {
	static getPreambleSize(encoding: ReliableTxtEncoding): number {
		if (encoding === ReliableTxtEncoding.Utf8) { return 3 }
		else if (encoding === ReliableTxtEncoding.Utf16) { return 2 }
		else if (encoding === ReliableTxtEncoding.Utf16Reverse) { return 2 }
		else if (encoding === ReliableTxtEncoding.Utf32) { return 4 }
		else { throw new RangeError() }
	}

	static getPreambleBytes(encoding: ReliableTxtEncoding): Uint8Array {
		if (encoding === ReliableTxtEncoding.Utf8) { return new Uint8Array([0xEF, 0xBB, 0xBF]) }
		else if (encoding === ReliableTxtEncoding.Utf16) { return new Uint8Array([0xFE, 0xFF]) }
		else if (encoding === ReliableTxtEncoding.Utf16Reverse) { return new Uint8Array([0xFF, 0xFE]) }
		else if (encoding === ReliableTxtEncoding.Utf32) { return new Uint8Array([0x0, 0x0, 0xFE, 0xFF]) }
		else { throw new RangeError() }
	}
}

// ----------------------------------------------------------------------

export abstract class ReliableTxtLines {
	static join(lines: string[]): string {
		return lines.join("\n")
	}
	
	static split(text: string): string[] {
		return text.split("\n")
	}

	static getLineInfo(text: string, codeUnitIndex: number): [charIndex: number, lineIndex: number, lineCharIndex: number] {
		if (codeUnitIndex > text.length || codeUnitIndex < 0) { throw new RangeError("CodeUnit index out of range") }
		if (codeUnitIndex === 0) { return [0, 0, 0] }
		let charIndex: number = -1
		let lineIndex: number = 0
		let lineCharIndex: number = -1
		let length = codeUnitIndex
		if (codeUnitIndex === text.length) { length -= 1 }
		let wasLineBreak = false
		for (let i=0; i<=length; i++) {
			if (wasLineBreak) {
				wasLineBreak = false
				charIndex = -1
				lineCharIndex = -1
				lineIndex++
			}
			const firstCodeUnit: number = text.charCodeAt(i)
			if (firstCodeUnit === 0x0A) {
				wasLineBreak = true
			} else if (firstCodeUnit >= 0xD800 && firstCodeUnit <= 0xDFFF) {
				if (firstCodeUnit >= 0xDC00) { throw new InvalidUtf16StringError() }
				i++
				if (i >= text.length) { throw new InvalidUtf16StringError() }
				const secondCodeUnit: number = text.charCodeAt(i)
				if (!(secondCodeUnit >= 0xDC00 && secondCodeUnit <= 0xDFFF)) { throw new InvalidUtf16StringError() }
				if (codeUnitIndex === text.length-1 && i === text.length-1) {
					charIndex++
					lineCharIndex++
				}
			}
			charIndex++
			lineCharIndex++
		}
		if (codeUnitIndex === text.length) {
			if (!wasLineBreak) {
				charIndex++
				lineCharIndex++
			} else {
				charIndex = 0
				lineCharIndex = 0
				lineIndex++
			}
		}
		return [charIndex, lineIndex, lineCharIndex]
	}
}

// ----------------------------------------------------------------------

export class InvalidUtf16StringError extends Error {
	constructor() {
		super("Invalid UTF16 string")
	}
}

// ----------------------------------------------------------------------

export class StringDecodingError extends Error {
	constructor() {
		super("Could not decode string")
	}
}

// ----------------------------------------------------------------------

export class NoReliableTxtPreambleError extends Error {
	constructor() {
		super("Document does not have a ReliableTXT preamble")
	}
}

// ----------------------------------------------------------------------

export abstract class Utf16String {
	static isValid(str: string): boolean {
		for (let i=0; i<str.length; i++) {
			const firstCodeUnit: number = str.charCodeAt(i)
			if (firstCodeUnit >= 0xD800 && firstCodeUnit <= 0xDFFF) {
				if (firstCodeUnit >= 0xDC00) { return false }
				i++
				if (i >= str.length) { return false }
				const secondCodeUnit: number = str.charCodeAt(i)
				if (!(secondCodeUnit >= 0xDC00 && secondCodeUnit <= 0xDFFF)) { return false }
			}
		}
		return true
	}

	static validate(str: string) {
		if (!Utf16String.isValid(str)) { throw new InvalidUtf16StringError() }
	}

	static getCodePointCount(str: string): number {
		let count: number = 0
		for (let i=0; i<str.length; i++) {
			const firstCodeUnit: number = str.charCodeAt(i)
			if (firstCodeUnit >= 0xD800 && firstCodeUnit <= 0xDFFF) {
				if (firstCodeUnit >= 0xDC00) { throw new InvalidUtf16StringError() }
				i++
				if (i >= str.length) { throw new InvalidUtf16StringError() }
				const secondCodeUnit: number = str.charCodeAt(i)
				if (!(secondCodeUnit >= 0xDC00 && secondCodeUnit <= 0xDFFF)) { throw new InvalidUtf16StringError() }
			}
			count++
		}
		return count
	}

	static getCodePointArray(str: string): number[] {
		const numCodePoints: number = Utf16String.getCodePointCount(str)
		const codePoints: number[] = new Array<number>(numCodePoints)
		let codePointIndex: number = 0
		for (let i=0; i<str.length; i++) {
			let codePoint: number = str.charCodeAt(i)
			if (codePoint >= 0xD800 && codePoint <= 0xDBFF) {
				i++
				const secondCodeUnit: number = str.charCodeAt(i)
				codePoint = (codePoint - 0xD800) * 0x400 + secondCodeUnit - 0xDC00 + 0x10000
			}
			codePoints[codePointIndex] = codePoint
			codePointIndex++
		}
		return codePoints
	}

	static getCodePoints(str: string): Uint32Array {
		const numCodePoints: number = Utf16String.getCodePointCount(str)
		const codePoints: Uint32Array = new Uint32Array(numCodePoints)
		let codePointIndex: number = 0
		for (let i=0; i<str.length; i++) {
			let codePoint: number = str.charCodeAt(i)
			if (codePoint >= 0xD800 && codePoint <= 0xDBFF) {
				i++
				const secondCodeUnit: number = str.charCodeAt(i)
				codePoint = (codePoint - 0xD800) * 0x400 + secondCodeUnit - 0xDC00 + 0x10000
			}
			codePoints[codePointIndex] = codePoint
			codePointIndex++
		}
		return codePoints
	}

	static getUtf8ByteCount(str: string): number {
		let byteCount = 0
		for (let i=0; i<str.length; i++) {
			const firstCodeUnit: number = str.charCodeAt(i)
			if (firstCodeUnit <= 0x007F) {
				byteCount++
			} else if (firstCodeUnit <= 0x07FF) {
				byteCount += 2
			} else {
				if (firstCodeUnit >= 0xD800 && firstCodeUnit <= 0xDFFF) {
					if (firstCodeUnit >= 0xDC00) { return -1 }
					i++
					if (i >= str.length) { return -1 }
					const secondCodeUnit: number = str.charCodeAt(i)
					if (!(secondCodeUnit >= 0xDC00 && secondCodeUnit <= 0xDFFF)) { return -1 }
					byteCount += 4
				} else {
					byteCount += 3
				}
			}
			
		}
		return byteCount
	}

	static toUtf8Bytes(text: string): Uint8Array {
		Utf16String.validate(text)
		const utf8Encoder = new TextEncoder()
		return utf8Encoder.encode(text)
	}

	static toUtf16Bytes(text: string, littleEndian: boolean = false): Uint8Array {
		const byteArray: Uint8Array = new Uint8Array(text.length*2)
		const dataView: DataView = new DataView(byteArray.buffer)
		let wasHighSurrogate: boolean = false
		for (let i=0; i < text.length; i++) {
			const codeUnit: number = text.charCodeAt(i)
			if (wasHighSurrogate) {
				if (!(codeUnit >= 0xDC00 && codeUnit <= 0xDFFF)) { throw new InvalidUtf16StringError() }
				wasHighSurrogate = false
			} else if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
				if (codeUnit >= 0xDC00) { throw new InvalidUtf16StringError() }
				wasHighSurrogate = true
			}
			dataView.setUint16(i*2, codeUnit, littleEndian)
		}
		if (wasHighSurrogate) { throw new InvalidUtf16StringError() }
		return byteArray
	}

	static toUtf32Bytes(str: string, littleEndian: boolean = false): Uint8Array {
		const numCodePoints: number = Utf16String.getCodePointCount(str)
		const byteArray: Uint8Array = new Uint8Array(numCodePoints*4)
		const dataView: DataView = new DataView(byteArray.buffer)
		let codePointIndex: number = 0
		for (let i=0; i < str.length; i++) {
			let codePoint: number = str.charCodeAt(i)
			if (codePoint >= 0xD800 && codePoint <= 0xDBFF) {
				i++
				const secondCodeUnit: number = str.charCodeAt(i)
				codePoint = (codePoint - 0xD800) * 0x400 + secondCodeUnit - 0xDC00 + 0x10000
			}
			dataView.setUint32(codePointIndex*4, codePoint, littleEndian)
			codePointIndex++
		}
		return byteArray
	}

	static fromUtf8Bytes(bytes: Uint8Array, skipFirstBom: boolean = false): string {
		const utf8Decoder: TextDecoder = new TextDecoder("utf-8", {fatal: true, ignoreBOM: !skipFirstBom})
		try {
			return utf8Decoder.decode(bytes)
		} catch (error) {
			if (error instanceof TypeError) { throw new StringDecodingError() }
			else { throw error }
		}
	}

	static fromUtf16Bytes(bytes: Uint8Array, littleEndian: boolean, skipFirstBom: boolean = false): string {
		const utf16Decoder: TextDecoder = new TextDecoder("utf-16" + (littleEndian ? "le" : "be"), {fatal: true, ignoreBOM: !skipFirstBom})
		try {
			return utf16Decoder.decode(bytes)
		} catch (error) {
			if (error instanceof TypeError) { throw new StringDecodingError() }
			else { throw error }
		}
	}

	static fromUtf32Bytes(bytes: Uint8Array, littleEndian: boolean, skipFirstBom: boolean = false): string {
		if (bytes.length % 4 !== 0) { throw new StringDecodingError() }
		const numCodePoints: number = bytes.length/4
		let numCodeUnits: number = 0
		const bytesDataView: DataView = new DataView(bytes.buffer)
		let startIndex: number = 0
		if (skipFirstBom && bytesDataView.byteLength >= 4 && bytesDataView.getUint32(0, littleEndian) == 0xFEFF) {
			startIndex = 1
		}
		for (let i=startIndex; i<numCodePoints; i++) {
			const codePoint: number = bytesDataView.getUint32(4*i, littleEndian)
			if (codePoint > 0x010000) { numCodeUnits++ }
			if (codePoint > 0x10FFFF || (codePoint >= 0xD800 && codePoint <= 0xDFFF)) { throw new StringDecodingError() }
			numCodeUnits++
		}
		const utf16Bytes: Uint8Array = new Uint8Array(numCodeUnits*2)
		const dataView: DataView = new DataView(utf16Bytes.buffer)
		let codeUnitIndex: number = 0
		for (let i=startIndex; i<numCodePoints; i++) {
			let codePoint: number = bytesDataView.getUint32(4*i, littleEndian)
			if (codePoint > 0x010000) {
				codePoint -= 0x010000
				const highSurrogate: number = (codePoint >> 10) + 0xD800
				dataView.setUint16(codeUnitIndex*2, highSurrogate, false)
				codeUnitIndex++
				const lowSurrogate: number = (codePoint % 0x400) + 0xDC00
				dataView.setUint16(codeUnitIndex*2, lowSurrogate, false)
			} else {
				dataView.setUint16(codeUnitIndex*2, codePoint, false)
			}
			codeUnitIndex++
		}
		return Utf16String.fromUtf16Bytes(utf16Bytes, false)
	}

	static fromCodePointArray(codePoints: number[]): string {
		let numCodeUnits: number = 0
		for (let i=0; i<codePoints.length; i++) {
			const codePoint: number = codePoints[i]
			if (codePoint > 0x010000) { numCodeUnits++ }
			if (codePoint > 0x10FFFF || (codePoint >= 0xD800 && codePoint <= 0xDFFF)) { throw new StringDecodingError() }
			numCodeUnits++
		}
		const utf16Bytes: Uint8Array = new Uint8Array(numCodeUnits*2)
		const dataView: DataView = new DataView(utf16Bytes.buffer)
		let codeUnitIndex: number = 0
		for (let i=0; i<codePoints.length; i++) {
			let codePoint: number = codePoints[i]
			if (codePoint > 0x010000) {
				codePoint -= 0x010000
				const highSurrogate: number = (codePoint >> 10) + 0xD800
				dataView.setUint16(codeUnitIndex*2, highSurrogate, false)
				codeUnitIndex++
				const lowSurrogate: number = (codePoint % 0x400) + 0xDC00
				dataView.setUint16(codeUnitIndex*2, lowSurrogate, false)
			} else {
				dataView.setUint16(codeUnitIndex*2, codePoint, false)
			}
			codeUnitIndex++
		}
		return Utf16String.fromUtf16Bytes(utf16Bytes, false)
	}
}

// ----------------------------------------------------------------------

export abstract class ReliableTxtEncoder {
	static encode(text: string, encoding: ReliableTxtEncoding): Uint8Array {
		const textWithPreamble: string = "\uFEFF" + text
		return ReliableTxtEncoder.encodePart(textWithPreamble, encoding)
	}

	static encodePart(text: string, encoding: ReliableTxtEncoding): Uint8Array {
		if (encoding === ReliableTxtEncoding.Utf8) { return Utf16String.toUtf8Bytes(text) }
		else if (encoding === ReliableTxtEncoding.Utf16) { return Utf16String.toUtf16Bytes(text, false) }
		else if (encoding === ReliableTxtEncoding.Utf16Reverse) { return Utf16String.toUtf16Bytes(text, true) }
		else if (encoding === ReliableTxtEncoding.Utf32) { return Utf16String.toUtf32Bytes(text, false) }
		else { throw new RangeError() }
	}
}

// ----------------------------------------------------------------------

export abstract class ReliableTxtDecoder {
	static getEncodingOrNull(bytes: Uint8Array): ReliableTxtEncoding | null {
		if (bytes.length >= 3
				&& bytes[0] == 0xEF 
				&& bytes[1] == 0xBB
				&& bytes[2] == 0xBF) {
			return ReliableTxtEncoding.Utf8
		} else if (bytes.length >= 2
				&& bytes[0] == 0xFE 
				&& bytes[1] == 0xFF) {
			return ReliableTxtEncoding.Utf16
		} else if (bytes.length >= 2
				&& bytes[0] == 0xFF 
				&& bytes[1] == 0xFE) {
			return ReliableTxtEncoding.Utf16Reverse
		} else if (bytes.length >= 4
				&& bytes[0] == 0 
				&& bytes[1] == 0
				&& bytes[2] == 0xFE 
				&& bytes[3] == 0xFF) {
			return ReliableTxtEncoding.Utf32
		} else {
			return null
		}
	}

	static getEncoding(bytes: Uint8Array): ReliableTxtEncoding {
		const encoding: ReliableTxtEncoding | null = ReliableTxtDecoder.getEncodingOrNull(bytes)
		if (encoding === null) {
			throw new NoReliableTxtPreambleError()
		}
		return encoding
	}
	
	static decode(bytes: Uint8Array): ReliableTxtDocument {
		const encoding: ReliableTxtEncoding = ReliableTxtDecoder.getEncoding(bytes)
		let text: string
		if (encoding === ReliableTxtEncoding.Utf8) { text = Utf16String.fromUtf8Bytes(bytes, true) }
		else if (encoding === ReliableTxtEncoding.Utf16) { text = Utf16String.fromUtf16Bytes(bytes, false, true) }
		else if (encoding === ReliableTxtEncoding.Utf16Reverse) { text = Utf16String.fromUtf16Bytes(bytes, true, true) }
		else if (encoding === ReliableTxtEncoding.Utf32) { text = Utf16String.fromUtf32Bytes(bytes, false, true) }
		else { throw new RangeError() }
		return new ReliableTxtDocument(text, encoding)
	}

	static decodePart(bytes: Uint8Array, encoding: ReliableTxtEncoding): string {
		if (encoding === ReliableTxtEncoding.Utf8) { return Utf16String.fromUtf8Bytes(bytes, false) }
		else if (encoding === ReliableTxtEncoding.Utf16) { return Utf16String.fromUtf16Bytes(bytes, false) }
		else if (encoding === ReliableTxtEncoding.Utf16Reverse) { return Utf16String.fromUtf16Bytes(bytes, true) }
		else if (encoding === ReliableTxtEncoding.Utf32) { return Utf16String.fromUtf32Bytes(bytes, false) }
		else { throw new RangeError() }
	}
	
}

// ----------------------------------------------------------------------

export class InvalidBase64StringError extends Error {
	constructor() {
		super("Invalid Base64 string")
	}
}

// ----------------------------------------------------------------------

export abstract class Base64String {
	private static encoderLookup: number[] = [
		0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4A,
		0x4B, 0x4C, 0x4D, 0x4E, 0x4F, 0x50, 0x51, 0x52, 0x53, 0x54,
		0x55, 0x56, 0x57, 0x58, 0x59, 0x5A,
		0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A,
		0x6B, 0x6C, 0x6D, 0x6E, 0x6F, 0x70, 0x71, 0x72, 0x73, 0x74,
		0x75, 0x76, 0x77, 0x78, 0x79, 0x7A,
		0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39,
		0x2B, 0x2F
	]
	private static decoderLookup: number[] = [
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
		52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
		-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
		15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
		-1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
		41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1,
	]

	static rawFromBytes(bytes: Uint8Array): string {
		const numCompleteTriples = Math.floor(bytes.length/3)
		const rest = bytes.length % 3
		
		const utf16Bytes: Uint8Array = new Uint8Array(numCompleteTriples*4*2+(rest !== 0 ? ((rest+1)*2) : 0))
		const dataView: DataView = new DataView(utf16Bytes.buffer)

		const lookup = this.encoderLookup

		for (let i=0; i<numCompleteTriples; i++) {
			const b0 = bytes[i*3]
			const b1 = bytes[i*3+1]
			const b2 = bytes[i*3+2]
			const v24 = (b0 << 16) | (b1 << 8) | b2
			const i0 = (v24 >> 18) & 0b111111
			const i1 = (v24 >> 12) & 0b111111
			const i2 = (v24 >> 6) & 0b111111
			const i3 = v24 & 0b111111
			const offset = i*4*2
			dataView.setUint16(offset, lookup[i0])
			dataView.setUint16(offset+2, lookup[i1])
			dataView.setUint16(offset+4, lookup[i2])
			dataView.setUint16(offset+6, lookup[i3])
		}

		if (rest === 2) {
			const b0 = bytes[numCompleteTriples*3]
			const b1 = bytes[numCompleteTriples*3+1]
			const v16 = (b0 << 8) | b1
			const i0 = (v16 >> 10) & 0b111111
			const i1 = (v16 >> 4) & 0b111111
			const i2 = (v16 << 2) & 0b111111
			const offset = numCompleteTriples*4*2
			dataView.setUint16(offset, lookup[i0])
			dataView.setUint16(offset+2, lookup[i1])
			dataView.setUint16(offset+4, lookup[i2])
		} else if (rest === 1) {
			const b0 = bytes[numCompleteTriples*3]
			const v8 = b0
			const i0 = (v8 >> 2) & 0b111111
			const i1 = (v8 << 4) & 0b111111
			const offset = numCompleteTriples*4*2
			dataView.setUint16(offset, lookup[i0])
			dataView.setUint16(offset+2, lookup[i1])
		}

		return Utf16String.fromUtf16Bytes(utf16Bytes, false)
	}

	static rawFromText(text: string, encoding: ReliableTxtEncoding = ReliableTxtEncoding.Utf8): string {
		const bytes = ReliableTxtEncoder.encode(text, encoding)
		return this.rawFromBytes(bytes)
	}

	static fromBytes(bytes: Uint8Array): string {
		const result = this.rawFromBytes(bytes)
		return `Base64|${result}|`
	}

	static fromText(text: string, encoding: ReliableTxtEncoding = ReliableTxtEncoding.Utf8): string {
		const bytes = ReliableTxtEncoder.encode(text, encoding)
		return this.fromBytes(bytes)
	}

	static rawToBytes(base64Str: string): Uint8Array {
		if (base64Str.endsWith("=")) { throw new InvalidBase64StringError() }
		const numCompleteQuadruples: number = Math.floor(base64Str.length/4)
		const restLength: number = base64Str.length % 4
		if (restLength === 1) { throw new InvalidBase64StringError() }
		const bytes: Uint8Array = new Uint8Array(numCompleteQuadruples*3 + (restLength !== 0 ? restLength-1 : 0))
		const lookup = this.decoderLookup
		for (let i=0; i<numCompleteQuadruples; i++) {
			const c0 = base64Str.charCodeAt(i*4)
			const c1 = base64Str.charCodeAt(i*4+1)
			const c2 = base64Str.charCodeAt(i*4+2)
			const c3 = base64Str.charCodeAt(i*4+3)
			if (c0 > 0x7A || c1 > 0x7A || c2 > 0x7A || c3 > 0x7A) { throw new InvalidBase64StringError() }
			const n0 = lookup[c0]
			const n1 = lookup[c1]
			const n2 = lookup[c2]
			const n3 = lookup[c3]
			if (n0 < 0 || n1 < 0 || n2 < 0 || n3 < 0) { throw new InvalidBase64StringError() }
			const v24 = (n0 << 18) | (n1 << 12) | (n2 << 6) | n3
			const b0 = (v24 >> 16) & 0xFF
			const b1 = (v24 >> 8) & 0xFF
			const b2 = v24 & 0xFF
			bytes[i*3] = b0
			bytes[i*3+1] = b1
			bytes[i*3+2] = b2
		}

		if (restLength === 3) {
			const c0 = base64Str.charCodeAt(numCompleteQuadruples*4)
			const c1 = base64Str.charCodeAt(numCompleteQuadruples*4+1)
			const c2 = base64Str.charCodeAt(numCompleteQuadruples*4+2)
			if (c0 > 0x7A || c1 > 0x7A || c2 > 0x7A) { throw new InvalidBase64StringError() }
			const n0 = lookup[c0]
			const n1 = lookup[c1]
			const n2 = lookup[c2]
			if (n0 < 0 || n1 < 0 || n2 < 0) { throw new InvalidBase64StringError() }
			const v18 = (n0 << 12) | (n1 << 6) | n2
			const b0 = (v18 >> 10) & 0xFF
			const b1 = (v18 >> 2) & 0xFF
			bytes[numCompleteQuadruples*3] = b0
			bytes[numCompleteQuadruples*3+1] = b1
		} else if (restLength === 2) {
			const c0 = base64Str.charCodeAt(numCompleteQuadruples*4)
			const c1 = base64Str.charCodeAt(numCompleteQuadruples*4+1)
			if (c0 > 0x7A || c1 > 0x7A) { throw new InvalidBase64StringError() }
			const n0 = lookup[c0]
			const n1 = lookup[c1]
			if (n0 < 0 || n1 < 0) { throw new InvalidBase64StringError() }
			const v12 = (n0 << 6) | n1
			const b0 = (v12 >> 4) & 0xFF
			bytes[numCompleteQuadruples*3] = b0
		}

		return bytes
	}

	static rawToText(base64Str: string): string {
		const bytes = this.rawToBytes(base64Str)
		return ReliableTxtDecoder.decode(bytes).text
	}

	static toBytes(base64Str: string): Uint8Array {
		if (!base64Str.startsWith("Base64|")) { throw new InvalidBase64StringError() }
		if (base64Str.length < 8 || !base64Str.endsWith("|")) { throw new InvalidBase64StringError() }

		base64Str = base64Str.substring(7, base64Str.length-1)
		return this.rawToBytes(base64Str)
	}

	static toText(base64Str: string): string {
		const bytes = this.toBytes(base64Str)
		return ReliableTxtDecoder.decode(bytes).text
	}
}

// ----------------------------------------------------------------------

export class ReliableTxtDocument {
	text: string
	encoding: ReliableTxtEncoding

	constructor(text: string = "", encoding: ReliableTxtEncoding = ReliableTxtEncoding.Utf8) {
		this.text = text
		this.encoding = encoding
	}

	getBytes(): Uint8Array {
		return ReliableTxtEncoder.encode(this.text, this.encoding)
	}

	getLines(): string[] {
		return ReliableTxtLines.split(this.text)
	}

	setLines(lines: string[]) {
		this.text = ReliableTxtLines.join(lines)
	}
	
	getCodePoints(): number[] {
		return Utf16String.getCodePointArray(this.text)
	}
	
	setCodePoints(codePoints: number[]) {
		this.text = Utf16String.fromCodePointArray(codePoints)
	}

	toBase64String(): string {
		return Base64String.fromText(this.text, this.encoding)
	}
	
	static fromBytes(bytes: Uint8Array): ReliableTxtDocument {
		return ReliableTxtDecoder.decode(bytes)
	}

	static fromLines(lines: string[], encoding: ReliableTxtEncoding = ReliableTxtEncoding.Utf8) {
		const document: ReliableTxtDocument = new ReliableTxtDocument("", encoding)
		document.setLines(lines)
		return document
	}

	static fromCodePoints(codePoints: number[], encoding: ReliableTxtEncoding = ReliableTxtEncoding.Utf8) {
		const document: ReliableTxtDocument = new ReliableTxtDocument("", encoding)
		document.setCodePoints(codePoints)
		return document
	}

	static fromBase64String(base64Str: string): ReliableTxtDocument {
		const bytes = Base64String.toBytes(base64Str)
		return this.fromBytes(bytes)
	}
}