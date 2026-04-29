import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { htmlToMarkdown } from '../src/converter/html-to-markdown.js';

const fixtures = [
  'minimal',
  'headings',
  'links',
  'ignored-content',
];

for (const fixture of fixtures) {
  test(`converts ${fixture} HTML fixture to expected markdown`, async () => {
    const html = await readFile(new URL(`./fixtures/${fixture}.html`, import.meta.url), 'utf8');
    const expectedMd = await readFile(new URL(`./fixtures/expected/${fixture}.md`, import.meta.url), 'utf8');
    const actualMd = htmlToMarkdown(html);

    assert.equal(actualMd.trimEnd(), expectedMd.trimEnd());
  });
}

test('htmlToMarkdown preserves article.html fixture quality', async () => {
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

test('htmlToMarkdown handles empty HTML gracefully', () => {
  const markdown = htmlToMarkdown('');
  assert.equal(markdown, '');
});

test('htmlToMarkdown handles HTML with only whitespace', () => {
  const markdown = htmlToMarkdown('   \n   \n   ');
  assert.match(markdown, /^\s*$/);
});

test('htmlToMarkdown handles HTML without title', () => {
  const html = '<html><body><p>No title here</p></body></html>';
  const markdown = htmlToMarkdown(html);

  assert.doesNotMatch(markdown, /^#/);
  assert.match(markdown, /No title here/);
});

test('htmlToMarkdown includes source URL when provided', () => {
  const html = '<html><head><title>Test</title></head><body><p>Content</p></body></html>';
  const markdown = htmlToMarkdown(html, { title: 'Test', sourceUrl: 'https://example.com' });

  assert.match(markdown, /^# Test/);
  assert.match(markdown, /Source: https:\/\/example\.com/);
});

test('htmlToMarkdown deduplicates title when appearing in both head and body', () => {
  const html = `
    <html>
      <head><title>Duplicate Title</title></head>
      <body>
        <article>
          <h1>Duplicate Title</h1>
          <p>Content below duplicate heading.</p>
        </article>
      </body>
    </html>
  `;
  const markdown = htmlToMarkdown(html);

  assert.equal(markdown.match(/^# Duplicate Title/gm).length, 1);
  assert.match(markdown, /Content below duplicate heading/);
});

test('htmlToMarkdown handles malformed HTML tags', () => {
  const html = `
    <html>
      <body>
        <p>Unclosed paragraph
        <div>Unclosed div
        <strong>Unclosed strong
        <p>New paragraph after unclosed tags</p>
      </body>
    </html>
  `;
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /Unclosed paragraph/);
  assert.match(markdown, /Unclosed div/);
  assert.match(markdown, /Unclosed strong/);
  assert.match(markdown, /New paragraph after unclosed tags/);
});

test('htmlToMarkdown handles deeply nested structures', () => {
  const html = `
    <html>
      <body>
        <article>
          <div>
            <section>
              <div>
                <p>Deeply <strong>nested <em>content</em></strong> here</p>
              </div>
            </section>
          </div>
        </article>
      </body>
    </html>
  `;
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /Deeply \*\*nested _content_\*\* here/);
});

test('htmlToMarkdown handles special characters and unicode', () => {
  const html = `
    <html>
      <body>
        <article>
          <p>Copyright symbol: &copy; 2024</p>
          <p>Registered: &reg;</p>
          <p>Trademark: &trade;</p>
          <p>Em dash: &mdash;</p>
          <p>En dash: &ndash;</p>
          <p>Ellipsis: &hellip;</p>
          <p>Left quote: &ldquo;</p>
          <p>Right quote: &rdquo;</p>
          <p>Apostrophe: &rsquo;</p>
          <p>Euro: &euro;</p>
          <p>Pound: &pound;</p>
        </article>
      </body>
    </html>
  `;
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /Copyright symbol:/);
  assert.match(markdown, /Trademark:/);
  assert.match(markdown, /Em dash:/);
  assert.match(markdown, /Ellipsis:/);
  assert.match(markdown, /Euro:/);
});

test('htmlToMarkdown handles tables gracefully (basic conversion)', () => {
  const html = `
    <html>
      <body>
        <article>
          <p>Table content:</p>
          <table>
            <tr>
              <td>Cell 1</td>
              <td>Cell 2</td>
            </tr>
            <tr>
              <td>Cell 3</td>
              <td>Cell 4</td>
            </tr>
          </table>
        </article>
      </body>
    </html>
  `;
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /Table content:/);
  assert.match(markdown, /Cell 1/);
  assert.match(markdown, /Cell 2/);
  assert.match(markdown, /Cell 3/);
  assert.match(markdown, /Cell 4/);
});

test('htmlToMarkdown removes comments from content', () => {
  const html = `
    <html>
      <body>
        <article>
          <!-- Main comment -->
          <p>Before comment</p>
          <!-- Another comment -->
          <p>After comment</p>
          <!-- Final comment -->
        </article>
      </body>
    </html>
  `;
  const markdown = htmlToMarkdown(html);

  assert.doesNotMatch(markdown, /Main comment/);
  assert.doesNotMatch(markdown, /Another comment/);
  assert.doesNotMatch(markdown, /Final comment/);
  assert.match(markdown, /Before comment/);
  assert.match(markdown, /After comment/);
});

test('htmlToMarkdown handles multiple paragraphs without extra spacing', () => {
  const html = `
    <html>
      <body>
        <article>
          <p>First paragraph.</p>
          <p>Second paragraph.</p>
          <p>Third paragraph.</p>
        </article>
      </body>
    </html>
  `;
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /First paragraph\./);
  assert.match(markdown, /Second paragraph\./);
  assert.match(markdown, /Third paragraph\./);
  assert.doesNotMatch(markdown, /\n{3,}/);
});

test('htmlToMarkdown handles pre tags with whitespace correctly', () => {
  const html = `
    <html>
      <body>
        <article>
          <pre>
    Indented code
    with spaces
          </pre>
        </article>
      </body>
    </html>
  `;
  const markdown = htmlToMarkdown(html);

  assert.match(markdown, /```/);
  assert.match(markdown, /Indented code/);
});
