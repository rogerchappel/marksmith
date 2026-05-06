import test from 'node:test';
import assert from 'node:assert/strict';

import { batchConvertFolder, convertInputToMarkdown, htmlToMarkdown } from '../../src/converter/index.js';

test('public converter API exposes deterministic markdown functions', async () => {
  assert.equal(typeof htmlToMarkdown, 'function');
  assert.equal(typeof convertInputToMarkdown, 'function');
  assert.equal(typeof batchConvertFolder, 'function');

  const markdown = htmlToMarkdown('<html><head><title>API</title></head><body><p>Works <strong>locally</strong>.</p></body></html>');
  assert.match(markdown, /^# API/);
  assert.match(markdown, /Works \*\*locally\*\*\./);

  const withoutTitle = await convertInputToMarkdown('<html><head><title>Hidden</title></head><body><p>Body</p></body></html>', { includeTitle: false });
  assert.doesNotMatch(withoutTitle, /^# Hidden/);
  assert.match(withoutTitle, /Body/);
});
