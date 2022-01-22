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
		else { throw new Error() }
	}
}

// ----------------------------------------------------------------------

export abstract class ReliableTxtLines {
	static join(...lines: string[]): string {
		return lines.join("\n")
	}
	
	static split(text: string): string[] {
		return text.split("\n")
	}		
}

// ----------------------------------------------------------------------

export class ReliableTxtError extends Error {
	constructor(message?: string) {
		super(message)
	}
}

// ----------------------------------------------------------------------

export class NoReliableTxtPreambleError extends ReliableTxtError {
	constructor() {
		super("Document does not have a ReliableTXT preamble")
	}
}

// ----------------------------------------------------------------------

export class InvalidStringError extends ReliableTxtError {
	constructor() {
		super("The string contains an invalid codepoint")
	}
}

// ----------------------------------------------------------------------

export class InvalidEncodedDataError extends ReliableTxtError {
	constructor() {
		super("Invalid encoded data could not be decoded")
	}
}

// ----------------------------------------------------------------------

export abstract class ReliableTxtString {
	static getCodePoints(text: string): number[] {
		return Array.from(text).map(c => c.codePointAt(0)!)
	}

	static isValid(text: string): boolean {
		for (let i=0; i<text.length; i++) {
			let firstCodeUnit: number = text.charCodeAt(i)
			if (firstCodeUnit >= 0xD800 && firstCodeUnit <= 0xDBFF) {
				i++
				if (i >= text.length) { return false }
				let secondCodeUnit: number = text.charCodeAt(i)
				if (!(secondCodeUnit >= 0xDC00 && secondCodeUnit <= 0xDFFF)) { return false }
			}
		}
		return true
	}

	static validate(text: string) {
		if (!ReliableTxtString.isValid(text)) { throw new InvalidStringError() }
	}
}

// ----------------------------------------------------------------------

export abstract class ReliableTxtEncoder {
	static encode(text: string, encoding: ReliableTxtEncoding): Uint8Array {
		let textWithPreamble: string = "\uFEFF" + text
		return ReliableTxtEncoder.encodePart(textWithPreamble, encoding)
	}

	static encodePart(text: string, encoding: ReliableTxtEncoding): Uint8Array {
		if (encoding === ReliableTxtEncoding.Utf8) { return ReliableTxtEncoder.encodePartAsUtf8(text) }
		else if (encoding === ReliableTxtEncoding.Utf16) { return ReliableTxtEncoder.encodePartAsUtf16(text, false) }
		else if (encoding === ReliableTxtEncoding.Utf16Reverse) { return ReliableTxtEncoder.encodePartAsUtf16(text, true) }
		else if (encoding === ReliableTxtEncoding.Utf32) { return ReliableTxtEncoder.encodePartAsUtf32(text) }
		else { throw new RangeError() }
	}

	private static encodePartAsUtf8(text: string): Uint8Array {
		ReliableTxtString.validate(text)
		let utf8Encoder = new TextEncoder()
		return utf8Encoder.encode(text)
	}

	private static encodePartAsUtf16(text: string, reverse: boolean): Uint8Array {
		let byteArray: Uint8Array = new Uint8Array(text.length*2)
		let dataView: DataView = new DataView(byteArray.buffer)
		let wasHighSurrogate: boolean = false
		for (let i=0; i < text.length; i++) {
			let codeUnit: number = text.charCodeAt(i)
			if (wasHighSurrogate) {
				if (!(codeUnit >= 0xDC00 && codeUnit <= 0xDFFF)) { throw new InvalidStringError() }
				wasHighSurrogate = false
			} else if (codeUnit >= 0xD800 && codeUnit <= 0xDBFF) { wasHighSurrogate = true }
			dataView.setUint16(i*2, codeUnit, reverse)
		}
		if (wasHighSurrogate) { throw new InvalidStringError() }
		return byteArray
	}

