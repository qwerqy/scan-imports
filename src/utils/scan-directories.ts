import fs from 'fs'
import path from 'path'
import { fileContainsImport } from './file-contains-import'

export function scanDirectories(
	directoryPath: string,
	importName: string,
	extensions: string[],
	callback: (f: { filePath: string; fileContent?: string }) => void,
): void {
	const files = fs.readdirSync(directoryPath)

	for (const file of files) {
		const filePath = path.join(directoryPath, file)
		const stats = fs.statSync(filePath)

		if (stats.isDirectory()) {
			scanDirectories(filePath, importName, extensions, callback)
		} else if (stats.isFile() && extensions.includes(path.extname(filePath))) {
			const f = fileContainsImport(filePath, importName)
			if (f) {
				callback({
					filePath: f.filePath,
					fileContent: f.fileContent,
				})
			}
		}
	}
}
