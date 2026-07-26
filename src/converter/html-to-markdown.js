import { decodeHtml, extractHtmlMetadata, parseInput } from '../parser/html.js';

export async function convertInputToMarkdown(input, options = {}) {
  const parsed = await parseInput(input, options);

  if (parsed.kind === 'url' && parsed.needsFetch) {
    throw new Error('URL input requires explicit fetchUrl: true.');
  }

  if (parsed.kind === 'text') {
    return parsed.text.trimEnd() + '\n';
  }

  return htmlToMarkdown(parsed.html, {
    ...parsed.metadata,
    includeTitle: options.includeTitle !== false,
  });
}

export function htmlToMarkdown(html, metadata = extractHtmlMetadata(html)) {
  if (typeof html !== 'string') {
    throw new TypeError('htmlToMarkdown expected a string of HTML');
  }

  if (html.trim() === '') {
    return '';
  }

  const prepared = removeIgnoredContent(html);
  const body = extractMainContent(prepared);
  const title = metadata?.title || extractHtmlMetadata(html).title;
  const markdown = removeDuplicateTitleHeading(convertBlockHtml(body), title)
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();

  const parts = [];

  if (metadata?.includeTitle !== false && title) parts.push(`# ${escapeMarkdown(title)}`);
  if (metadata?.sourceUrl) parts.push(`Source: ${metadata.sourceUrl}`);
  if (markdown) parts.push(markdown);

  return `${parts.join('\n\n').trim()}\n`;
}

function removeIgnoredContent(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '');
}

function extractMainContent(html) {
  for (const tag of ['article', 'main', 'body']) {
    const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    if (match) return match[1];
  }

  return html;
}

function convertBlockHtml(html) {
  let output = html;

  output = output.replace(/<pre\b[^>]*>\s*<code\b[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi, (_, code) => formatCodeBlock(code));
  output = output.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) => formatCodeBlock(code));
  output = output.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, text) => `\n\n${'#'.repeat(Number(level))} ${inlineMarkdown(text).trim()}\n\n`);
  output = output.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_, text) => `\n\n${inlineMarkdown(text).trim()}\n\n`);
  output = output.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, text) => `\n\n${inlineMarkdown(text).trim().split('\n').map((line) => `> ${line}`).join('\n')}\n\n`);
  output = convertLists(output);
  output = output.replace(/<br\s*\/?>/gi, '\n');
  output = output.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');
  output = output.replace(/<\/div>|<\/section>|<\/article>|<\/main>|<\/header>|<\/footer>|<\/nav>/gi, '\n\n');
  output = output.replace(/<\/?[a-z][^>]*>/gi, ' ');

  return decodeHtml(output)
    .split('\n')
    .map((line) => line.replace(/(\S)[ \t]{2,}/g, '$1 ').trimEnd())
    .join('\n');
}

function formatCodeBlock(html) {
  const code = decodeHtml(stripTags(html)).trimEnd();
  const longestRun = Math.max(0, ...[...code.matchAll(/`+/g)].map((match) => match[0].length));
  const fence = '`'.repeat(Math.max(3, longestRun + 1));
  return `\n\n${fence}\n${code}\n${fence}\n\n`;
}

function convertLists(html) {
  let output = html;
  let opening = findNextList(output);

  while (opening) {
    const closing = findListEnd(output, opening.index);
    if (!closing) break;

    const listHtml = output.slice(opening.index, closing);
    const rendered = renderList(listHtml, opening.tag, '');
    output = `${output.slice(0, opening.index)}\n\n${rendered}\n\n${output.slice(closing)}`;
    opening = findNextList(output, opening.index + rendered.length + 4);
  }

  return output;
}

function renderList(listHtml, tag, indent) {
  const inner = listHtml
    .replace(new RegExp(`^<${tag}\\b[^>]*>`, 'i'), '')
    .replace(new RegExp(`</${tag}>$`, 'i'), '');
  const bullet = tag === 'ol' ? '1.' : '-';
  const childIndent = `${indent}${tag === 'ol' ? '   ' : '  '}`;

  return extractListItems(inner).map((item) => {
    const nested = [];
    let textHtml = item;
    let opening = findNextList(textHtml);

    while (opening) {
      const closing = findListEnd(textHtml, opening.index);
      if (!closing) break;

      const nestedHtml = textHtml.slice(opening.index, closing);
      nested.push(renderList(nestedHtml, opening.tag, childIndent));
      textHtml = `${textHtml.slice(0, opening.index)} ${textHtml.slice(closing)}`;
      opening = findNextList(textHtml, opening.index);
    }

    const text = inlineMarkdown(textHtml).trim();
    const line = `${indent}${bullet}${text ? ` ${text}` : ''}`;
    return [line, ...nested].join('\n');
  }).join('\n');
}

function extractListItems(html) {
  const items = [];
  const tags = /<\/?li\b[^>]*>/gi;
  let depth = 0;
  let start = -1;
  let match;

  while ((match = tags.exec(html))) {
    const closing = /^<\//.test(match[0]);
    if (!closing) {
      if (depth === 0) start = tags.lastIndex;
      depth += 1;
    } else if (depth > 0) {
      depth -= 1;
      if (depth === 0) items.push(html.slice(start, match.index));
    }
  }

  return items;
}

function findNextList(html, fromIndex = 0) {
  const match = /<(ul|ol)\b[^>]*>/gi;
  match.lastIndex = fromIndex;
  const opening = match.exec(html);
  return opening ? { index: opening.index, tag: opening[1].toLowerCase() } : null;
}

function findListEnd(html, startIndex) {
  const tags = /<\/?(ul|ol)\b[^>]*>/gi;
  tags.lastIndex = startIndex;
  let depth = 0;
  let match;

  while ((match = tags.exec(html))) {
    depth += /^<\//.test(match[0]) ? -1 : 1;
    if (depth === 0) return tags.lastIndex;
  }

  return null;
}

function inlineMarkdown(html) {
  return decodeHtml(String(html || '')
    .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => `[${inlineMarkdown(text).trim()}](${decodeHtml(href).trim()})`)
    .replace(/<strong\b[^>]*>([\s\S]*?)<\/strong>|<b\b[^>]*>([\s\S]*?)<\/b>/gi, (_, strong, bold) => `**${inlineMarkdown(strong || bold).trim()}**`)
    .replace(/<em\b[^>]*>([\s\S]*?)<\/em>|<i\b[^>]*>([\s\S]*?)<\/i>/gi, (_, em, italic) => `_${inlineMarkdown(em || italic).trim()}_`)
    .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_, code) => `\`${decodeHtml(stripTags(code)).trim()}\``)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' '))
    .replace(/[ \t]{2,}/g, ' ');
}

function stripTags(value) {
  return String(value || '').replace(/<\/?[a-z][^>]*>/gi, ' ');
}

function removeDuplicateTitleHeading(markdown, title) {
  if (!title) return markdown;

  const escapedTitle = escapeRegExp(escapeMarkdown(title));
  return markdown.replace(new RegExp(`^\\s*# ${escapedTitle}\\s*(?:\\n|$)`, 'i'), '');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeMarkdown(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/`/g, '\\`');
}
