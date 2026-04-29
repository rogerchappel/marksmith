const DEFAULT_TIMEOUT_MS = 10_000;

export function isHttpUrl(value) {
  if (typeof value !== 'string') return false;

  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function assertHttpUrl(value) {
  if (!isHttpUrl(value)) {
    throw new TypeError('Expected an explicit http(s) URL.');
  }

  return new URL(value.trim());
}

export async function fetchUrlInput(url, options = {}) {
  const parsed = assertHttpUrl(url);
  const {
    fetchImpl = globalThis.fetch,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers = { 'user-agent': 'marksmith/0.1 local markdown converter' }
  } = options;

  if (typeof fetchImpl !== 'function') {
    throw new TypeError('fetchUrlInput requires a fetch implementation.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await Promise.race([
      fetchImpl(parsed.href, {
        method: 'GET',
        redirect: 'follow',
        headers,
        signal: controller.signal
      }),
      new Promise((_, reject) => {
        controller.signal.addEventListener('abort', () => reject(new Error('Fetch aborted by timeout')), { once: true });
      })
    ]);

    if (!response || !response.ok) {
      const status = response ? `${response.status} ${response.statusText || ''}`.trim() : 'no response';
      throw new Error(`Failed to fetch URL: ${status}`);
    }

    const contentType = typeof response.headers?.get === 'function'
      ? response.headers.get('content-type') || ''
      : '';
    const html = await response.text();

    return {
      kind: 'url',
      url: parsed.href,
      contentType,
      html
    };
  } finally {
    clearTimeout(timeout);
  }
}
