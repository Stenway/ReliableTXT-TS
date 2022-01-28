/* (C) Stefan John / Stenway / ReliableTXT.com / 2022 */

import { ReliableTxtDocument } from "./reliabletxt.js"

// ----------------------------------------------------------------------

export abstract class ReliableTxtDownload {
	static getDownloadUrl(document: ReliableTxtDocument): string {
		let bytes: Uint8Array = document.getBytes()
		let blob: Blob = new Blob([bytes], { type: 'text/plain' })
		return URL.createObjectURL(blob)
	}
	
	static download(rtxtDocument: ReliableTxtDocument, fileName: string) {
		const url = ReliableTxtDownload.getDownloadUrl(rtxtDocument)
		let element = document.createElement('a')
		element.href = url
		element.download = fileName
		element.style.display = 'none'
		document.body.appendChild(element)
		element.click()
		document.body.removeChild(element)
	}
}