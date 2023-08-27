import fs from 'fs'
import path from 'path'
import { scanDirectories } from '../scan-directories'
import * as flp from '../file-contains-import'

jest.mock('fs')
jest.mock('path')
jest.mock('../file-contains-import')

describe('scanDirectories', () => {
	afterEach(() => {
		jest.resetAllMocks()
	})

	it('should call the callback function for each file that contains the import statement', () => {
		const directoryPath = '/path/to/directory'
		const importName = 'react'
		const extensions = ['.js', '.ts']
		const callback = jest.fn()

		const files = ['file1.js', 'file2.ts', 'file3.js']
		const fileContents = [
			'import React from "react";',
			'import { useState } from "react";',
			'console.log("Hello, world!");',
		]

		jest.spyOn<any, any>(fs, 'readdirSync').mockReturnValue(files)
		jest.spyOn<any, any>(fs, 'statSync').mockReturnValue({
			isDirectory: () => false,
			isFile: () => true,
		})
		jest
			.spyOn<any, any>(path, 'join')
			.mockImplementation((...args) => args.join('/'))

		jest.spyOn<any, any>(path, 'extname').mockImplementation(filePath => {
			if (filePath === path.join(directoryPath, 'file1.js')) {
				return '.js'
			} else if (filePath === path.join(directoryPath, 'file2.ts')) {
				return '.ts'
			} else if (filePath === path.join(directoryPath, 'file3.js')) {
				return '.js'
			}
			return ''
		})

		jest
			.spyOn<any, any>(flp, 'fileContainsImport')
			.mockImplementation((filePath, importName) => {
				if (filePath === path.join(directoryPath, 'file1.js')) {
					return { filePath, fileContent: 'import React from "react";' }
				} else if (filePath === path.join(directoryPath, 'file2.ts')) {
					return { filePath, fileContent: 'import { useState } from "react";' }
				} else if (filePath === path.join(directoryPath, 'file3.js')) {
					return null
				}
				return null
			})

		scanDirectories(directoryPath, importName, extensions, callback)

		expect(fs.readdirSync).toHaveBeenCalledWith(directoryPath)
		expect(fs.statSync).toHaveBeenCalledTimes(files.length)
		expect(path.extname).toHaveBeenCalledTimes(files.length)
		expect(flp.fileContainsImport).toHaveBeenCalledTimes(files.length)
		expect(callback).toHaveBeenCalledTimes(2)
		expect(callback).toHaveBeenCalledWith({
			filePath: '/path/to/directory/file1.js',
			fileContent: 'import React from "react";',
		})
		expect(callback).toHaveBeenCalledWith({
			filePath: '/path/to/directory/file2.ts',
			fileContent: 'import { useState } from "react";',
		})
	})

	it('should not call the callback function for files that do not contain the import statement', () => {
		const directoryPath = '/path/to/directory'
		const importName = 'react'
		const extensions = ['.js', '.ts']
		const callback = jest.fn()

		const files = ['file1.js', 'file2.ts', 'file3.js']
		const fileContents = [
			'console.log("Hello, world!");',
			'console.log("Hello, world!");',
			'console.log("Hello, world!");',
		]

		jest.spyOn<any, any>(fs, 'readdirSync').mockReturnValue(files)
		jest.spyOn<any, any>(fs, 'statSync').mockReturnValue({
			isDirectory: () => false,
			isFile: () => true,
		})
		jest
			.spyOn<any, any>(path, 'join')
			.mockImplementation((...args) => args.join('/'))

		jest.spyOn<any, any>(path, 'extname').mockImplementation(filePath => {
			if (filePath === path.join(directoryPath, 'file1.js')) {
				return '.js'
			} else if (filePath === path.join(directoryPath, 'file2.ts')) {
				return '.ts'
			} else if (filePath === path.join(directoryPath, 'file3.js')) {
				return '.js'
			}
			return ''
		})

		jest
			.spyOn<any, any>(flp, 'fileContainsImport')
			.mockImplementation((filePath, importName) => {
				if (filePath === path.join(directoryPath, 'file1.js')) {
					return {
						filePath,
					}
				} else if (filePath === path.join(directoryPath, 'file2.ts')) {
					return {
						filePath,
					}
				} else if (filePath === path.join(directoryPath, 'file3.js')) {
					return {
						filePath,
					}
				}
				return {
					filePath,
				}
			})

		scanDirectories(directoryPath, importName, extensions, callback)

		expect(fs.readdirSync).toHaveBeenCalledWith(directoryPath)
		expect(fs.statSync).toHaveBeenCalledTimes(files.length)
		expect(path.extname).toHaveBeenCalledTimes(files.length)
		expect(flp.fileContainsImport).toHaveBeenCalledTimes(files.length)
		expect(callback).toHaveBeenCalledTimes(3)
	})

	it('should recursively scan subdirectories', () => {
		const directoryPath = '/path/to/directory'
		const importName = 'react'
		const extensions = ['.js', '.ts']
		const callback = jest.fn()

		const files = ['file1.js', 'file2.ts', 'subdirectory/file3.js']
		const fileContents = [
			'import React from "react";',
			'import { useState } from "react";',
			'import React from "react";',
		]

		jest.spyOn<any, any>(fs, 'readdirSync').mockImplementation(dirPath => {
			if (dirPath === directoryPath) {
				return ['file1.js', 'file2.ts', 'subdirectory']
			} else if (dirPath === path.join(directoryPath, 'subdirectory')) {
				return ['file3.js']
			}
			return []
		})
		jest.spyOn<any, any>(fs, 'statSync').mockImplementation(filePath => {
			if (filePath === path.join(directoryPath, 'subdirectory')) {
				return { isDirectory: () => true, isFile: () => false }
			}
			return { isDirectory: () => false, isFile: () => true }
		})
		jest
			.spyOn<any, any>(path, 'join')
			.mockImplementation((...args) => args.join('/'))
		jest.spyOn<any, any>(path, 'extname').mockImplementation(filePath => {
			if (filePath === path.join(directoryPath, 'file1.js')) {
				return '.js'
			} else if (filePath === path.join(directoryPath, 'file2.ts')) {
				return '.ts'
			} else if (filePath === path.join(directoryPath, 'file3.js')) {
				return '.js'
			}
			return ''
		})
		jest
			.spyOn<any, any>(flp, 'fileContainsImport')
			.mockImplementation((filePath, importName) => {
				if (filePath === path.join(directoryPath, 'file1.js')) {
					return { filePath, fileContent: 'import React from "react";' }
				} else if (filePath === path.join(directoryPath, 'file2.ts')) {
					return { filePath, fileContent: 'import { useState } from "react";' }
				} else if (filePath === path.join(directoryPath, 'file3.js')) {
					return null
				}
				return null
			})

		scanDirectories(directoryPath, importName, extensions, callback)

		expect(fs.readdirSync).toHaveBeenCalledTimes(2)
		expect(fs.statSync).toHaveBeenCalledTimes(4)
		expect(path.extname).toHaveBeenCalledTimes(3)
		expect(flp.fileContainsImport).toHaveBeenCalledTimes(2)
		expect(callback).toHaveBeenCalledTimes(2)
		expect(callback).toHaveBeenCalledWith({
			filePath: '/path/to/directory/file1.js',
			fileContent: 'import React from "react";',
		})
		expect(callback).toHaveBeenCalledWith({
			filePath: '/path/to/directory/file2.ts',
			fileContent: 'import { useState } from "react";',
		})
	})
})
