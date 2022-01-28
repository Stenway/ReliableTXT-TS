/* (C) Stefan John / Stenway / ReliableTXT.com / 2022 */

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
}

// ----------------------------------------------------------------------

export abstract class ReliableTxtLines {
	static join(lines: string[]): string {
		return lines.join("\n")
	}
	
	static split(text: string): string[] {
		return text.split("\n")
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
			let firstCodeUnit: number = str.charCodeAt(i)
			if (firstCodeUnit >= 0xD800 && firstCodeUnit <= 0xDFFF) {
				if (firstCodeUnit >= 0xDC00) { return false }
				i++
				if (i >= str.length) { return false }
				let secondCodeUnit: number = str.charCodeAt(i)
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
			let firstCodeUnit: number = str.charCodeAt(i)
			if (firstCodeUnit >= 0xD800 && firstCodeUnit <= 0xDFFF) {
				if (firstCodeUnit >= 0xDC00) { throw new InvalidUtf16StringError() }
				i++
				if (i >= str.length) { throw new InvalidUtf16StringError() }
				let secondCodeUnit: number = str.charCodeAt(i)
				if (!(secondCodeUnit >= 0xDC00 && secondCodeUnit <= 0xDFFF)) { throw new InvalidUtf16StringError() }
			}
			count++
		}
		return count
	}

	static getCodePointArray(str: string): number[] {
		let numCodePoints: number = Utf16String.getCodePointCount(str)
		let codePoints: number[] = new Array<number>(numCodePoints)
		let codePointIndex: number = 0
		for (let i=0; i<str.length; i++) {
			let codePoint: number = str.charCodeAt(i)
			if (codePoint >= 0xD800 && codePoint <= 0xDBFF) {
				i++
				let secondCodeUnit: number = str.charCodeAt(i)
				codePoint = (codePoint - 0xD800) * 0x400 + secondCodeUnit - 0xDC00 + 0x10000
			}
			codePoints[codePointIndex] = codePoint
			codePointIndex++
		}
		return codePoints
	}

	static getCodePoints(str: string): Uint32Array {
		let numCodePoints: number = Utf16String.getCodePointCount(str)
		let codePoints: Uint32Array = new Uint32Array(numCodePoints)
		let codePointIndex: number = 0
		for (let i=0; i<str.length; i++) {
			let codePoint: number = str.charCodeAt(i)
			if (codePoint >= 0xD800 && codePoint <= 0xDBFF) {
				i++
				let secondCodeUnit: number = str.charCodeAt(i)
				codePoint = (codePoint - 0xD800) * 0x400 + secondCodeUnit - 0xDC00 + 0x10000
			}
			codePoints[codePointIndex] = codePoint
			codePointIndex++
		}
		return codePoints
	}

	static toUtf8Bytes(text: string): Uint8Array {
		Utf16String.validate(text)
		let utf8Encoder = new TextEncoder()
		return utf8Encoder.encode(text)
	}

