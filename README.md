# Import Scanner 🕵️‍♀️

The **Import Scanner** is a Node.js package designed to extract and analyze
import statements from TypeScript and TypeScript JSX files. It provides a simple
and efficient way to scan your codebase for import declarations, making it
useful for various code analysis and refactoring tasks.

## Installation

`scan-imports` does not require you to install locally to your node modules.
Just run

```bash
npx scan-imports@latest scan -d <directory> -i <importModule> -ext <fileExtension>
```

## Usage

| Argument                | Description                                                                                                             | Default Value | Required |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------- | -------- |
| `-d` or `--directory`   | The directory to scan for import statements.                                                                            | -             | Yes      |
| `-i` or `--import`      | The import module to search for.                                                                                        | -             | Yes      |
| `-ext` or `--extension` | The file extension to scan for. Separate by commas for multiple extensions                                              | `.ts`         | No       |
| `-det` or `--details`   | Whether to show details of the import statements.                                                                       | `false`       | No       |
| `-a` or `--alpha`       | By default results are **sorted by count**. But if you want it to sort alphabetically, add a `--alpha` flag statements. | `false`       | No       |
| `-f` or `--format`      | The format of the output. Currently only supports `json` and `csv`. Using this flag will automatically export to a file | -             | No       |

## Example

If I run this command in the root directory of this project:

```bash
npx scan-imports@latest scan -d src -i fs -ext .tsx,.ts
```

I will get the following output:

```bash
Found 2 files with "fs" imports across directory /Users/aminroslan/Projects/scan-imports/src:
{
  "default": {
    "fs": 2
  },
  "named": {}
}

```

I can see that there are 2 files that import `fs` from the `src` directory.

If I need more information about each import statement, I can add the `-det` or
`--details` flag to the command:

```bash
scan -d src -i fs -ext .tsx,.ts -det
```

This will give me the following output:

```bash
Found 2 files with "fs" imports across directory /Users/aminroslan/Projects/scan-imports/src:
{
  "default": {
    "fs": 2
  },
  "named": {}
}
[
  {
    "path": "/Users/aminroslan/Projects/scan-imports/src/utils/file-contains-import.ts",
    "statement": "import fs from 'fs'",
    "hasDefault": true,
    "hasNamed": false,
    "defaultImport": "fs",
    "namedImports": []
  },
  {
    "path": "/Users/aminroslan/Projects/scan-imports/src/utils/scan-directories.ts",
    "statement": "import fs from 'fs'",
    "hasDefault": true,
    "hasNamed": false,
    "defaultImport": "fs",
    "namedImports": []
  }
]
```

Now, I can see that both files import the default export from `fs`.

### Exporting to a file

If `-f` or `--format` is specified, the output will be exported to a file. The
output will look like this:

#### CSV

```csv
name, usage
fs, 4
appendFileSync, 1
```

#### JSON

```json
{
	"fs": 4,
	"appendFileSync": 1
}
```

You can set `-det` or `--details` to `true` to get more details about the import
statements, but the output will only be in JSON format.

## Development

To execute the script locally, run:

```bash
# Install dependencies
yarn

# Run dev script to compile TypeScript and watch for changes
yarn dev

# Execute the script
node dist/index.js scan -d src -i fs -ext .tsx,.ts
```

## Contributing

If you have any ideas for improvements or find any bugs, please feel free to
open an issue or submit a pull request. 😀

## License

This project is licensed under the MIT License - see the
[LICENSE.md](LICENSE.md) file for details.

## Todo

TBD.
