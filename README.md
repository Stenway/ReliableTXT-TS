# ReliableTXT

## About

[ReliableTXT Documentation/Specification](https://www.reliabletxt.com)

## Installation

Using NPM:
```
npm install @stenway/reliabletxt
```

## Getting started

```ts
import { ReliableTxtLines } from "@stenway/reliabletxt"
console.log(ReliableTxtLines.split("Hello\nWorld"))
```

For file reading and writing functionality see the [reliabletxt-io package](https://www.npmjs.com/package/@stenway/reliabletxt-io).

## Videos
* [Package Usage](https://www.youtube.com/watch?v=a7dLaMv6F7Y)
* [Why I like the UTF-8 Byte Order Mark (BOM)](https://www.youtube.com/watch?v=VgVkod9HQTo)
* [Stop Using Windows Line Breaks (CRLF)](https://www.youtube.com/watch?v=YPtMCiHj7F8)

Others:
* [Convert To ReliableTXT](https://www.youtube.com/watch?v=wqQ5bkW2L6A)
* [ReliableTXT Editor in your browser - Stenway Notepad](https://www.youtube.com/watch?v=sh_hGzdnUUs)

## Examples

```ts
import {
	ReliableTxtDecoder, 
	ReliableTxtDocument,
	ReliableTxtEncoder,
	ReliableTxtEncoding,
	ReliableTxtLines
} from "@stenway/reliabletxt"

// join and split lines

let twoJoinedLines = ReliableTxtLines.join(["Line 1", "Line 2"])
let twoLines = ReliableTxtLines.split(twoJoinedLines)
let threeLines = ReliableTxtLines.split("Line 1\r\nLine 2\n")

// encode

let text = "A\nB"
let utf8Bytes = ReliableTxtEncoder.encode(text, ReliableTxtEncoding.Utf8)
let utf16Bytes = ReliableTxtEncoder.encode(text, ReliableTxtEncoding.Utf16)
let utf16ReverseBytes = ReliableTxtEncoder.encode(text, ReliableTxtEncoding.Utf16Reverse)
let utf32Bytes = ReliableTxtEncoder.encode(text, ReliableTxtEncoding.Utf32)

// decode

let text1 = ReliableTxtDecoder.decode(utf8Bytes)
let text2 = ReliableTxtDecoder.decode(utf16Bytes)
let text3 = ReliableTxtDecoder.decode(utf16ReverseBytes)
let text4 = ReliableTxtDecoder.decode(utf32Bytes)

// no ReliableTXT preamble

let zeroBytes = new Uint8Array()
try {
	let x = ReliableTxtDecoder.decode(zeroBytes)
} catch (err) {
	console.log("Error: Document does not have a ReliableTXT preamble")
}
let encoding = ReliableTxtDecoder.getEncodingOrNull(zeroBytes)

// document class

let document = new ReliableTxtDocument(text)
let documentUtf16 = new ReliableTxtDocument(text, ReliableTxtEncoding.Utf16)

let documentEncoding = document.encoding
let documentText = document.text
let documentBytes = document.getBytes()
let documentCodePoints = document.getCodePoints()
let documentLines = document.getLines()

document.setCodePoints([0x61, 0x6771, 0x1D11E])
documentText = document.text

document.setLines(["A", "B", "C"])
documentText = document.text

document = ReliableTxtDocument.fromBytes(utf8Bytes)
document = ReliableTxtDocument.fromLines(["A", "B", "C"])

try {
	let invalidUtf8Bytes = new Uint8Array([0xEF, 0xBB, 0xBF, 0xFF])
	document = ReliableTxtDocument.fromBytes(invalidUtf8Bytes)
} catch (err) {
	console.log("Error: Decoding error")
}

console.log("ReliableTXT usage")
```