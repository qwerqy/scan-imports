const namedImportRegex = /import\s*{([\w\s,\n]+)}\s*from\s*['"][^'"]+['"]/g

export function getNamedImports(statement: string) {
	const namedMatch = namedImportRegex.exec(statement)

	const namedExportsContent = namedMatch ? namedMatch[1] : null
	const namedNames =
		namedExportsContent?.split(',').map(exportName => exportName.trim()) || []

	return {
		namedNames,
		hasNamed: !!namedMatch,
	}
}
