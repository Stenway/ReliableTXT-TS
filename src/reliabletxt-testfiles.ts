/* (C) Stefan John / Stenway / ReliableTXT.com / 2022 */

import * as fs from 'fs'
import { ReliableTxtDocument, ReliableTxtEncoding, Utf16String } from "./reliabletxt.js"
import { ReliableTxtFile } from "./reliabletxt-io.js"

// ----------------------------------------------------------------------

export abstract class ReliableTxtTestFiles {	
	static generate(directoryPath: string) {
		ReliableTxtTestFiles.generateFourFiles(directoryPath, "Example01_Table", ReliableTxtTestFiles.example1_table)
		ReliableTxtTestFiles.generateFourFiles(directoryPath, "Example02_Empty", ReliableTxtTestFiles.example2_empty)
		ReliableTxtTestFiles.generateFourFiles(directoryPath, "Example03_FourLines", ReliableTxtTestFiles.example3_fourLines)
		ReliableTxtTestFiles.generateFourFiles(directoryPath, "Example04_LongLines", ReliableTxtTestFiles.example4_longLines())
		ReliableTxtTestFiles.generateFourFiles(directoryPath, "Example05_C0", ReliableTxtTestFiles.example5_c0())
		ReliableTxtTestFiles.generateFourFiles(directoryPath, "Example06_UnicodeLineBreaks", ReliableTxtTestFiles.example6_unicodeLineBreaks)
		ReliableTxtTestFiles.generateFourFiles(directoryPath, "Example07_CJK", ReliableTxtTestFiles.example7_cjk())

		ReliableTxtTestFiles.generateInvalidExample01(directoryPath)
		ReliableTxtTestFiles.generateInvalidExample02(directoryPath)
	}

	private static generateInvalidExample01(directoryPath: string) {
		let name: string = "InvalidExample01_Table"
		let text: string = ReliableTxtTestFiles.example1_table
		ReliableTxtTestFiles.save(Utf16String.toUtf8Bytes(text), directoryPath+name+"_UTF8_withoutBOM.txt")
		ReliableTxtTestFiles.save(Utf16String.toUtf16Bytes(text, false), directoryPath+name+"_UTF16_withoutBOM.txt")
		ReliableTxtTestFiles.save(Utf16String.toUtf16Bytes(text, true), directoryPath+name+"_UTF16R_withoutBOM.txt")
		ReliableTxtTestFiles.save(Utf16String.toUtf32Bytes(text, false), directoryPath+name+"_UTF32_withoutBOM.txt")
		ReliableTxtTestFiles.save(Utf16String.toUtf32Bytes(text, true), directoryPath+name+"_UTF32R_withoutBOM.txt")
		
		ReliableTxtTestFiles.save(Utf16String.toUtf32Bytes("\uFEFF"+text, true), directoryPath+name+"_UTF32R.txt")
	}

	private static generateInvalidExample02(directoryPath: string) {
		let name: string = "InvalidExample02_CorruptData"
		ReliableTxtTestFiles.saveByteArray([0xEF, 0xBB, 0xBF, 0xFF], directoryPath+name+"_UTF8.txt")
		ReliableTxtTestFiles.saveByteArray([0xFE, 0xFF, 0xD8, 0x40, 0x00, 0x61], directoryPath+name+"_UTF16.txt")
		ReliableTxtTestFiles.saveByteArray([0xFF, 0xFE, 0x40, 0xD8, 0x61, 0x00], directoryPath+name+"_UTF16R.txt")
		ReliableTxtTestFiles.saveByteArray([0x00, 0x00, 0xFE, 0xFF, 0x00, 0x11, 0x00, 0x00], directoryPath+name+"_UTF32.txt")
	}

	private static saveByteArray(byteArray: number[], filePath: string) {
		fs.writeFileSync(filePath, new Uint8Array(byteArray))
	}

	private static save(bytes: Uint8Array, filePath: string) {
		fs.writeFileSync(filePath, bytes)
	}

	private static generateFourFiles(directoryPath: string, name: string, text: string) {
		ReliableTxtTestFiles.generateFile(text, directoryPath+name+"_UTF8.txt", ReliableTxtEncoding.Utf8)
		ReliableTxtTestFiles.generateFile(text, directoryPath+name+"_UTF16.txt", ReliableTxtEncoding.Utf16)
		ReliableTxtTestFiles.generateFile(text, directoryPath+name+"_UTF16R.txt", ReliableTxtEncoding.Utf16Reverse)
		ReliableTxtTestFiles.generateFile(text, directoryPath+name+"_UTF32.txt", ReliableTxtEncoding.Utf32)
	}

	private static generateFile(content: string, filePath: string, encoding: ReliableTxtEncoding) {
		ReliableTxtFile.writeAllTextSync(content, filePath, encoding)

		let readDocument: ReliableTxtDocument = ReliableTxtFile.loadSync(filePath)
		if (readDocument.text !== content) { throw Error("Mismatching text" +filePath+ readDocument.text) }
		if (readDocument.encoding !== encoding) { throw Error("Mismatching encoding") }
	}

	static readonly example1_table: string = `a 	U+0061    61            0061        "Latin Small Letter A"
~ 	U+007E    7E            007E        Tilde
¥ 	U+00A5    C2_A5         00A5        "Yen Sign"
» 	U+00BB    C2_BB         00BB        "Right-Pointing Double Angle Quotation Mark"
½ 	U+00BD    C2_BD         00BD        "Vulgar Fraction One Half"
¿ 	U+00BF    C2_BF         00BF        "Inverted Question Mark"
ß 	U+00DF    C3_9F         00DF        "Latin Small Letter Sharp S"
ä 	U+00E4    C3_A4         00E4        "Latin Small Letter A with Diaeresis"
ï 	U+00EF    C3_AF         00EF        "Latin Small Letter I with Diaeresis"
œ 	U+0153    C5_93         0153        "Latin Small Ligature Oe"
€ 	U+20AC    E2_82_AC      20AC        "Euro Sign"
東 	U+6771    E6_9D_B1      6771        "CJK Unified Ideograph-6771"
𝄞 	U+1D11E   F0_9D_84_9E   D834_DD1E   "Musical Symbol G Clef"
𠀇 	U+20007   F0_A0_80_87   D840_DC07   "CJK Unified Ideograph-20007"`

	static readonly example2_empty: string = ""

	static readonly example3_fourLines: string = `Line 1
Line 2
Line 3
`

	static example4_longLines(): string {
		let result: string = ""
		for (let l=0; l<2; l++) {
			let letter: string = l === 0 ? "A" : "B"
			for (let i=0; i<1000; i++) {
				result += "LongLine"+letter+"_"+i.toString().padStart(3, "0")
			}
			if (l === 0) { result += "\n" }
		}
		return result
	}

	static example5_c0(): string {
		let result: string = ""
		for (let i=0; i<=0x1F; i++) {
			result += String.fromCodePoint(i)
		}
		return result
	}

	static readonly example6_unicodeLineBreaks: string = "Line1| Line Feed (U+000A):\nLine2| Line Tabulation (U+000B):'\u000B' Form Feed (U+000C):'\u000C' Carriage Return (U+000D):'\r' Next Line (U+0085):'\u0085' Line Separator (U+2028):'\u2028' Paragraph Separator (U+2029):'\u2029'\nLine3|"

	static example7_cjk(): string {
		let result: string = ""
		for (let i=0; i<100; i++) {
			result += String.fromCodePoint(0x4E00+i)
		}
		return result
	}
}