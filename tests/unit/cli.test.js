import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, mkdir, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';

import { run } from '../../src/cli/index.js';

const fixtureInput = path.resolve('tests/fixtures/batch/input');

test('cli batch command writes markdown files', async () => {
  const outputDir = await mkdtemp(path.join(tmpdir(), 'marksmith-cli-'));
  const logs = [];
  const originalLog = console.log;
  console.log = (...args) => logs.push(args.join(' '));

  try {
    const exitCode = await run(['batch', '--input', fixtureInput, '--output', outputDir]);
    assert.equal(exitCode, 0);
  } finally {
    console.log = originalLog;
  }

  const rootEntries = await readdir(outputDir);
  assert.deepEqual(rootEntries.sort(), ['alpha.md', 'nested']);
  assert.match(logs[0], /Converted 2 HTML files to Markdown\./);
});

test('cli batch command with --no-title flag', async () => {
  const outputDir = await mkdtemp(path.join(tmpdir(), 'marksmith-cli-notitle-'));
  const logs = [];
  const originalLog = console.log;
  console.log = (...args) => logs.push(args.join(' '));

  try {
    const exitCode = await run(['batch', '--input', fixtureInput, '--output', outputDir, '--no-title']);
    assert.equal(exitCode, 0);
  } finally {
    console.log = originalLog;
  }

  const { readFile } = await import('node:fs/promises');
  const alpha = await readFile(path.join(outputDir, 'alpha.md'), 'utf8');
  assert.doesNotMatch(alpha, /^# Alpha Doc\n/);
});

test('cli batch command shows help', async () => {
  const logs = [];
  const originalLog = console.log;
  console.log = (...args) => logs.push(args.join(' '));

  try {
    const exitCode = await run(['batch', '--help']);
    assert.equal(exitCode, 0);
  } finally {
    console.log = originalLog;
  }

  assert.match(logs.join('\n'), /Usage:/);
  assert.match(logs.join('\n'), /batch/);
});

test('cli batch command with short flags', async () => {
  const outputDir = await mkdtemp(path.join(tmpdir(), 'marksmith-cli-short-'));
  const logs = [];
  const originalLog = console.log;
  console.log = (...args) => logs.push(args.join(' '));

  try {
    const exitCode = await run(['batch', '-i', fixtureInput, '-o', outputDir]);
    assert.equal(exitCode, 0);
  } finally {
    console.log = originalLog;
  }

  const rootEntries = await readdir(outputDir);
  assert.deepEqual(rootEntries.sort(), ['alpha.md', 'nested']);
});

test('cli throws error for unknown command', async () => {
  await assert.rejects(() => run(['unknown']), /Unknown command/);
});

test('cli throws error for missing arguments', async () => {
  await assert.rejects(() => run(['batch']), /batch requires/);
  await assert.rejects(() => run(['batch', '--input', fixtureInput]), /batch requires/);
  await assert.rejects(() => run(['batch', '--output', 'some-output']), /batch requires/);
});

test('cli throws error for unknown flags', async () => {
  await assert.rejects(() => run(['batch', '--input', fixtureInput, '--output', '/tmp', '--unknown']), /Unknown argument/);
});

test('cli batch converts empty input directory', async () => {
  const inputDir = await mkdtemp(path.join(tmpdir(), 'marksmith-cli-empty-'));
  const outputDir = await mkdtemp(path.join(tmpdir(), 'marksmith-cli-output-'));
  const logs = [];
  const originalLog = console.log;
  console.log = (...args) => logs.push(args.join(' '));

  try {
    const exitCode = await run(['batch', '--input', inputDir, '--output', outputDir]);
    assert.equal(exitCode, 0);
  } finally {
    console.log = originalLog;
  }

  assert.match(logs[0], /Converted 0 HTML files? to Markdown\./);
});

test('cli batch handles nested directory structure', async () => {
  const inputDir = await mkdtemp(path.join(tmpdir(), 'marksmith-cli-nested-'));
  const outputDir = await mkdtemp(path.join(tmpdir(), 'marksmith-cli-nested-out-'));

  const nestedDir = path.join(inputDir, 'a', 'b', 'c');
  await mkdir(nestedDir, { recursive: true });
  await writeFile(path.join(nestedDir, 'nested.html'), '<html><body><p>Nested</p></body></html>');

  const logs = [];
  const originalLog = console.log;
  console.log = (...args) => logs.push(args.join(' '));

  try {
    const exitCode = await run(['batch', '--input', inputDir, '--output', outputDir]);
    assert.equal(exitCode, 0);
  } finally {
    console.log = originalLog;
  }

  const entries = await readdir(path.join(outputDir, 'a', 'b', 'c'));
  assert.equal(entries[0], 'nested.md');
});