	static toUtf16Bytes(text: string, littleEndian: boolean = false): Uint8Array {
		let byteArray: Uint8Array = new Uint8Array(text.length*2)
		let dataView: DataView = new DataView(byteArray.buffer)
		let wasHighSurrogate: boolean = false
		for (let i=0; i < text.length; i++) {
			let codeUnit: number = text.charCodeAt(i)
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
		let numCodePoints: number = Utf16String.getCodePointCount(str)
		let byteArray: Uint8Array = new Uint8Array(numCodePoints*4)
		let dataView: DataView = new DataView(byteArray.buffer)
		let codePointIndex: number = 0
		for (let i=0; i < str.length; i++) {
			let codePoint: number = str.charCodeAt(i)
			if (codePoint >= 0xD800 && codePoint <= 0xDBFF) {
				i++
				let secondCodeUnit: number = str.charCodeAt(i)
				codePoint = (codePoint - 0xD800) * 0x400 + secondCodeUnit - 0xDC00 + 0x10000
			}
			dataView.setUint32(codePointIndex*4, codePoint, littleEndian)
			codePointIndex++
		}
		return byteArray
	}

	static fromUtf8Bytes(bytes: Uint8Array, skipFirstBom: boolean = false): string {
		let utf8Decoder: TextDecoder = new TextDecoder("utf-8", {fatal: true, ignoreBOM: !skipFirstBom})
		try {
			return utf8Decoder.decode(bytes)
		} catch (error) {
			if (error instanceof TypeError) { throw new StringDecodingError() }
			else { throw error }
		}
	}

	static fromUtf16Bytes(bytes: Uint8Array, littleEndian: boolean, skipFirstBom: boolean = false): string {
		let utf16Decoder: TextDecoder = new TextDecoder("utf-16" + (littleEndian ? "le" : "be"), {fatal: true, ignoreBOM: !skipFirstBom})
		try {
			return utf16Decoder.decode(bytes)
		} catch (error) {
			if (error instanceof TypeError) { 
				console.log(error)
				throw new StringDecodingError() }
			else { throw error }
		}
	}

	static fromUtf32Bytes(bytes: Uint8Array, littleEndian: boolean, skipFirstBom: boolean = false): string {
		let numCodePoints: number = bytes.length/4
		let numCodeUnits: number = 0
		let bytesDataView: DataView = new DataView(bytes.buffer)
		let startIndex: number = 0
		if (skipFirstBom && bytesDataView.byteLength >= 4 && bytesDataView.getUint32(0, littleEndian) == 0xFEFF) {
			startIndex = 1
		}
		for (let i=startIndex; i<numCodePoints; i++) {
			let codePoint: number = bytesDataView.getUint32(4*i, littleEndian)
			if (codePoint > 0x010000) { numCodeUnits++ }
			if (codePoint > 0x10FFFF || (codePoint >= 0xD800 && codePoint <= 0xDFFF)) { throw new StringDecodingError() }
			numCodeUnits++
		}
		let utf16Bytes: Uint8Array = new Uint8Array(numCodeUnits*2)
		let dataView: DataView = new DataView(utf16Bytes.buffer)
		let codeUnitIndex: number = 0
		for (let i=startIndex; i<numCodePoints; i++) {
			let codePoint: number = bytesDataView.getUint32(4*i, littleEndian)
			if (codePoint > 0x010000) {
				codePoint -= 0x010000
				let highSurrogate: number = (codePoint >> 10) + 0xD800
				dataView.setUint16(codeUnitIndex*2, highSurrogate, false)
				codeUnitIndex++
				let lowSurrogate: number = (codePoint % 0x400) + 0xDC00
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
			let codePoint: number = codePoints[i]
			if (codePoint > 0x010000) { numCodeUnits++ }
			if (codePoint > 0x10FFFF || (codePoint >= 0xD800 && codePoint <= 0xDFFF)) { throw new StringDecodingError() }
			numCodeUnits++
		}
		let utf16Bytes: Uint8Array = new Uint8Array(numCodeUnits*2)
		let dataView: DataView = new DataView(utf16Bytes.buffer)
		let codeUnitIndex: number = 0
		for (let i=0; i<codePoints.length; i++) {
			let codePoint: number = codePoints[i]
			if (codePoint > 0x010000) {
				codePoint -= 0x010000
				let highSurrogate: number = (codePoint >> 10) + 0xD800
				dataView.setUint16(codeUnitIndex*2, highSurrogate, false)
				codeUnitIndex++
				let lowSurrogate: number = (codePoint % 0x400) + 0xDC00
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
		let textWithPreamble: string = "\uFEFF" + text
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
		let encoding: ReliableTxtEncoding | null = ReliableTxtDecoder.getEncodingOrNull(bytes)
		if (encoding === null) {
			throw new NoReliableTxtPreambleError()
		}
		return encoding!
	}
	
	static decode(bytes: Uint8Array): ReliableTxtDocument {
		let encoding: ReliableTxtEncoding = ReliableTxtDecoder.getEncoding(bytes)
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

	setLines(lines: string[]) {
		this.text = ReliableTxtLines.join(lines)
	}
	
	getLines(): string[] {
		return ReliableTxtLines.split(this.text)
	}
	
	getCodePoints(): number[] {
		return Utf16String.getCodePointArray(this.text)
	}
	
	setCodePoints(codePoints: number[]) {
		this.text = Utf16String.fromCodePointArray(codePoints)
	}

	static fromBytes(bytes: Uint8Array): ReliableTxtDocument {
		return ReliableTxtDecoder.decode(bytes)
	}

	static fromLines(lines: string[]) {
		let document: ReliableTxtDocument = new ReliableTxtDocument()
		document.setLines(lines)
		return document
	}
}