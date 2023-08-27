import extractImports from '../extract-imports'

jest.mock('ts-morph', () => ({
	Project: jest.fn().mockImplementation(() => ({
		addSourceFileAtPath: jest.fn().mockImplementation(() => ({
			getImportDeclarations: jest.fn().mockImplementation(() => [
				{
					getKindName: jest.fn().mockImplementation(() => 'ImportDeclaration'),
					getModuleSpecifierValue: jest
						.fn()
						.mockImplementation(() => 'test-module'),
				},
				{
					getKindName: jest.fn().mockImplementation(() => 'ImportDeclaration'),
					getModuleSpecifierValue: jest
						.fn()
						.mockImplementation(() => 'test-module-2'),
				},
			]),
		})),
	})),
}))

describe('extractImports', () => {
	it('should return an array of ImportDeclaration objects', () => {
		const filePath = '/path/to/file.ts'
		const requestedModuleName = 'test-module'

		const importStatements = extractImports(filePath, requestedModuleName)

		expect(Array.isArray(importStatements)).toBe(true)

		importStatements.forEach(statement => {
			expect(statement.getKindName()).toBe('ImportDeclaration')
		})

		expect(importStatements).toHaveLength(1)
		expect(importStatements[0].getModuleSpecifierValue()).toEqual('test-module')
	})

	it('should return an empty array if no matching imports are found', () => {
		const filePath = '/path/to/file.ts'
		const requestedModuleName = 'non-existent-module'

		const importStatements = extractImports(filePath, requestedModuleName)

		expect(importStatements).toEqual([])
	})
})