	private static encodePartAsUtf32(text: string): Uint8Array {
		let numCodePoints: number = 0
		for (let i=0; i<text.length; i++) {
			let firstCodeUnit: number = text.charCodeAt(i)
			if (firstCodeUnit >= 0xD800 && firstCodeUnit <= 0xDBFF) {
				i++
			}
			numCodePoints++
		}
		let byteArray: Uint8Array = new Uint8Array(numCodePoints*4)
		let dataView: DataView = new DataView(byteArray.buffer)
		let cpIndex: number = 0
		for (let i=0; i < text.length; i++) {
			let codePoint: number = text.charCodeAt(i)
			if (codePoint >= 0xD800 && codePoint <= 0xDBFF) {
				i++
				if (i >= text.length) { throw new InvalidStringError() }
				let secondCodeUnit: number = text.charCodeAt(i)
				if (!(secondCodeUnit >= 0xDC00 && secondCodeUnit <= 0xDFFF)) { throw new InvalidStringError() }
				codePoint = (codePoint - 0xD800) * 0x400 + secondCodeUnit - 0xDC00 + 0x10000
			}
			dataView.setUint32(cpIndex*4, codePoint, false)
			cpIndex++
		}
		return byteArray
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
		let text: string = this.decodePart(bytes, encoding)
		return new ReliableTxtDocument(text, encoding)
	}

	static decodePart(bytes: Uint8Array, encoding: ReliableTxtEncoding): string {
		if (encoding === ReliableTxtEncoding.Utf8) { return ReliableTxtDecoder.decodeUtf8(bytes) }
		else if (encoding === ReliableTxtEncoding.Utf16) { return ReliableTxtDecoder.decodeUtf16(bytes, false) }
		else if (encoding === ReliableTxtEncoding.Utf16Reverse) { return ReliableTxtDecoder.decodeUtf16(bytes, true) }
		else if (encoding === ReliableTxtEncoding.Utf32) { return ReliableTxtDecoder.decodeUtf32(bytes) }
		else { throw new RangeError() }
	}
	
	private static decodeUtf8(bytes: Uint8Array): string {
		let utf8Decoder = new TextDecoder("utf-8", {fatal: true})
		return utf8Decoder.decode(bytes)
	}

	private static decodeUtf16(bytes: Uint8Array, reverse: boolean): string {
		// Workaround: node.js ERR_ENCODING_INVALID_ENCODED_DATA ~270_000_000
		let utf16Decoder = new TextDecoder("utf-16" + (reverse ? "le" : "be"), {fatal: false})
		if (bytes.length < 200_000_000) {
			return utf16Decoder.decode(bytes)
		} else {
			const chunkSize: number = 200_000_000
			let result: string = ""
			let curPos: number = 0
			while (true) {
				let rest: number = bytes.length - curPos
				let curLength: number = rest >= chunkSize ? chunkSize : rest

				let part: Uint8Array = bytes.slice(curPos, curPos + curLength)
				curPos += curLength
				result += utf16Decoder.decode(part)
				if (curPos >= bytes.length) { break }
			}
			bytes.slice()
			return result
		}
	}

	private static decodeUtf32(bytes: Uint8Array): string {
		let numCodePoints: number = bytes.length/4
		let numCodeUnits: number = 0
		for (let i=0; i<numCodePoints; i++) {
			let codePoint: number = bytes[4*i] << 24 | bytes[4*i+1] << 16 | bytes[4*i+2] << 8 | bytes[4*i+3]
			if (codePoint > 0x010000) { numCodeUnits++ }
			if (codePoint > 0x10FFFF) {  }
			numCodeUnits++
		}
		let utf16Bytes: Uint8Array = new Uint8Array(numCodeUnits*2)
		let dataView: DataView = new DataView(utf16Bytes.buffer)
		let codeUnitIndex: number = 0
		for (let i=0; i<numCodePoints; i++) {
			let codePoint: number = bytes[4*i] << 24 | bytes[4*i+1] << 16 | bytes[4*i+2] << 8 | bytes[4*i+3]
			if (codePoint > 0x10FFFF || (codePoint >= 0xD800 && codePoint <= 0xDFFF)) { throw new InvalidEncodedDataError() }
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
		return ReliableTxtDecoder.decodeUtf16(utf16Bytes, false)
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

	setLines(...lines: string[]) {
		this.text = ReliableTxtLines.join(...lines)
	}
	
	getLines(): string[] {
		return ReliableTxtLines.split(this.text)
	}
	
	getCodePoints(): number[] {
		return ReliableTxtString.getCodePoints(this.text)
	}
	
	setCodePoints(...codePoints: number[]) {
		this.text = String.fromCodePoint(...codePoints)
	}

	static fromBytes(bytes: Uint8Array): ReliableTxtDocument {
		return ReliableTxtDecoder.decode(bytes)
	}

	static fromLines(...lines: string[]) {
		let document: ReliableTxtDocument = new ReliableTxtDocument()
		document.setLines(...lines)
		return document
	}
}