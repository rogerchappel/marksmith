import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, readdir } from 'node:fs/promises';
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
