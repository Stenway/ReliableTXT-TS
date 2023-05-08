/* eslint-disable no-console */

import { Base64String } from "../src/reliabletxt.js"

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
	startTime("Base64String.rawFromBytes")
	const base64str = Base64String.rawFromBytes(bytes)
	stopTime()

	startTime("Base64String.rawToBytes")
	const returnedBytes = Base64String.rawToBytes(base64str)
	stopTime()

	console.log(base64str === Base64String.fromBytes(returnedBytes))
}

testBigFile()