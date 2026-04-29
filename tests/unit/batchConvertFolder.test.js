import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';

import { batchConvertFolder } from '../../src/converter/batchConvertFolder.js';

const fixtureRoot = path.resolve('tests/fixtures/batch');

test('batchConvertFolder converts fixture folder and preserves nested structure', async () => {
  const outputDir = await mkdtemp(path.join(tmpdir(), 'marksmith-batch-'));
  const result = await batchConvertFolder({
    inputDir: path.join(fixtureRoot, 'input'),
    outputDir,
  });

  assert.equal(result.count, 2);
  assert.deepEqual(
    result.files.map((file) => path.relative(outputDir, file.outputFile)),
    ['alpha.md', path.join('nested', 'beta.md')],
  );

  const alpha = await readFile(path.join(outputDir, 'alpha.md'), 'utf8');
  const beta = await readFile(path.join(outputDir, 'nested', 'beta.md'), 'utf8');
  const expectedAlpha = await readFile(path.join(fixtureRoot, 'expected', 'alpha.md'), 'utf8');
  const expectedBeta = await readFile(path.join(fixtureRoot, 'expected', 'nested', 'beta.md'), 'utf8');

  assert.equal(alpha.trimEnd(), expectedAlpha.trimEnd());
  assert.equal(beta.trimEnd(), expectedBeta.trimEnd());
});

test('batchConvertFolder requires input and output directories', async () => {
  await assert.rejects(() => batchConvertFolder({ inputDir: 'only-input' }), /inputDir and outputDir/);
});
