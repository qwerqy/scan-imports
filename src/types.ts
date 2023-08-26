export interface ImportResult {
	[key: string]: string | string[] | boolean | null
	path: string
	statement: string
	hasDefault: boolean
	hasNamed: boolean
	defaultName: string | null
	namedNames: string[] | null
}
