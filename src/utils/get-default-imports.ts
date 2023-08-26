const defaultImportRegex =
	/import\s+(\w+)\s*(?:,|\s*,\s*{[^}]*})?\s*from\s*['"][^'"]+['"]/g

export function getDefaultImports(statement: string) {
	const defaultMatch = defaultImportRegex.exec(statement)
	const defaultName = defaultMatch ? defaultMatch[1] : null

	return {
		defaultName,
		hasDefault: !!defaultMatch,
	}
}
