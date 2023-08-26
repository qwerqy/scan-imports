#! /usr/bin/env node

import { Command } from 'commander'
import { scan } from './commands/scan'

const program = new Command()

program
	.command('scan')
	.description('Scan for .tsx files with given imports')
	.requiredOption('-d, --directory <path>', 'Directory to start the search')
	.requiredOption('-i, --import <name>', 'Import name to search for')
	.option(
		'-ext, --extension <ext>',
		'File extension(s) to search for. If multiple extensions, separate by comma.',
		'.ts',
	)
	.option(
		'-det, --details',
		'Show details of each import found. Default: false',
		false,
	)
	.action(scan)

program.parse(process.argv)
