export interface ImportResult {
	[key: string]: string | string[] | boolean | null
	path: string
	statement: string
	hasDefault: boolean
	hasNamed: boolean
	defaultImport: string | null
	namedImports: string[] | null
}

export interface Import {
	[key: string]: number
}

export interface ImportsUsed {
	[key: string]: Import
	default: Import
	named: Import
}
