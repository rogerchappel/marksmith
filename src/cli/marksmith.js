#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { convertInputToMarkdown } from '../converter/html-to-markdown.js';

async function main(argv) {
  const args = parseArgs(argv);
  let input = args.html || '';
  const options = {};

  if (args.file) input = await readFile(args.file, 'utf8');
  if (args.url) {
    input = args.url;
    options.fetchUrl = true;
  }
  if (!input && !process.stdin.isTTY) input = await readStdin();

  if (!input) {
    throw new Error('Provide HTML via stdin, --html, --file, or an explicit --url.');
  }

  const markdown = await convertInputToMarkdown(input, options);
  process.stdout.write(markdown);
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--html') parsed.html = requireValue(argv, ++index, '--html');
    else if (arg === '--file') parsed.file = requireValue(argv, ++index, '--file');
    else if (arg === '--url') parsed.url = requireValue(argv, ++index, '--url');
    else if (arg === '--help' || arg === '-h') {
      process.stdout.write('Usage: marksmith [--html HTML | --file page.html | --url https://example.com]\n');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}

function requireValue(argv, index, flag) {
  if (!argv[index]) throw new Error(`${flag} requires a value.`);
  return argv[index];
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

main(process.argv.slice(2)).catch((error) => {
  process.stderr.write(`marksmith: ${error.message}\n`);
  process.exitCode = 1;
});
