# ReliableTXT

## About ReliableTXT

ReliableTXT is a **modern text file format** that was designed to make working with text files as **robust** as possible.
For that ReliableTXT strictly defines rules for the used line-break convention,
the allowed characters, the encoding and decoding process, and it's associated error handling.

ReliableTXT builds the **foundation for text file formats** like [OML](https://www.youtube.com/watch?v=iqm3sba51p0), [WSV](https://www.whitespacesv.com), [SML](https://www.simpleml.com), and [TBL](https://www.youtube.com/watch?v=mGUlW6YgHjE) (see also the [Stenway Text File Format Stack](https://www.youtube.com/watch?v=m7Z0mrcFeCg)).
All of these formats **don't need to bother about encoding and decoding** anymore, because they rely on ReliableTXT, which takes care of that aspect. Defining encoding settings on content level, like it can be done in XML and HTML files, or specifying encoding rules on format level, like the JSON specification does, are thus unnecessary.
Scanning the complete file in order to guess it's encoding is not required anymore, because
a ReliableTXT file always starts with an **unambiguous preamble**, that clearly identifies the used encoding.
The loading of a ReliableTXT file is therefore **always 100% automatic**, and thus robust and reliable.

The **line break convention** of ReliableTXT combines the line separation aspect of the Windows line break convention
with the single line feed character of POSIX text files, and thus represents the best of both worlds.
It **simplifies the specification of line-based formats**, because those formats can rely on a single line break convention,
instead of having to handle multiple conventions, which might even occur mixed in a file.

Learn more about ReliableTXT on the official website [www.reliabletxt.com](https://www.reliabletxt.com) where
you can find the complete specification and can try out ReliableTXT in an online editor. Find out what can be done
with ReliableTXT on the official [YouTube channel from Stenway](https://www.youtube.com/@stenway).
Here is a selection of videos you might start with:
* [Why I like the UTF-8 Byte Order Mark (BOM)](https://www.youtube.com/watch?v=VgVkod9HQTo)
* [Stop Using Windows Line Breaks (CRLF)](https://www.youtube.com/watch?v=YPtMCiHj7F8)
* [Convert To ReliableTXT](https://www.youtube.com/watch?v=wqQ5bkW2L6A)
* [ReliableTXT Editor in your browser - Stenway Notepad](https://www.youtube.com/watch?v=sh_hGzdnUUs)
* [ReliableTXT Summary - The Reliable Text File Format](https://www.youtube.com/watch?v=gSCg71xFdsY)
* [Document does not have a ReliableTXT preamble](https://www.youtube.com/watch?v=EKnrDwpzAl8)

## About this package

This package provides functionality to handle the **encoding and decoding** of ReliableTXT documents,
as well as functionality to **join and split lines** according to the ReliableTXT line break convention.
It also offers a way to encode and decode Base64 strings based on ReliableTXT, called **Reliable Base64**.

This package **works both in the browser and Node.js**, because it does not require environment specific functionality.
If you want to **read and write ReliableTXT files** using Node.js's file system module, you can use the **[reliabletxt-io](https://www.npmjs.com/package/@stenway/reliabletxt-io)** package.
The **[reliabletxt-browser](https://www.npmjs.com/package/@stenway/reliabletxt-browser)** package on the other hand
offers functionality to easily provide ReliableTXT documents as downloadable files.

If you want to get a first impression on how to use this package, you can watch [this video](https://www.youtube.com/watch?v=a7dLaMv6F7Y). But always check the changelog of the presented packages for possible changes, that are
not reflected in the video.

## Getting started

First get the **ReliableTXT package** installed with a package manager of your choice.
If you are using NPM just run the following command:
```
npm install @stenway/reliabletxt
```
As a first example how to use the package, let's create a ReliableTXT document and convert its content to bytes.
For that we first import the **ReliableTxtDocument** class from the ReliableTXT package:
```ts
import { ReliableTxtDocument } from "@stenway/reliabletxt"
const document = new ReliableTxtDocument("Hello 🌎")
console.log(document.toBytes())
```
We then create a new ReliableTxtDocument object and pass our text string as argument to the constructor.
After that we call the **toBytes** method and log the returned bytes to the console.
The method returns a **Uint8Array** with the following byte values:

```ts
[239, 187, 191, 72, 101, 108, 108, 111, 32, 240, 159, 140, 142]
```

The first three bytes represent the [UTF-8 BOM](https://www.youtube.com/watch?v=VgVkod9HQTo) (byte order mark) with hexadecimal values EF, BB and BF, which are the UTF-8 representation of the Unicode codepoint U+FEFF.
The six bytes after that represent the letters of the word 'Hello' and the space character.
The last four bytes are the UTF-8 representation of the world emoji with Unicode codepoint U+1F30E,
which is a supplementary character.

### Changing the encoding

**UTF-8** encoding is the **default encoding**, and one of the four encodings that ReliableTXT supports, which are:
* UTF-8
* UTF-16
* UTF-16 Reverse (Little Endian)
* UTF-32

The ReliableTXT package contains an enumeration type called **ReliableTxtEncoding** that we can use to specify,
which encoding should be used. Let's import the type and pass the encoding as argument to the constructor of the
ReliableTxtDocument class:
```ts
import { ReliableTxtDocument, ReliableTxtEncoding } from "@stenway/reliabletxt"
const document = new ReliableTxtDocument("Hello 🌎", ReliableTxtEncoding.Utf16)
console.log(document.toBytes())
```
We specify to use the **UTF-16** encoding with big endianess byte order. Let's see how the returned bytes look like:
```ts
[254, 255, 0, 72, 0, 101, 0, 108, 0, 108, 0, 111, 0, 32, 216, 60, 223, 14]
```
The first two bytes represent the BOM codepoint U+FEFF, expressed with decimal values 254 and 255.
UTF-16 is a variable-width encoding using either 2 or 4 bytes to encode a Unicode codepoint.
Codepoints of the basic multilingual plane (BMP) - like the letters of the word 'Hello' and the space character -
need 2 bytes to be encoded. In our case the characters are part of the basic latin block (from U+0000 to U+007F)
and have the characteristic zero byte in front, like for the capital letter H, which is encoded using the bytes
0 and 72. If we would have used the UTF-16 Reverse encoding (which represents little endianess),
then the byte order would be switched and the zero bytes would follow, which would mean in the case 
of our capital letter H that we would get the two bytes 72 and 0.

### Surrogate pairs

**Supplementary characters** like the world emoji need 4 bytes to be encoded and use a surrogate pair consisting
of a high and a low surrogate to express their codepoint, which is bigger than a single 16-bit value.
In our case the world emoji codepoint U+1F30E is expressed as a combination of U+D83C and U+DF0E, which
are 4 bytes with the decimal numbers 216, 60, 223 and 14.

The concept of surrogate pairs was introduced to Unicode 2.0 in 1996 when Unicode switched from the original 16-bit
range to the bigger 21-bit range, with the new maximum codepoint of U+10FFFF. The problem with surrogate pairs is
that they introduce the case of **invalid surrogate sequences and unpaired surrogates**,
for example when only a high surrogate exists, which is not followed by a low surrogate. In formats like JSON these
invalid surrogate sequences and unpaired surrogates lead to [unpredictable behaviour](https://www.rfc-editor.org/rfc/rfc8259#section-8.2).

With ReliableTXT on the other hand, the **behavior is strictly defined**. If such an invalid surrogate sequence or
an unpaired surrogate is encountered - both in the encoding and decoding process - then an error must be thrown.
Let's try to encode such an unpaired surrogate first:

```ts
const document = new ReliableTxtDocument("\uDEAD")
console.log(document.toBytes())
```
Here we pass a string containing only a low surrogate (inside the range of U+DC00 to U+DFFF).
When we call the toBytes method, it will throw an **InvalidUtf16StringError**.
Let's try it the other way around and decode an invalid byte sequence.

```ts
const invalidBytes = new Uint8Array([0xFE, 0xFF, 0xDE, 0xAD])
const document = ReliableTxtDocument.fromBytes(invalidBytes)
```
Here we pass a Uint8Array to the
static method **fromBytes** of the ReliableTxtDocument class, which will try to decode the byte sequence.
In this case the byte sequence starts with a valid UTF-16 big endian byte order mark, followed by an unpaired low surrogate. The fromBytes method will throw a **StringDecodingError** and thus makes sure that only valid codepoints
will be decoded correctly.

This behavior is different to a lot of other frameworks or libraries in many different
programming languages where the default behavior is often to ignore invalid bytes, or to insert question marks or
the Unicode replacement character (U+FFFD �). This is not the approach of ReliableTXT, because **if a file
has a defect, it shouldn't be loaded**.

### Uncode scalar values

ReliableTXT makes sure that documents only contain [Unicode scalar values](https://www.unicode.org/glossary/#unicode_scalar_value) when they are encoded or decoded, which means that valid code points are in
the range of U+0000 to U+D7FF and U+E000 to U+10FFFF.

This also means another difference to other text file approaches, because it allows the usage of the completely
valid **Unicode null codepoint** U+0000, which is for example not allowed in [POSIX text files](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap03.html#tag_03_403), because of its usage as string terminator in older programs.
So the following code - where we pass a null codepoint between the letters a and b - is perfectly valid with
ReliableTXT and won't produce an error or truncate parts of the string:
```ts
const document = new ReliableTxtDocument("a\u0000b")
console.log(document.toBytes())
```

The combination of all of these aspects of ReliableTXT make it such a robust and modern text file format.

## Reliable Base64

Encoding or decoding text as Base64 in a **reliable and comfortable way** is also something you can do with this package.
Base64 is a **binary-to-text encoding scheme**. So in order to encode text as Base64 string, we first must encode
the text as binary data. This is where ReliableTXT comes into play, to handle the encoding and decoding of text
into bytes and back again. And with the **ReliableTXT preamble** it's always clear, which encoding was used.
So if we for example would encode an empty string with the default ReliableTXT encoding - which is UTF-8 - we
would get the following Base64 string:

```
77u/
```

This is because an empty string would be encoded as three bytes, which are the three bytes of the UTF-8 byte order mark,
and "77u/" would be its Base64 representation.

But a problem is, that Base64 comes in many variations, using different alphabets and rules. A variant for example
might allow the use of padding characters, or might allow line breaks inbetween the Base64 string,
posing certain line length restrictions as well. The variation in this package for example does not allow to use
padding characters and line breaks inbetween, and the alphabet used is:

```
ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz0123456789+/
```

In order to make it clear for the decoding routine, that these rules were applied during encoding, Reliable Base64
strings start with the **prefix** "Base64|" and end with a single pipe character, which looks like in the
following examples:

```
""          	->   Base64|77u/|
"Hello"     	->   Base64|77u/SGVsbG8|
"a¥ßä€東𝄞"  	->   Base64|77u/YcKlw5/DpOKCrOadsfCdhJ4|
```

This notation clearly identifies **Reliable Base64** and makes the encoding and decoding process **100% automatic**.
It relies on all the robustness features of ReliableTXT, when it comes to error handling, and also makes it possible to
differentiate, whether text or actual binary data was encoded - like image data - because it uses the ReliableTXT
preamble to indicate that it is a text document. The following four examples encode the
same text - which is "Hello" - with all four available ReliableTXT encodings:

```
Base64|77u/SGVsbG8|
Base64|/v8ASABlAGwAbABv|
Base64|//5IAGUAbABsAG8A|
Base64|AAD+/wAAAEgAAABlAAAAbAAAAGwAAABv|
```
Because all four encodings write the ReliableTXT preamble, detecting that it is a ReliableTXT document only
takes reading the first two to four bytes. All other byte sequences are simply considered to be arbitrary binary data.

Reliable Base64 uses Unicode, so **using supplementary characters is supported**. Let's see it in action.
The ReliableTXT package has a static class called **Base64String** that offers the static method **encodeText**,
which we will use to pass a text string as argument that will be converted to the respective Reliable Base64 string:

```ts
import { Base64String } from "@stenway/reliabletxt"
console.log(Base64String.encodeText("Hello 🌎"))
```
And the returned Reliable Base64 string will be:
```
Base64|77u/SGVsbG8g8J+Mjg|
```
Let's convert the Reliable Base64 string back to its original text content using the static method **decodeAsText**:
```ts
console.log(Base64String.decodeAsText("Base64|77u/SGVsbG8g8J+Mjg|"))
```
And the original text will be logged to the console. If we take our original text string and use
another ReliableTXT encoding (e.g. UTF-16 big endian encoding), the resulting Reliable Base64 string
will look different, but will be correctly and automatically converted back to text:

```ts
import { Base64String, ReliableTxtEncoding } from "@stenway/reliabletxt"
console.log(Base64String.encodeText("Hello 🌎", ReliableTxtEncoding.Utf16))
console.log(Base64String.decodeAsText("Base64|/v8ASABlAGwAbABvACDYPN8O|"))
```

Let's try to remove the UTF-8 byte order mark from our previously with UTF-8 encoded Reliable Base64 string and see
what happens when we try to decode it. The UTF-8 byte order mark is represented by three bytes, that map directly
to the four Base64 characters "77u/", which we can easily remove from the string:

```ts
Base64String.decodeAsText("Base64|SGVsbG8g8J+Mjg|")
```
This will result in a **NoReliableTxtPreambleError**, because a text document without a valid ReliableTXT
preamble cannot be decoded. But we can decode the Reliable Base64 string as byte sequence using 
the static **decodeAsBytes** method:
```ts
console.log(Base64String.decodeAsBytes("Base64|SGVsbG8g8J+Mjg|"))
```
The counterpart to the toBytes method is the static **encodeBytes** method, which can be used like this:
```ts
const bytes = new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F])
const base64str = Base64String.encodeBytes(bytes)
```

If you want to be flexible and want to pass both strings and bytes, you can use the **encode** method, which
either takes a string as argument or a Uint8Array:
```ts
const base64Str1 = Base64String.encode("Hello 🌎")
const base64Str2 = Base64String.encode(new Uint8Array([0x00, 0x01, 0x02, 0x03])
```
The counterpart is the **decode** method which will either return a string or a Uint8Array.
```ts
const stringOrBytes: string | Uint8Array = Base64String.decode(base64Str1)
if (stringOrBytes instanceof Uint8Array) { /* binary data */ }
else { /* text data */ }
```
The automatic detection is possible, because the Reliable Base64 approach encodes text
as a ReliableTXT document which has an easily detectable preamble. If the preamble
was found, the bytes are decoded as text, or else the bytes are simply returned.

If you want to know more about Reliable Base64, you can watch the following videos:
* [Reliable Base64 - No more btoa & atob](https://www.youtube.com/watch?v=Fr6JQy6QZno)
* [Reliable Base64 in action - using TypeScript and SML](https://www.youtube.com/watch?v=lXth2oXOeCE)

## Transfering ReliableTXT documents using HTTP

If you want to transfer ReliableTXT documents over the network using HTTP, use the following MIME type:
```
application/reliabletxt
```
Learn more about it in detail in [this video](https://www.youtube.com/watch?v=Z0xjuHgAAXw).

## Package types

### Base64String
The static Base64String class provides all the functionality needed to encode and decode Reliable Base64 strings.
It has the following members:
```ts
static encodeBytes(bytes: Uint8Array): string
static encodeText(text: string, encoding?: ReliableTxtEncoding): string
static decodeAsBytes(base64Str: string): Uint8Array
static decodeAsText(base64Str: string): string
static encode(stringOrBytes: string | Uint8Array): string
static decode(base64Str: string): string | Uint8Array
```

Use the static encodeBytes and decodeAsBytes methods to convert from bytes to a Reliable Base64 string and back again:
```ts
const bytes = new Uint8Array([0x4D, 0x61, 0x6E])
const base64str = Base64String.encodeBytes(bytes)
console.log(base64str)
const returnedBytes = Base64String.decodeAsBytes(base64str)
console.log(returnedBytes)
```

Use the static encodeText and decodeAsText methods to convert from text to a Reliable Base64 string and back again:
```ts
const text = "a¥ßä€東𝄞"
const base64str = Base64String.encodeText(text)
console.log(base64str)
const returnedText = Base64String.decodeAsText(base64str)
console.log(returnedText)
console.log(text === returnedText)
```

Specify the used encoding, by passing a ReliableTxtEncoding enum value to the encodeText method:
```ts
const base64str = Base64String.encodeText("abc", ReliableTxtEncoding.Utf16)
```

If you want to use the Base64 encoder and decoder without the Reliable Base64 prefix 'Base64|' and suffix '|', use the analogous static methods of the RawBase64String class.

```ts
const text = "a¥ßä€東𝄞"
const base64str = RawBase64String.encodeText(text)
console.log(base64str)
const returnedText = RawBase64String.decodeAsText(base64str)
console.log(returnedText)
console.log(text === returnedText)
```

### RawBase64String

```ts
static encodeBytes(bytes: Uint8Array): string
static encodeText(text: string, encoding?: ReliableTxtEncoding): string
static decodeAsBytes(base64Str: string): Uint8Array
static decodeAsText(base64Str: string): string
static encode(stringOrBytes: string | Uint8Array): string
static decode(base64Str: string): string | Uint8Array
```

### InvalidBase64StringError

An error of type InvalidBase64StringError is thrown when an invalid Reliable Base64 string is passed to
a Base64 decoding method, like in the following example the static decodeAsText method:

```ts
Base64String.decodeAsText("")
```

### InvalidUtf16StringError

An error of type InvalidUtf16StringError is thrown when an invalid surrogate sequence or an unpaired surrogate
is encountered in a string, like here in this example:
```ts
ReliableTxtEncoder.encode("\uDEAD", ReliableTxtEncoding.Utf8)
```

### NoReliableTxtPreambleError

An error of type NoReliableTxtPreambleError is thrown when a byte sequence is passed to the decoder, which does
not start with a valid ReliableTXT preamble, like in this example where an empty byte array is passed:

```ts
let emptyByteArray = new Uint8Array()
try {
	let x = ReliableTxtDecoder.decode(emptyByteArray)
} catch (err) {
	console.log("Error: Document does not have a ReliableTXT preamble")
}
let encoding = ReliableTxtDecoder.getEncodingOrNull(emptyByteArray)
```

### ReliableTxtDecoder

The static ReliableTxtDecoder class contains all methods needed to decode ReliableTXT documents from byte sequences.
The members of the class are:
```ts
static getEncodingOrNull(bytes: Uint8Array): ReliableTxtEncoding | null
static getEncoding(bytes: Uint8Array): ReliableTxtEncoding
static decode(bytes: Uint8Array): ReliableTxtDocument
static decodePart(bytes: Uint8Array, encoding: ReliableTxtEncoding): string
```

The static getEncoding and getEncodingOrNull methods differ in the handling of the erroneous case, that a provided
byte sequence does not contain a valid ReliableTXT preamble. The first one throws a NoReliableTxtPreambleError in
that case, while the second one simply returns null:
```ts
let emptyByteArray = new Uint8Array()
let encoding = ReliableTxtDecoder.getEncodingOrNull(emptyByteArray)
ReliableTxtDecoder.getEncoding(emptyByteArray)
```

### ReliableTxtDocument
The ReliableTxtDocument class is used to represent a ReliableTXT document as a comfortable object to work with.
It stores the text as a property and the encoding as well, which should be used when converting the text to bytes,
or which was detected during the decoding process. It has multiple comfort methods to use the functionality provided in
the other static classes, like the ReliableTxtEncoder, ReliableTxtDecoder and Base64String class.
The members of the class are:

```ts
text: string
encoding: ReliableTxtEncoding
constructor(text?: string, encoding?: ReliableTxtEncoding)
toBytes(): Uint8Array
getLines(): string[]
setLines(lines: string[])
getCodePoints(): number[]
setCodePoints(codePoints: number[])
toBase64String(): string
static fromBytes(bytes: Uint8Array): ReliableTxtDocument
static fromLines(lines: string[], encoding?: ReliableTxtEncoding): ReliableTxtDocument
static fromCodePoints(codePoints: number[], encoding?: ReliableTxtEncoding): ReliableTxtDocument
static fromBase64String(base64Str: string): ReliableTxtDocument
```

Here are some methods in action:
```ts
let document = new ReliableTxtDocument(text)
let documentUtf16 = new ReliableTxtDocument(text, ReliableTxtEncoding.Utf16)

let documentEncoding = document.encoding
let documentText = document.text
let documentBytes = document.toBytes()
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
```

The ReliableTxtDocument class has the comfort methods toBase64String and fromBase64String to simply convert the
content of the document to a Reliable Base64 string and back again. The chosen encoding of the ReliableTxtDocument
will be preserved:

```ts
let document = new ReliableTxtDocument("abc")
let base64Str = document.toBase64String()
let document2 = ReliableTxtDocument.fromBase64String(base64Str)
console.log(document.text === document2.text)
console.log(document.encoding === document2.encoding)
```

### ReliableTxtEncoder
The static ReliableTxtEncoder class provides methods for the encoding of ReliableTXT documents.
Its members are:
```ts
static encode(text: string, encoding: ReliableTxtEncoding): Uint8Array
static encodePart(text: string, encoding: ReliableTxtEncoding): Uint8Array
```

Here is the same string encoded four times with all of the four available ReliableTXT encodings:
```ts
let text = "A\nB"
let utf8Bytes = ReliableTxtEncoder.encode(text, ReliableTxtEncoding.Utf8)
let utf16Bytes = ReliableTxtEncoder.encode(text, ReliableTxtEncoding.Utf16)
let utf16ReverseBytes = ReliableTxtEncoder.encode(text, ReliableTxtEncoding.Utf16Reverse)
let utf32Bytes = ReliableTxtEncoder.encode(text, ReliableTxtEncoding.Utf32)
```

### ReliableTxtEncoding

This enumeration lists all of the four available ReliableTXT encodings, which are:
```ts
Utf8 = 0
Utf16 = 1
Utf16Reverse = 2
Utf32 = 3
```

### ReliableTxtEncodingUtil
The static ReliableTxtEncodingUtil class offers utility functionality, like providing the preamble bytes for every
available encoding. Its members are:
```ts
static getPreambleSize(encoding: ReliableTxtEncoding): number
static getPreambleBytes(encoding: ReliableTxtEncoding): Uint8Array
```

### ReliableTxtLines
The static ReliableTxtLines class provides comfort methods to join and split lines according to the ReliableTXT
line break convention, as well as getting line index information. Its members are:
```ts
static join(lines: string[]): string
static split(text: string): string[]
static getLineInfo(text: string, codeUnitIndex: number): [charIndex: number, lineIndex: number, lineCharIndex: number]
```

Here is an example of how to join and split lines:
```ts
let twoJoinedLines = ReliableTxtLines.join(["Line 1", "Line 2"])
let twoLines = ReliableTxtLines.split(twoJoinedLines)
let threeLines = ReliableTxtLines.split("Line 1\r\nLine 2\n")
```

### StringDecodingError
An error of type StringDecodingError is thrown, when invalid bytes sequences are passed to the decoder,
that cannot be decoded using UTF-8, UTF-16 or UTF-32 encoding, for example:
```ts
const invalidUtf8Bytes = new Uint8Array([0xEF, 0xBB, 0xBF, 0xFF])
const invalidUtf16Bytes = new Uint8Array([0xFE, 0xFF, 0xDE, 0xAD])
const document = ReliableTxtDocument.fromBytes(invalidUtf16Bytes)
```

### Utf16String
The static Utf16String class is a utility class that provides all the encoding and decoding functionality
for UTF-8, UTF-16 and UTF-32. Its members are:
```ts
static isValid(str: string): boolean
static validate(str: string)
static getCodePointCount(str: string): number
static getCodePointArray(str: string): number[]
static getCodePoints(str: string): Uint32Array
static toUtf8Bytes(text: string): Uint8Array
static toUtf16Bytes(text: string, littleEndian?: boolean): Uint8Array
static toUtf32Bytes(str: string, littleEndian?: boolean): Uint8Array
static fromUtf8Bytes(bytes: Uint8Array, skipFirstBom?: boolean): string
static fromUtf16Bytes(bytes: Uint8Array, littleEndian: boolean, skipFirstBom?: boolean): string
static fromUtf32Bytes(bytes: Uint8Array, littleEndian: boolean, skipFirstBom?: boolean): string
static fromCodePointArray(codePoints: number[]): string
```

## Related packages

The [Stenway Text File Format Stack](https://www.youtube.com/watch?v=m7Z0mrcFeCg) defines a set of formats
that are built upon ReliableTXT. Check out the following related packages:

* [Whitespace Separated Values (WSV)](https://www.npmjs.com/package/@stenway/wsv)
* [Simple Markup Language (SML)](https://www.npmjs.com/package/@stenway/sml)
* [TBL](https://www.npmjs.com/package/@stenway/tbl)
* [OML](https://www.npmjs.com/package/@stenway/oml)