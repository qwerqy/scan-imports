import { init, parse } from 'es-module-lexer'
import path from 'path'
import { ImportResult } from '../types'
import { getDefaultImports } from '../utils/get-default-imports'
import { getNamedImports } from '../utils/get-named-imports'
import { logger } from '../utils/logger'
import { scanDirectories } from '../utils/scan-directories'

let importCount = 0
let importResults: ImportResult[] = []

export async function scan(options: {
	directory: string
	import: string
	extension: string
}) {
	await init

	const directoryPath = path.resolve(options.directory)
	const importName = options.import
	const extensions = options.extension.split(',')

	function scanCallback(f: { filePath: string; fileContent?: string }) {
		if (!f.fileContent) return

		importCount++
		const [imports] = parse(f.fileContent)

		imports
			.filter(i => i.n === importName)
			.forEach(i => {
				const statement = f.fileContent!.slice(i.ss, i.se)

				const { defaultName, hasDefault } = getDefaultImports(statement)
				const { namedNames, hasNamed } = getNamedImports(statement)

				importResults.push({
					path: f.filePath,
					statement: f.fileContent!.slice(i.ss, i.se),
					hasDefault,
					hasNamed,
					defaultName,
					namedNames,
				})
			})
	}

	scanDirectories(directoryPath, importName, extensions, scanCallback)

	if (importCount === 0) {
		return logger.warn(`No files found with "${importName}" imports.`)
	}

	logger.success(`Found ${importCount} files with "${importName}" imports:`)
	logger.info(JSON.stringify(importResults, null, 2))

	return
}
