import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { htmlToMarkdown, convertInputToMarkdown } from '../src/converter/html-to-markdown.js';
import { parseInput } from '../src/parser/html.js';
import { fetchUrlInput, isHttpUrl } from '../src/parser/url.js';

test('detects explicit http(s) URLs without fetching by default', async () => {
  const parsed = await parseInput('https://example.com/article');

  assert.deepEqual(parsed, {
    kind: 'url',
    url: 'https://example.com/article',
    needsFetch: true
  });
});

test('fetchUrlInput uses injected fetch implementation for explicit URL fetching', async () => {
  const calls = [];
  const result = await fetchUrlInput('https://example.com/page', {
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return {
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'text/html; charset=utf-8']]),
        text: async () => '<html><head><title>Remote</title></head><body><p>Hello</p></body></html>'
      };
    }
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://example.com/page');
  assert.equal(calls[0].init.method, 'GET');
  assert.equal(result.kind, 'url');
  assert.equal(result.contentType, 'text/html; charset=utf-8');
  assert.match(result.html, /Hello/);
});

test('parses fetched URL HTML only when fetchUrl is explicit', async () => {
  const parsed = await parseInput('https://example.com/page', {
    fetchUrl: true,
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'text/html']]),
      text: async () => '<html><head><title>Fetched Title</title></head><body><p>Fetched body</p></body></html>'
    })
  });

  assert.equal(parsed.kind, 'html');
  assert.equal(parsed.metadata.title, 'Fetched Title');
  assert.equal(parsed.metadata.sourceUrl, 'https://example.com/page');
});

test('converts fixture HTML to clean markdown with title, links, lists, code, and no scripts', async () => {
  const html = await readFile(new URL('./fixtures/article.html', import.meta.url), 'utf8');
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /^# Clean & Useful/);
  assert.equal(markdown.match(/^# Clean & Useful/gm).length, 1);
  assert.match(markdown, /\*\*local-first\*\*/);
  assert.match(markdown, /\[docs\]\(https:\/\/example.com\/docs\)/);
  assert.match(markdown, /- Links survive/);
  assert.match(markdown, /```\nconst ok = true;\nconsole\.log\(ok\);\n```/);
  assert.doesNotMatch(markdown, /tracker|display: none/);
});

test('convertInputToMarkdown refuses URL network access unless explicitly opted in', async () => {
  await assert.rejects(
    () => convertInputToMarkdown('https://example.com/page'),
    /requires explicit fetchUrl: true/
  );
});

test('isHttpUrl rejects non-network and malformed inputs', () => {
  assert.equal(isHttpUrl('https://example.com'), true);
  assert.equal(isHttpUrl('http://example.com'), true);
  assert.equal(isHttpUrl('file:///tmp/page.html'), false);
  assert.equal(isHttpUrl('<p>not a url</p>'), false);
});
