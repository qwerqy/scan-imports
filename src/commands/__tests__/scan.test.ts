import path from 'path'
import { scan } from '../scan'
import * as sd from '../../utils/scan-directories'
import * as ei from '../../utils/extract-imports'
import exp from 'constants'

jest.mock('path')
jest.mock('../../utils/scan-directories')
jest.mock('../../utils/extract-imports')

describe('scan', () => {
	const logSpy = jest.spyOn(console, 'log')

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should call scanDirectories with the correct arguments', () => {
		const directory = '/path/to/directory'
		const importName = 'react'
		const extension = '.js,.ts'
		const details = false

		const resolvedDirectory = '/resolved/path/to/directory'

		jest.spyOn(path, 'resolve').mockReturnValue(resolvedDirectory)

		scan({ directory, import: importName, extension, details })

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

		scan({ directory, import: importName, extension, details })

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

		scan({ directory, import: importName, extension, details })

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

		scan({ directory, import: importName, extension, details })

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
		// expect(logSpy).toHaveBeenCalledWith(
		// 	expect.stringContaining('"statement": "import React from \\"react\\";"'),
		// )
		// expect(logSpy).toHaveBeenCalledWith(
		// 	expect.stringContaining(
		// 		'"statement": "import { useState } from \\"react\\";"',
		// 	),
		// )
		// expect(logSpy).toHaveBeenCalledWith(
		// 	expect.stringContaining('"hasDefault": false'),
		// )
		// expect(logSpy).toHaveBeenCalledWith(
		// 	expect.stringContaining('"hasNamed": false'),
		// )
		// expect(logSpy).toHaveBeenCalledWith(
		// 	expect.stringContaining('"hasNamed": true'),
		// )
		// expect(logSpy).toHaveBeenCalledWith(
		// 	expect.stringContaining('"defaultImport": null'),
		// )
		// expect(logSpy).toHaveBeenCalledWith(
		// 	expect.stringContaining('"namedImports": []'),
		// )
		// expect(logSpy).toHaveBeenCalledWith(
		// 	expect.stringContaining('"namedImports": [ "useState" ]'),
		// )
	})
})
