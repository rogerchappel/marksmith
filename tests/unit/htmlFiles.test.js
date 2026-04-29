import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';

import { collectHtmlFiles, toOutputPath } from '../../src/parser/htmlFiles.js';

test('collectHtmlFiles finds html files recursively in stable order', async () => {
  const rootDir = await mkdtemp(path.join(tmpdir(), 'marksmith-parser-'));
  await mkdir(path.join(rootDir, 'nested'), { recursive: true });
  await writeFile(path.join(rootDir, 'b.html'), '<p>b</p>');
  await writeFile(path.join(rootDir, 'a.txt'), 'skip');
  await writeFile(path.join(rootDir, 'nested', 'a.htm'), '<p>a</p>');

  const files = await collectHtmlFiles(rootDir);

  assert.deepEqual(files, [
    path.join(rootDir, 'b.html'),
    path.join(rootDir, 'nested', 'a.htm'),
  ]);
});

test('toOutputPath mirrors relative structure and swaps extension', () => {
  const outputPath = toOutputPath('/input', '/output', '/input/nested/page.html');
  assert.equal(outputPath, path.join('/output', 'nested', 'page.md'));
});
