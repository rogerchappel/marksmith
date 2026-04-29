import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, mkdir, readFile } from 'node:fs/promises';
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
    [
      'alpha.md',
      path.join('nested', 'beta.md'),
    ],
  );

  const alpha = await readFile(path.join(outputDir, 'alpha.md'), 'utf8');
  const beta = await readFile(path.join(outputDir, 'nested', 'beta.md'), 'utf8');
  const expectedAlpha = await readFile(path.join(fixtureRoot, 'expected', 'alpha.md'), 'utf8');
  const expectedBeta = await readFile(path.join(fixtureRoot, 'expected', 'nested', 'beta.md'), 'utf8');

  assert.equal(alpha.trimEnd(), expectedAlpha.trimEnd());
  assert.equal(beta.trimEnd(), expectedBeta.trimEnd());
});

test('batchConvertFolder converts edge case fixtures', async () => {
  const outputDir = await mkdtemp(path.join(tmpdir(), 'marksmith-batch-edge-'));
  const result = await batchConvertFolder({
    inputDir: path.join(fixtureRoot, 'edge-input'),
    outputDir,
  });

  assert.equal(result.count, 3);

  const files = result.files.map((f) => path.basename(f.outputFile)).sort();
  assert.deepEqual(files, ['empty.md', 'minimal-tags.md', 'no-title.md']);

  for (const file of result.files) {
    const expectedPath = path.join(fixtureRoot, 'edge-expected', path.basename(file.outputFile));
    const actual = await readFile(file.outputFile, 'utf8');
    const expected = await readFile(expectedPath, 'utf8');
    assert.equal(actual.trimEnd(), expected.trimEnd(), `Mismatch in ${path.basename(file.outputFile)}`);
  }
});

test('batchConvertFolder returns correct metadata for each file', async () => {
  const outputDir = await mkdtemp(path.join(tmpdir(), 'marksmith-batch-meta-'));
  const result = await batchConvertFolder({
    inputDir: path.join(fixtureRoot, 'input'),
    outputDir,
  });

  assert.ok(result.inputDir);
  assert.ok(result.outputDir);
  assert.equal(result.files.length, 2);

  for (const file of result.files) {
    assert.ok(file.inputFile);
    assert.ok(file.outputFile);
    assert.ok(typeof file.markdown === 'string');
    assert.ok(typeof file.title === 'string' || file.title === null);
  }
});

test('batchConvertFolder handles includeTitle option', async () => {
  const outputDir = await mkdtemp(path.join(tmpdir(), 'marksmith-batch-notitle-'));
  const result = await batchConvertFolder({
    inputDir: path.join(fixtureRoot, 'input'),
    outputDir,
    includeTitle: false,
  });

  assert.equal(result.count, 2);

  const alpha = await readFile(path.join(outputDir, 'alpha.md'), 'utf8');
  assert.doesNotMatch(alpha, /^# Alpha Doc\n/);
});

test('batchConvertFolder handles empty directory', async () => {
  const inputDir = await mkdtemp(path.join(tmpdir(), 'marksmith-empty-input-'));
  const outputDir = await mkdtemp(path.join(tmpdir(), 'marksmith-empty-output-'));

  const result = await batchConvertFolder({ inputDir, outputDir });

  assert.equal(result.count, 0);
  assert.deepEqual(result.files, []);
});

test('batchConvertFolder requires input and output directories', async () => {
  await assert.rejects(() => batchConvertFolder({ inputDir: 'only-input' }), /inputDir and outputDir/);
  await assert.rejects(() => batchConvertFolder({ outputDir: 'only-output' }), /inputDir and outputDir/);
  await assert.rejects(() => batchConvertFolder({}), /inputDir and outputDir/);
});

test('batchConvertFolder throws when input directory does not exist', async () => {
  await assert.rejects(
    () => batchConvertFolder({ inputDir: '/nonexistent/path', outputDir: '/tmp/output' }),
    /Input directory not found/
  );
});

test('batchConvertFolder preserves file structure with deep nesting', async () => {
  const inputDir = await mkdtemp(path.join(tmpdir(), 'marksmith-deep-input-'));
  const outputDir = await mkdtemp(path.join(tmpdir(), 'marksmith-deep-output-'));

  const nestedDir = path.join(inputDir, 'level1', 'level2', 'level3');
  await mkdir(nestedDir, { recursive: true });

  const { writeFile } = await import('node:fs/promises');
  await writeFile(path.join(nestedDir, 'deep.html'), '<html><body><p>Deep file</p></body></html>');

  const result = await batchConvertFolder({ inputDir, outputDir });

  assert.equal(result.count, 1);
  assert.match(result.files[0].outputFile, /level1\/level2\/level3\/deep\.md$/);
});
