import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { htmlToMarkdown } from './htmlToMarkdown.js';
import { collectHtmlFiles, toOutputPath } from '../parser/htmlFiles.js';

export async function batchConvertFolder({ inputDir, outputDir, includeTitle = true } = {}) {
  if (!inputDir || !outputDir) {
    throw new Error('batchConvertFolder requires inputDir and outputDir');
  }

  const sourceFiles = await collectHtmlFiles(inputDir);
  const results = [];

  for (const sourceFile of sourceFiles) {
    const html = await readFile(sourceFile, 'utf8');
    const { markdown, title } = htmlToMarkdown(html, { includeTitle });
    const destinationFile = toOutputPath(inputDir, outputDir, sourceFile);

    await mkdir(path.dirname(destinationFile), { recursive: true });
    await writeFile(destinationFile, `${markdown}\n`, 'utf8');

    results.push({
      inputFile: sourceFile,
      outputFile: destinationFile,
      title,
      markdown,
    });
  }

  return {
    inputDir,
    outputDir,
    count: results.length,
    files: results,
  };
}
