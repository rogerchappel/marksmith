const BLOCK_TAGS = new Set(['p', 'div', 'section', 'article', 'header', 'footer', 'main', 'aside']);

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function stripTags(value) {
  return decodeEntities(value.replace(/<[^>]+>/g, ' ')).replace(/[ \t]+/g, ' ').trim();
}

function normaliseWhitespace(value) {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function replaceInline(value) {
  return decodeEntities(value)
    .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_, text) => `\`${stripTags(text)}\``)
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, text) => `**${stripTags(text)}**`)
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, text) => `*${stripTags(text)}*`)
    .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => `[${stripTags(text)}](${href.trim()})`)
    .replace(/<br\s*\/?\s*>/gi, '  \n')
    .replace(/<[^>]+>/g, '');
}

function convertLists(value) {
  return value.replace(/<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi, (match, tag, inner) => {
    const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((result, index) => {
      const prefix = tag.toLowerCase() === 'ol' ? `${index + 1}. ` : '- ';
      return `${prefix}${stripTags(replaceInline(result[1]))}`;
    });

    return items.length ? `\n${items.join('\n')}\n` : match;
  });
}

function convertBlocks(value) {
  let markdown = value;

  markdown = markdown.replace(/<pre\b[^>]*><code\b[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, code) => {
    const cleaned = decodeEntities(code).replace(/^\n+|\n+$/g, '');
    return `\n\n\`\`\`\n${cleaned}\n\`\`\`\n\n`;
  });

  markdown = markdown.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, text) => {
    return `\n\n${'#'.repeat(Number(level))} ${stripTags(replaceInline(text))}\n\n`;
  });

  markdown = convertLists(markdown);

  markdown = markdown.replace(/<(p|div|section|article|header|footer|main|aside)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, text) => {
    const inline = stripTags(replaceInline(text));
    return inline ? `\n\n${inline}\n\n` : '\n';
  });

  return markdown;
}

export function htmlToMarkdown(html, options = {}) {
  if (typeof html !== 'string') {
    throw new TypeError('htmlToMarkdown expected a string of HTML');
  }

  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]) : null;

  let markdown = html
    .replace(/<!doctype[^>]*>/gi, '')
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  markdown = convertBlocks(markdown);
  markdown = replaceInline(markdown);
  markdown = decodeEntities(markdown);
  markdown = markdown
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trimEnd())
    .join('\n')
    .replace(/^\s+$/gm, '')
    .replace(/\n{3,}/g, '\n\n');

  markdown = normaliseWhitespace(markdown);

  if (options.includeTitle && title) {
    markdown = `# ${title}\n\n${markdown}`.trim();
  }

  return {
    title,
    markdown,
  };
}
