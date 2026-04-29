#!/usr/bin/env node
import path from 'node:path';

import { batchConvertFolder } from '../converter/batchConvertFolder.js';

function printHelp() {
  console.log(`marksmith

Usage:
  node src/cli/index.js batch --input <folder> --output <folder> [--no-title]

Commands:
  batch    Convert every .html/.htm file in a folder to Markdown.
`);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = { command };

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    switch (token) {
      case '--input':
      case '-i':
        options.inputDir = rest[index + 1];
        index += 1;
        break;
      case '--output':
      case '-o':
        options.outputDir = rest[index + 1];
        index += 1;
        break;
      case '--no-title':
        options.includeTitle = false;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }

  return options;
}

export async function run(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);

  if (options.help || !options.command) {
    printHelp();
    return 0;
  }

  if (options.command !== 'batch') {
    throw new Error(`Unknown command: ${options.command}`);
  }

  if (!options.inputDir || !options.outputDir) {
    throw new Error('batch requires --input and --output');
  }

  const result = await batchConvertFolder({
    inputDir: path.resolve(options.inputDir),
    outputDir: path.resolve(options.outputDir),
    includeTitle: options.includeTitle !== false,
  });

  console.log(`Converted ${result.count} HTML file${result.count === 1 ? '' : 's'} to Markdown.`);
  for (const file of result.files) {
    console.log(`${path.relative(process.cwd(), file.inputFile)} -> ${path.relative(process.cwd(), file.outputFile)}`);
  }

  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
