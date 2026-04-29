import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const HTML_EXTENSIONS = new Set(['.html', '.htm']);

export async function collectHtmlFiles(inputDir) {
  if (!inputDir) {
    throw new Error('collectHtmlFiles requires an input directory');
  }

  const inputStats = await stat(inputDir).catch(() => null);
  if (!inputStats?.isDirectory()) {
    throw new Error(`Input directory not found: ${inputDir}`);
  }

  const files = [];

  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      if (entry.isFile() && HTML_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        files.push(fullPath);
      }
    }
  }

  await walk(inputDir);

  return files;
}

export function toOutputPath(inputDir, outputDir, inputFile) {
  const relativePath = path.relative(inputDir, inputFile);
  const parsedPath = path.parse(relativePath);
  return path.join(outputDir, parsedPath.dir, `${parsedPath.name}.md`);
}
