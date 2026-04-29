import { fetchUrlInput, isHttpUrl } from './url.js';

export function looksLikeHtml(input) {
  return typeof input === 'string' && /<!doctype\s+html|<html[\s>]|<body[\s>]|<article[\s>]|<main[\s>]|<p[\s>]|<h[1-6][\s>]/i.test(input);
}

export function extractHtmlMetadata(html, source = {}) {
  const normalized = String(html || '');
  const title = firstMatch(normalized, /<title[^>]*>([\s\S]*?)<\/title>/i)
    || firstMatch(normalized, /<h1[^>]*>([\s\S]*?)<\/h1>/i)
    || '';

  return {
    title: decodeHtml(stripTags(title)).trim(),
    sourceUrl: source.url || null,
    contentType: source.contentType || null
  };
}

export async function parseInput(input, options = {}) {
  if (typeof input !== 'string' || input.trim() === '') {
    throw new TypeError('Input must be a non-empty string containing HTML or an explicit URL.');
  }

  const trimmed = input.trim();

  if (isHttpUrl(trimmed)) {
    if (options.fetchUrl !== true) {
      return { kind: 'url', url: trimmed, needsFetch: true };
    }

    const fetched = await fetchUrlInput(trimmed, options);
    return {
      kind: 'html',
      html: fetched.html,
      metadata: extractHtmlMetadata(fetched.html, fetched)
    };
  }

  if (!looksLikeHtml(input)) {
    return {
      kind: 'text',
      text: input,
      metadata: { title: '', sourceUrl: null, contentType: null }
    };
  }

  return {
    kind: 'html',
    html: input,
    metadata: extractHtmlMetadata(input)
  };
}

export function decodeHtml(value) {
  const named = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' '
  };

  return String(value || '').replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]+);/gi, (entity, body) => {
    const lower = body.toLowerCase();
    if (lower[0] === '#') {
      const codePoint = lower[1] === 'x'
        ? Number.parseInt(lower.slice(2), 16)
        : Number.parseInt(lower.slice(1), 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : entity;
    }

    return Object.hasOwn(named, lower) ? named[lower] : entity;
  });
}

function firstMatch(value, regex) {
  const match = value.match(regex);
  return match ? match[1] : null;
}

function stripTags(value) {
  return String(value || '').replace(/<\/?[a-z][^>]*>/gi, ' ').replace(/[ \t]{2,}/g, ' ');
}
