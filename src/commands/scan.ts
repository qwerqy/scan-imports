import path from 'path'
import { ImportResult, ImportsUsed } from '../types'
import { logger } from '../utils/logger'
import { scanDirectories } from '../utils/scan-directories'
import extractImports from '../utils/extract-imports'

let importCount = 0
let importResults: ImportResult[] = []
let importsUsed: ImportsUsed = {
	default: {},
	named: {},
}

export async function scan(options: {
	directory: string
	import: string
	extension: string
	details: boolean
	alpha: boolean
}) {
	const directoryPath = path.resolve(options.directory)
	const moduleName = options.import
	const extensions = options.extension.split(',')

	function scanCallback(f: { filePath: string; fileContent?: string }) {
		if (!f.fileContent) return

		importCount++
		const imports = extractImports(f.filePath, moduleName)

		imports.forEach(i => {
			const statement = i.getText()
			const defaultImport = i.getDefaultImport()?.getText() || null
			const namedImports = i.getNamedImports().map(n => n.getText())

			importResults.push({
				path: f.filePath,
				statement,
				hasDefault: !!defaultImport,
				hasNamed: !!namedImports.length,
				defaultImport,
				namedImports,
			})

			if (defaultImport) {
				importsUsed.default[defaultImport] =
					importsUsed.default[defaultImport] + 1 || 1
			}

			if (namedImports.length) {
				namedImports.forEach(n => {
					importsUsed.named[n] = importsUsed.named[n] + 1 || 1
				})
			}
		})
	}

	scanDirectories(directoryPath, moduleName, extensions, scanCallback)

	// Sort importsUsed by alphabet
	if (options.alpha) {
		importsUsed.default = Object.fromEntries(
			Object.entries(importsUsed.default).sort(([a], [b]) =>
				a.localeCompare(b),
			),
		)
		importsUsed.named = Object.fromEntries(
			Object.entries(importsUsed.named).sort(([a], [b]) => a.localeCompare(b)),
		)
	} else {
		// Sort importsUsed by most used
		importsUsed.default = Object.fromEntries(
			Object.entries(importsUsed.default).sort(([, a], [, b]) => b - a),
		)
		importsUsed.named = Object.fromEntries(
			Object.entries(importsUsed.named).sort(([, a], [, b]) => b - a),
		)
	}

	if (importCount === 0) {
		return logger.warn(
			`No files found with "${moduleName}" imports across directory ${directoryPath}.`,
		)
	}

	logger.success(
		`Found ${importCount} files with "${moduleName}" imports across directory ${directoryPath}:`,
	)
	logger.info(JSON.stringify(importsUsed, null, 2))
	if (options.details) {
		logger.info(JSON.stringify(importResults, null, 2))
	}

	return
}
