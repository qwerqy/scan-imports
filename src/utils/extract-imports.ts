import { ImportDeclaration, Project } from 'ts-morph'

function extractImports(
	filePath: string,
	requestedModuleName: string,
): ImportDeclaration[] {
	const project = new Project()
	const sourceFile = project.addSourceFileAtPath(filePath)

	const importStatements: ImportDeclaration[] = []

	const importNodes = sourceFile.getImportDeclarations()

	importNodes
		.filter(node => {
			const moduleName = node.getModuleSpecifierValue()
			return moduleName === requestedModuleName
		})
		.forEach(node => {
			importStatements.push(node)
		})

	return importStatements
}

export default extractImports
