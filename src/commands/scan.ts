import path from 'path'
import { Import, ImportResult, ImportsUsed } from '../types'
import { logger } from '../utils/logger'
import { scanDirectories } from '../utils/scan-directories'
import extractImports from '../utils/extract-imports'
import { appendFileSync } from 'fs'

let importCount = 0
let importResults: ImportResult[] = []
let importsUsed: ImportsUsed = {
	default: {},
	named: {},
}
let importsCount: Import = {}

export async function scan(options: {
	directory: string
	import: string
	extension: string
	details: boolean
	alpha: boolean
	format?: string
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

				importsCount[defaultImport] = importsCount[defaultImport] + 1 || 1
			}

			if (namedImports.length) {
				namedImports.forEach(n => {
					importsUsed.named[n] = importsUsed.named[n] + 1 || 1
				})

				namedImports.forEach(n => {
					importsCount[n] = importsCount[n] + 1 || 1
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

		importsCount = Object.fromEntries(
			Object.entries(importsCount).sort(([, a], [, b]) => b - a),
		)
	}

	if (importCount === 0) {
		return logger.warn(
			`No files found with "${moduleName}" imports across directory ${directoryPath}.`,
		)
	}

	const now = new Date().toISOString()
	const fileName = `${now}-import-results`
	const heads = 'name, usage\n'

	logger.success(
		`Found ${importCount} files with "${moduleName}" imports across directory ${directoryPath}:`,
	)

	if (options.format) {
		logger.success(
			`Outputting ${importResults.length} results to ${fileName}.${options.format}`,
		)
		try {
			appendFileSync(
				`${fileName}.${options.format}`,
				options.format === 'json'
					? JSON.stringify(
							!options.details ? importsCount : importResults,
							null,
							2,
					  )
					: heads +
							Object.entries(importsCount)
								.map(([name, usage]) => `${name}, ${usage}`)
								.join('\n'),
			)
		} catch (err) {
			logger.error(`Error converting file: ${err}`)
		}
	} else {
		logger.info(JSON.stringify(importsUsed, null, 2))
		if (options.details) {
			logger.info(JSON.stringify(importResults, null, 2))
		}
	}

	return
}
