#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { batchConvertFolder, convertInputToMarkdown } from '../converter/index.js';

function printHelp() {
  console.log(`marksmith

Usage:
  node src/cli/index.js convert [--input <file>] [--output <file>] [--no-title]
  node src/cli/index.js batch --input <folder> --output <folder> [--no-title]

Commands:
  convert  Convert one local HTML document from a file or stdin to Markdown.
  batch    Convert every .html/.htm file in a folder to Markdown.

Local-first behavior:
  convert and batch never fetch URLs. Passing a URL string fails unless a caller
  uses the JavaScript API with explicit fetchUrl: true.
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
        options.inputPath = rest[index + 1];
        options.inputDir = rest[index + 1];
        index += 1;
        break;
      case '--output':
      case '-o':
        options.outputPath = rest[index + 1];
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

async function readStdin() {
  process.stdin.setEncoding('utf8');
  let input = '';

  for await (const chunk of process.stdin) {
    input += chunk;
  }

  return input;
}

async function runConvert(options) {
  const input = options.inputPath
    ? await readFile(path.resolve(options.inputPath), 'utf8')
    : await readStdin();

  const markdown = await convertInputToMarkdown(input, {
    includeTitle: options.includeTitle !== false,
  });

  if (options.outputPath) {
    await writeFile(path.resolve(options.outputPath), markdown, 'utf8');
  } else {
    process.stdout.write(markdown);
  }

  return 0;
}

async function runBatch(options) {
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

export async function run(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);

  if (options.help || !options.command) {
    printHelp();
    return 0;
  }

  if (options.command === 'convert') {
    return runConvert(options);
  }

  if (options.command === 'batch') {
    return runBatch(options);
  }

  throw new Error(`Unknown command: ${options.command}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
