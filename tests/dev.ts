/* eslint-disable no-console */

import { RawBase64String } from "../src/reliabletxt.js"

let startTimeStamp: number
let startText: string

function startTime(text: string) {
	startText = text
	startTimeStamp = Date.now()
}

function stopTime() {
	const duration = Date.now() - startTimeStamp
	console.log(startText+"..."+duration+"ms")
}

function testBigFile() {
	const bytes = new Uint8Array(128 * 1024 * 1024 * 3 / 4 - 3)
	console.log(bytes.length)
	startTime("RawBase64String.encodeBytes")
	const base64str = RawBase64String.encodeBytes(bytes)
	stopTime()

	startTime("RawBase64String.decodeAsBytes")
	const returnedBytes = RawBase64String.decodeAsBytes(base64str)
	stopTime()
}

testBigFile()