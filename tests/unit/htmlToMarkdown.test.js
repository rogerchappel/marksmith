import test from 'node:test';
import assert from 'node:assert/strict';
import { htmlToMarkdown, convertInputToMarkdown } from '../../src/converter/html-to-markdown.js';

test('convertInputToMarkdown handles text input', async () => {
  const markdown = await convertInputToMarkdown('Plain text content');
  assert.equal(markdown, 'Plain text content\n');
});

test('convertInputToMarkdown handles HTML input', async () => {
  const html = '<html><head><title>Test</title></head><body><p>Content</p></body></html>';
  const markdown = await convertInputToMarkdown(html);

  assert.match(markdown, /^# Test/);
  assert.match(markdown, /Content/);
});

test('convertInputToMarkdown trims trailing whitespace', async () => {
  const markdown = await convertInputToMarkdown('Text with spaces   ');
  assert.match(markdown, /Text with spaces\n$/);
});

test('convertInputToMarkdown throws error for URL without fetchUrl flag', async () => {
  await assert.rejects(
    () => convertInputToMarkdown('https://example.com'),
    /requires explicit fetchUrl: true/
  );
});

test('htmlToMarkdown throws TypeError for non-string input', () => {
  assert.throws(() => htmlToMarkdown(null), /expected a string/);
  assert.throws(() => htmlToMarkdown(undefined), /expected a string/);
  assert.throws(() => htmlToMarkdown(42), /expected a string/);
  assert.throws(() => htmlToMarkdown({}), /expected a string/);
});

test('htmlToMarkdown handles inline formatting combinations', () => {
  const html = '<p><strong>Bold <em>and italic</em> text</strong></p>';
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /\*\*Bold _and italic_ text\*\*/);
});

test('htmlToMarkdown preserves link text formatting', () => {
  const html = '<p>Visit <a href="https://example.com"><strong>Example</strong></a> site</p>';
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /\[\*\*Example\*\*\]\(https:\/\/example\.com\)/);
});

test('htmlToMarkdown handles empty list items', () => {
  const html = `
    <ul>
      <li>Item 1</li>
      <li></li>
      <li>Item 3</li>
    </ul>
  `;
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /- Item 1/);
  assert.match(markdown, /- Item 3/);
});

test('htmlToMarkdown handles list items with complex content', () => {
  const html = `
    <ul>
      <li>Item with <strong>bold</strong> and <a href="https://example.com">link</a></li>
      <li>Item with <code>code</code> inside</li>
      <li><em>Italic</em> first item</li>
    </ul>
  `;
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /- Item with \*\*bold\*\* and \[link\]\(https:\/\/example\.com\)/);
  assert.match(markdown, /- Item with `code` inside/);
  assert.match(markdown, /- _Italic_ first item/);
});

test('htmlToMarkdown handles consecutive headings', () => {
  const html = `
    <article>
      <h1>First</h1>
      <h2>Second</h2>
      <h3>Third</h3>
    </article>
  `;
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /^# First/);
  assert.match(markdown, /^## Second/m);
  assert.match(markdown, /^###[ ]Third/m);
});

test('htmlToMarkdown handles br tags within paragraphs', () => {
  const html = '<p>Line 1<br/>Line 2<br>Line 3</p>';
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /Line 1\nLine 2\nLine 3/);
});

test('htmlToMarkdown trims excessive blank lines', () => {
  const html = `
    <p>Paragraph 1</p>

    <p>Paragraph 2</p>


    <p>Paragraph 3</p>
  `;
  const markdown = htmlToMarkdown(html);

  assert.doesNotMatch(markdown, /\n{3,}/);
});

test('htmlToMarkdown preserves code fence backticks in content', () => {
  const html = '<p>Use <code>console.log(`template`)</code> for output</p>';
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /Use `console.log/);
});

test('htmlToMarkdown handles anchor links', () => {
  const html = '<p>See <a href="#section">section below</a></p>';
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /\[section below\]\(#section\)/);
});

test('htmlToMarkdown handles email links', () => {
  const html = '<p>Contact <a href="mailto:test@example.com">us</a></p>';
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /\[us\]\(mailto:test@example\.com\)/);
});

test('htmlToMarkdown handles telephone links', () => {
  const html = '<p>Call <a href="tel:+1234567890">phone</a></p>';
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /\[phone\]\(tel:\+1234567890\)/);
});

test('htmlToMarkdown handles empty links', () => {
  const html = '<p>Visit <a href="https://example.com"></a></p>';
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /\[\]\(https:\/\/example\.com\)/);
});

test('htmlToMarkdown handles empty inline elements', () => {
  const html = '<p>Text with <strong></strong> empty bold</p>';
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /Text with \*\*\*\* empty bold/);
});

test('htmlToMarkdown normalizes whitespace in paragraphs', () => {
  const html = '<p>  Multiple   spaces    and\n\t tabs  </p>';
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /Multiple spaces/);
  assert.doesNotMatch(markdown, /  /);
});

test('htmlToMarkdown handles HTML with only script/style', () => {
  const html = `
    <html>
      <head><style>.test { color: red; }</style></head>
      <body>
        <script>console.log('ignored');</script>
        <style>.another { display: none; }</style>
      </body>
    </html>
  `;
  const markdown = htmlToMarkdown(html);

  assert.doesNotMatch(markdown, /test/);
  assert.doesNotMatch(markdown, /console/);
});

test('htmlToMarkdown handles mixed case tags', () => {
  const html = '<HTML><BODY><P><STRONG>BOLD</STRONG></P></BODY></HTML>';
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /\*\*BOLD\*\*/);
});

test('htmlToMarkdown handles attributes in tags', () => {
  const html = '<p class="intro" data-test="value">Paragraph with attributes</p>';
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /Paragraph with attributes/);
});

test('htmlToMarkdown preserves markdown-safe characters', () => {
  const html = '<p>Dash-hyphen, asterisk*, underscore_, at@symbol</p>';
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /Dash-hyphen/);
  assert.match(markdown, /asterisk\*/);
  assert.match(markdown, /underscore_/);
  assert.match(markdown, /at@symbol/);
});

test('htmlToMarkdown handles very long paragraph', () => {
  const longText = 'word '.repeat(200);
  const html = `<p>${longText}.</p>`;
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /word word word/);
  assert.equal(markdown.trim().length, longText.length + 1);
});

test('htmlToMarkdown handles non-breaking spaces', () => {
  const html = '<p>Before&nbsp;after</p>';
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /Before after/);
});
