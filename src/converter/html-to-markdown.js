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

  output = output.replace(/<pre\b[^>]*>\s*<code\b[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi, (_, code) => `\n\n\`\`\`\n${decodeHtml(stripTags(code)).trimEnd()}\n\`\`\`\n\n`);
  output = output.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) => `\n\n\`\`\`\n${decodeHtml(stripTags(code)).trimEnd()}\n\`\`\`\n\n`);
  output = output.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, text) => `\n\n${'#'.repeat(Number(level))} ${inlineMarkdown(text).trim()}\n\n`);
  output = output.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_, text) => `\n\n${inlineMarkdown(text).trim()}\n\n`);
  output = output.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, text) => `\n\n${inlineMarkdown(text).trim().split('\n').map((line) => `> ${line}`).join('\n')}\n\n`);
  output = convertLists(output, 'ul');
  output = convertLists(output, 'ol');
  output = output.replace(/<br\s*\/?>/gi, '\n');
  output = output.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');
  output = output.replace(/<\/div>|<\/section>|<\/article>|<\/main>|<\/header>|<\/footer>|<\/nav>/gi, '\n\n');
  output = output.replace(/<\/?[a-z][^>]*>/gi, ' ');

  return decodeHtml(output)
    .split('\n')
    .map((line) => line.replace(/[ \t]{2,}/g, ' ').trimEnd())
    .join('\n');
}

function convertLists(html, tag) {
  const bullet = tag === 'ol' ? '1.' : '-';
  return html.replace(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi'), (_, list) => {
    const items = [...list.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((match) => `${bullet} ${inlineMarkdown(match[1]).trim()}`);
    return `\n\n${items.join('\n')}\n\n`;
  });
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
