export declare enum ReliableTxtEncoding {
    Utf8 = 0,
    Utf16 = 1,
    Utf16Reverse = 2,
    Utf32 = 3
}
export declare abstract class ReliableTxtEncodingUtil {
    static getPreambleSize(encoding: ReliableTxtEncoding): number;
    static getPreambleBytes(encoding: ReliableTxtEncoding): Uint8Array;
}
export declare abstract class ReliableTxtLines {
    static join(lines: string[]): string;
    static split(text: string): string[];
    static getLineInfo(text: string, codeUnitIndex: number): [charIndex: number, lineIndex: number, lineCharIndex: number];
}
export declare class InvalidUtf16StringError extends Error {
    constructor();
}
export declare class StringDecodingError extends Error {
    constructor();
}
export declare class NoReliableTxtPreambleError extends Error {
    constructor();
}
export declare abstract class Utf16String {
    static isValid(str: string): boolean;
    static validate(str: string): void;
    static getCodePointCount(str: string): number;
    static getCodePointArray(str: string): number[];
    static getCodePoints(str: string): Uint32Array;
    static getUtf8ByteCount(str: string): number;
    static toUtf8Bytes(text: string): Uint8Array;
    static toUtf16Bytes(text: string, littleEndian?: boolean): Uint8Array;
    static toUtf32Bytes(str: string, littleEndian?: boolean): Uint8Array;
    static fromUtf8Bytes(bytes: Uint8Array, skipFirstBom?: boolean): string;
    static fromUtf16Bytes(bytes: Uint8Array, littleEndian: boolean, skipFirstBom?: boolean): string;
    static fromUtf32Bytes(bytes: Uint8Array, littleEndian: boolean, skipFirstBom?: boolean): string;
    static fromCodePointArray(codePoints: number[]): string;
}
export declare abstract class ReliableTxtEncoder {
    static encode(text: string, encoding: ReliableTxtEncoding): Uint8Array;
    static encodePart(text: string, encoding: ReliableTxtEncoding): Uint8Array;
}
export declare abstract class ReliableTxtDecoder {
    static getEncodingOrNull(bytes: Uint8Array): ReliableTxtEncoding | null;
    static getEncoding(bytes: Uint8Array): ReliableTxtEncoding;
    static decode(bytes: Uint8Array): ReliableTxtDocument;
    static decodePart(bytes: Uint8Array, encoding: ReliableTxtEncoding): string;
}
export declare class InvalidBase64StringError extends Error {
    constructor();
}
export declare abstract class RawBase64String {
    private static encoderLookup;
    private static decoderLookup;
    static encodeBytes(bytes: Uint8Array): string;
    static encodeText(text: string, encoding?: ReliableTxtEncoding): string;
    static decodeAsBytes(rawBase64Str: string): Uint8Array;
    static decodeAsText(rawBase64Str: string): string;
    static encode(stringOrBytes: string | Uint8Array): string;
    static decode(rawBase64Str: string): string | Uint8Array;
}
export declare abstract class Base64String {
    static encodeBytes(bytes: Uint8Array): string;
    static encodeText(text: string, encoding?: ReliableTxtEncoding): string;
    static decodeAsBytes(base64Str: string): Uint8Array;
    static decodeAsText(base64Str: string): string;
    static encode(stringOrBytes: string | Uint8Array): string;
    static decode(base64Str: string): string | Uint8Array;
}
export declare class ReliableTxtDocument {
    text: string;
    encoding: ReliableTxtEncoding;
    constructor(text?: string, encoding?: ReliableTxtEncoding);
    toBytes(): Uint8Array;
    getLines(): string[];
    setLines(lines: string[]): void;
    getCodePoints(): number[];
    setCodePoints(codePoints: number[]): void;
    toBase64String(): string;
    static fromBytes(bytes: Uint8Array): ReliableTxtDocument;
    static fromLines(lines: string[], encoding?: ReliableTxtEncoding): ReliableTxtDocument;
    static fromCodePoints(codePoints: number[], encoding?: ReliableTxtEncoding): ReliableTxtDocument;
    static fromBase64String(base64Str: string): ReliableTxtDocument;
}
//# sourceMappingURL=reliabletxt.d.ts.map