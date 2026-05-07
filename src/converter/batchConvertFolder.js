import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { htmlToMarkdown } from './html-to-markdown.js';
import { extractHtmlMetadata } from '../parser/html.js';
import { collectHtmlFiles, toOutputPath } from '../parser/htmlFiles.js';

export async function batchConvertFolder({ inputDir, outputDir, includeTitle = true } = {}) {
  if (!inputDir || !outputDir) {
    throw new Error('batchConvertFolder requires inputDir and outputDir');
  }

  const sourceFiles = await collectHtmlFiles(inputDir);
  const results = [];

  for (const sourceFile of sourceFiles) {
    const html = await readFile(sourceFile, 'utf8');
    const metadata = extractHtmlMetadata(html);
    const markdown = htmlToMarkdown(html, { ...metadata, includeTitle });
    const destinationFile = toOutputPath(inputDir, outputDir, sourceFile);

    await mkdir(path.dirname(destinationFile), { recursive: true });
    await writeFile(destinationFile, markdown.endsWith('\n') ? markdown : `${markdown}\n`, 'utf8');

    results.push({
      inputFile: sourceFile,
      outputFile: destinationFile,
      title: metadata.title || null,
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
