import test from 'node:test';
import assert from 'node:assert/strict';
import { parseInput, looksLikeHtml, extractHtmlMetadata, decodeHtml } from '../../src/parser/html.js';

test('looksLikeHtml detects valid HTML markup', () => {
  assert.equal(looksLikeHtml('<!doctype html><html></html>'), true);
  assert.equal(looksLikeHtml('<HTML></HTML>'), true);
  assert.equal(looksLikeHtml('<html><body>content</body></html>'), true);
  assert.equal(looksLikeHtml('<body>content</body>'), true);
  assert.equal(looksLikeHtml('<article>content</article>'), true);
  assert.equal(looksLikeHtml('<main><p>text</p></main>'), true);
  assert.equal(looksLikeHtml('<p>paragraph</p>'), true);
  assert.equal(looksLikeHtml('<h1>heading</h1>'), true);
  assert.equal(looksLikeHtml('<h2>heading 2</h2>'), true);
  assert.equal(looksLikeHtml('<H3>uppercase heading</H3>'), true);
  assert.equal(looksLikeHtml('<div>not html enough</div>'), false);
  assert.equal(looksLikeHtml('just plain text'), false);
  assert.equal(looksLikeHtml(''), false);
  assert.equal(looksLikeHtml(null), false);
  assert.equal(looksLikeHtml(undefined), false);
  assert.equal(looksLikeHtml(42), false);
});

test('decodeHtml handles named entities', () => {
  assert.equal(decodeHtml('&amp;'), '&');
  assert.equal(decodeHtml('&lt;'), '<');
  assert.equal(decodeHtml('&gt;'), '>');
  assert.equal(decodeHtml('&quot;'), '"');
  assert.equal(decodeHtml('&apos;'), "'");
  assert.equal(decodeHtml('&nbsp;'), ' ');
});

test('decodeHtml handles numeric entities', () => {
  assert.equal(decodeHtml('&#38;'), '&');
  assert.equal(decodeHtml('&#60;'), '<');
  assert.equal(decodeHtml('&#62;'), '>');
  assert.equal(decodeHtml('&#34;'), '"');
});

test('decodeHtml handles hex entities', () => {
  assert.equal(decodeHtml('&#x26;'), '&');
  assert.equal(decodeHtml('&#x3C;'), '<');
  assert.equal(decodeHtml('&#x3E;'), '>');
  assert.equal(decodeHtml('&#x22;'), '"');
});

test('decodeHtml handles unicode entities', () => {
  assert.equal(decodeHtml('&#x2014;'), '—');
  assert.equal(decodeHtml('&#8212;'), '—');
  assert.equal(decodeHtml('&#x00A9;'), '©');
});

test('decodeHtml preserves unknown entities', () => {
  assert.equal(decodeHtml('&unknown;'), '&unknown;');
  assert.equal(decodeHtml('&nbsp'), '&nbsp');
});

test('decodeHtml handles empty and nullish inputs', () => {
  assert.equal(decodeHtml(''), '');
  assert.equal(decodeHtml(null), '');
  assert.equal(decodeHtml(undefined), '');
});

test('decodeHtml handles complex encoded strings', () => {
  assert.equal(decodeHtml('Clean &amp; Useful'), 'Clean & Useful');
  assert.equal(decodeHtml('5 &lt; 10 &amp;&amp; 10 &gt; 5'), '5 < 10 && 10 > 5');
  assert.equal(decodeHtml('&quot;hello&quot; &amp; &apos;world&apos;'), '"hello" & \'world\'');
});

test('extractHtmlMetadata extracts title from <title> tag', () => {
  const html = '<html><head><title>Page Title</title></head><body></body></html>';
  const metadata = extractHtmlMetadata(html);
  assert.equal(metadata.title, 'Page Title');
});

test('extractHtmlMetadata falls back to <h1> when no <title>', () => {
  const html = '<html><body><h1>Fallback Title</h1></body></html>';
  const metadata = extractHtmlMetadata(html);
  assert.equal(metadata.title, 'Fallback Title');
});

test('extractHtmlMetadata returns empty title when neither <title> nor <h1> exists', () => {
  const html = '<html><body><p>Just text</p></body></html>';
  const metadata = extractHtmlMetadata(html);
  assert.equal(metadata.title, '');
});

test('extractHtmlMetadata decodes HTML entities in title', () => {
  const html = '<html><head><title>Title &amp; Subtitle</title></head></html>';
  const metadata = extractHtmlMetadata(html);
  assert.equal(metadata.title, 'Title & Subtitle');
});

test('extractHtmlMetadata strips tags from title', () => {
  const html = '<html><head><title>Title <strong>Bold</strong> Text</title></head></html>';
  const metadata = extractHtmlMetadata(html);
  assert.equal(metadata.title, 'Title Bold Text');
});

test('extractHtmlMetadata trims whitespace from title', () => {
  const html = '<html><head><title>  Spaced Title  </title></head></html>';
  const metadata = extractHtmlMetadata(html);
  assert.equal(metadata.title, 'Spaced Title');
});

test('extractHtmlMetadata includes source metadata', () => {
  const html = '<html><head><title>Test</title></head></html>';
  const metadata = extractHtmlMetadata(html, { url: 'https://example.com', contentType: 'text/html' });
  assert.equal(metadata.sourceUrl, 'https://example.com');
  assert.equal(metadata.contentType, 'text/html');
});

test('parseInput identifies plain text', async () => {
  const parsed = await parseInput('Just plain text without HTML');
  assert.equal(parsed.kind, 'text');
  assert.equal(parsed.text, 'Just plain text without HTML');
  assert.equal(parsed.metadata.title, '');
});

test('parseInput identifies HTML markup', async () => {
  const html = '<html><head><title>Test</title></head><body><p>Content</p></body></html>';
  const parsed = await parseInput(html);
  assert.equal(parsed.kind, 'html');
  assert.equal(parsed.html, html);
  assert.equal(parsed.metadata.title, 'Test');
});

test('parseInput identifies URL without fetching', async () => {
  const parsed = await parseInput('https://example.com/page');
  assert.equal(parsed.kind, 'url');
  assert.equal(parsed.url, 'https://example.com/page');
  assert.equal(parsed.needsFetch, true);
});

test('parseInput trims input whitespace', async () => {
  const parsed = await parseInput('  <html><body>content</body></html>  ');
  assert.equal(parsed.kind, 'html');
});

test('parseInput rejects empty input', async () => {
  await assert.rejects(() => parseInput(''), /non-empty string/);
  await assert.rejects(() => parseInput('   '), /non-empty string/);
});

test('parseInput rejects non-string input', async () => {
  await assert.rejects(() => parseInput(null), /non-empty string/);
  await assert.rejects(() => parseInput(undefined), /non-empty string/);
  await assert.rejects(() => parseInput(42), /non-empty string/);
  await assert.rejects(() => parseInput({}), /non-empty string/);
});

test('parseInput handles mixed case HTML tags', async () => {
  const html = '<HTML><HEAD><TITLE>Test</TITLE></HEAD><BODY><P>Content</P></BODY></HTML>';
  const parsed = await parseInput(html);
  assert.equal(parsed.kind, 'html');
  assert.equal(parsed.metadata.title, 'Test');
});

test('parseInput handles HTML with extra whitespace', async () => {
  const html = `
    <!doctype html>
    <html>
      <head>
        <title>Formatted</title>
      </head>
      <body>
        <p>Content</p>
      </body>
    </html>
  `;
  const parsed = await parseInput(html);
  assert.equal(parsed.kind, 'html');
  assert.equal(parsed.metadata.title, 'Formatted');
});
