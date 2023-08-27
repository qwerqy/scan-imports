import { fileContainsImport } from '../file-contains-import'
import fs from 'fs'

describe('fileContainsImport', () => {
	beforeEach(() => {
		jest.mock('fs', () => ({
			readFileSync: jest.fn(),
		}))
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	it('should return true if the file contains an import statement', () => {
		jest.spyOn(fs, 'readFileSync').mockReturnValue('import React from "react";')

		const result = fileContainsImport('/path', 'react')

		expect(result).toEqual({
			filePath: '/path',
			fileContent: 'import React from "react";',
		})
	})

	it('should return false if the file does not contain an import statement', () => {
		jest
			.spyOn(fs, 'readFileSync')
			.mockReturnValue('console.log("Hello world!");')

		const result = fileContainsImport('/path', 'react')

		expect(result).toEqual({
			filePath: '/path',
		})
	})
})
