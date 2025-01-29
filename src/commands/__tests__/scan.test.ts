import path from 'path'
import { resetScanGlobals, scan } from '../scan'
import * as sd from '../../utils/scan-directories'
import * as ei from '../../utils/extract-imports'
import exp from 'constants'

jest.mock('path')
jest.mock('../../utils/scan-directories')
jest.mock('../../utils/extract-imports')

describe('scan', () => {
	const logSpy = jest.spyOn(console, 'log')

	beforeEach(() => {
		resetScanGlobals()
		jest.clearAllMocks()
	})

	it('should call scanDirectories with the correct arguments', () => {
		const directory = '/path/to/directory'
		const importName = 'react'
		const extension = '.js,.ts'
		const details = false

		const resolvedDirectory = '/resolved/path/to/directory'

		jest.spyOn(path, 'resolve').mockReturnValue(resolvedDirectory)
		scan({ directory, import: importName, extension, details, alpha: false })

		expect(path.resolve).toHaveBeenCalledWith(directory)
		expect(sd.scanDirectories).toHaveBeenCalledWith(
			resolvedDirectory,
			importName,
			['.js', '.ts'],
			expect.any(Function),
		)
	})

	it('should log a warning if no files are found with the import statement', () => {
		const directory = '/path/to/directory'
		const importName = 'react'
		const extension = '.js,.ts'
		const details = false

		jest
			.spyOn(sd, 'scanDirectories')
			.mockImplementation((directoryPath, moduleName, extensions, callback) => {
				callback({ filePath: '/path/to/directory/file1.js' })
			})

		scan({ directory, import: importName, extension, details, alpha: false })

		expect(sd.scanDirectories).toHaveBeenCalled()
		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining(
				`No files found with "${importName}" imports across directory /resolved${directory}.`,
			),
		)
	})

	it('should log the number of files with the import statement and the imports used', () => {
		const directory = '/path/to/directory'
		const importName = 'react'
		const extension = '.js,.ts'
		const details = false

		jest
			.spyOn(sd, 'scanDirectories')
			.mockImplementation((directoryPath, moduleName, extensions, callback) => {
				callback({
					filePath: '/path/to/directory/file1.js',
					fileContent: 'import React from "react";',
				})
				callback({
					filePath: '/path/to/directory/file2.ts',
					fileContent: 'import { useState } from "react";',
				})
			})

		jest
			.spyOn<any, any>(ei, 'extractImports')
			.mockImplementation((filePath, moduleName) => {
				if (filePath === '/path/to/directory/file1.js') {
					return [
						{
							getText: () => 'import React from "react";',
							getDefaultImport: () => null,
							getNamedImports: () => [],
						},
					]
				} else if (filePath === '/path/to/directory/file2.ts') {
					return [
						{
							getText: () => 'import { useState } from "react";',
							getDefaultImport: () => null,
							getNamedImports: () => [{ getText: () => 'useState' }],
						},
					]
				}
				return []
			})

		scan({ directory, import: importName, extension, details, alpha: false })

		expect(sd.scanDirectories).toHaveBeenCalled()
		// expect(logSpy).toHaveBeenCalledWith(
		// 	expect.stringContaining(
		// 		`Found 2 files with "${importName}" imports across directory`,
		// 	),
		// )
		// expect(logSpy).toHaveBeenCalledWith(
		// 	expect.stringContaining('"default": {}'),
		// )
		// expect(logSpy).toHaveBeenCalledWith(
		// 	expect.stringContaining('"named": { "useState": 1 }'),
		// )
	})

	it('should log the details of the imports used if the details option is true', () => {
		const directory = '/path/to/directory'
		const importName = 'react'
		const extension = '.js,.ts'
		const details = true

		jest
			.spyOn(sd, 'scanDirectories')
			.mockImplementation((directoryPath, moduleName, extensions, callback) => {
				callback({
					filePath: '/path/to/directory/file1.js',
					fileContent: 'import React from "react";',
				})
				callback({
					filePath: '/path/to/directory/file2.ts',
					fileContent: 'import { useState } from "react";',
				})
				callback({
					filePath: '/path/to/directory/file3.ts',
					fileContent: 'import { useState } from "react";',
				})
				callback({
					filePath: '/path/to/directory/file4.ts',
					fileContent: 'import { useState } from "react";',
				})
			})

		jest
			.spyOn<any, any>(ei, 'extractImports')
			.mockImplementation((filePath, moduleName) => {
				if (filePath === '/path/to/directory/file1.js') {
					return [
						{
							getText: () => 'import React from "react";',
							getDefaultImport: () => null,
							getNamedImports: () => [],
						},
					]
				} else if (filePath === '/path/to/directory/file2.ts') {
					return [
						{
							getText: () => 'import { useState } from "react";',
							getDefaultImport: () => null,
							getNamedImports: () => [{ getText: () => 'useState' }],
						},
					]
				}
				return []
			})

		scan({ directory, import: importName, extension, details, alpha: false })

		expect(sd.scanDirectories).toHaveBeenCalled()
		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining(
				`Found 4 files with "${importName}" imports across directory`,
			),
		)
		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining('"default": {}'),
		)
	})

	it('should work with multiple lines of import statements', () => {
		const resolvedDirectory =
			'/Users/aminroslan/Projects/Qwerqy/scan-imports/test'
		jest.spyOn(path, 'resolve').mockReturnValue(resolvedDirectory)

		const directory = 'test'
		const importName = './importme.ts'
		const extension = '.tsx,.ts'
		const details = false

		jest
			.spyOn(sd, 'scanDirectories')
			.mockImplementation((dirPath, modName, exts, callback) => {
				callback({
					filePath: `${resolvedDirectory}/file1.ts`,
					fileContent: `import {
						Foo,
						Bar,
						Baz,
						Qux
					} from "./importme.ts";`,
				})
			})

		jest
			.spyOn<any, any>(ei, 'extractImports')
			.mockImplementation((_filePath, _modName) => {
				return [
					{
						getText: () => `import {
							Foo,
							Bar,
							Baz,
							Qux
						} from "./importme.ts";`,
						getDefaultImport: () => null,
						getNamedImports: () => [
							{ getText: () => 'Foo' },
							{ getText: () => 'Bar' },
							{ getText: () => 'Baz' },
							{ getText: () => 'Qux' },
						],
					},
				]
			})

		scan({ directory, import: importName, extension, details, alpha: false })

		expect(sd.scanDirectories).toHaveBeenCalled()
		expect(logSpy.mock.calls[0][0].trim()).toMatchInlineSnapshot(
			`"[32mFound 1 files with "./importme.ts" imports across directory /Users/aminroslan/Projects/Qwerqy/scan-imports/test:[39m"`,
		)
		expect(logSpy.mock.calls[1][0].trim()).toMatchInlineSnapshot(`
"[36m{[39m
[36m  "default": {},[39m
[36m  "named": {[39m
[36m    "Foo": 1,[39m
[36m    "Bar": 1,[39m
[36m    "Baz": 1,[39m
[36m    "Qux": 1[39m
[36m  }[39m
[36m}[39m"
`)
	})
})
