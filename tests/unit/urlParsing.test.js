import test from 'node:test';
import assert from 'node:assert/strict';
import { isHttpUrl, assertHttpUrl, fetchUrlInput } from '../../src/parser/url.js';

test('isHttpUrl accepts valid http URLs', () => {
  assert.equal(isHttpUrl('http://example.com'), true);
  assert.equal(isHttpUrl('http://localhost:3000'), true);
  assert.equal(isHttpUrl('http://192.168.1.1'), true);
});

test('isHttpUrl accepts valid https URLs', () => {
  assert.equal(isHttpUrl('https://example.com'), true);
  assert.equal(isHttpUrl('https://example.com/path'), true);
  assert.equal(isHttpUrl('https://example.com/path?query=value'), true);
  assert.equal(isHttpUrl('https://sub.example.com/page#section'), true);
});

test('isHttpUrl rejects non-http protocols', () => {
  assert.equal(isHttpUrl('ftp://example.com'), false);
  assert.equal(isHttpUrl('file:///path/to/file'), false);
  assert.equal(isHttpUrl('data:text/plain,hello'), false);
  assert.equal(isHttpUrl('mailto:test@example.com'), false);
  assert.equal(isHttpUrl('tel:+1234567890'), false);
});

test('isHttpUrl rejects invalid URLs', () => {
  assert.equal(isHttpUrl('not a url'), false);
  assert.equal(isHttpUrl(''), false);
  assert.equal(isHttpUrl('ht tp://broken.com'), false);
  assert.equal(isHttpUrl('//example.com'), false);
});

test('isHttpUrl rejects non-string inputs', () => {
  assert.equal(isHttpUrl(null), false);
  assert.equal(isHttpUrl(undefined), false);
  assert.equal(isHttpUrl(123), false);
  assert.equal(isHttpUrl({}), false);
  assert.equal(isHttpUrl([]), false);
});

test('isHttpUrl trims whitespace', () => {
  assert.equal(isHttpUrl('  https://example.com  '), true);
});

test('assertHttpUrl returns URL object for valid http(s) URLs', () => {
  const url = assertHttpUrl('https://example.com/path');
  assert.ok(url instanceof URL);
  assert.equal(url.href, 'https://example.com/path');
});

test('assertHttpUrl throws for invalid URLs', () => {
  assert.throws(() => assertHttpUrl('ftp://example.com'), /Expected an explicit http\(s\) URL/);
  assert.throws(() => assertHttpUrl('not a url'), /Expected an explicit http\(s\) URL/);
  assert.throws(() => assertHttpUrl(''), /Expected an explicit http\(s\) URL/);
});

test('fetchUrlInput uses custom fetch implementation', async () => {
  let fetchCalled = false;
  const result = await fetchUrlInput('https://example.com', {
    fetchImpl: async (url, options) => {
      fetchCalled = true;
      assert.equal(url, 'https://example.com/');
      assert.equal(options.method, 'GET');
      return {
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'text/html']]),
        text: async () => '<html><body>Test</body></html>'
      };
    }
  });

  assert.equal(fetchCalled, true);
  assert.equal(result.kind, 'url');
  assert.equal(result.url, 'https://example.com/');
  assert.equal(result.contentType, 'text/html');
  assert.equal(result.html, '<html><body>Test</body></html>');
});

test('fetchUrlInput handles redirect', async () => {
  const result = await fetchUrlInput('https://example.com', {
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'text/html; charset=utf-8']]),
      text: async () => '<html>Redirected content</html>'
    })
  });

  assert.equal(result.html, '<html>Redirected content</html>');
});

test('fetchUrlInput throws on non-200 response', async () => {
  await assert.rejects(
    () => fetchUrlInput('https://example.com', {
      fetchImpl: async () => ({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Not found'
      })
    }),
    /Failed to fetch URL/
  );
});

test('fetchUrlInput throws on network failure', async () => {
  await assert.rejects(
    () => fetchUrlInput('https://example.com', {
      fetchImpl: async () => null
    }),
    /Failed to fetch URL/
  );
});

test('fetchUrlInput requires fetch implementation', async () => {
  await assert.rejects(
    () => fetchUrlInput('https://example.com', {
      fetchImpl: null
    }),
    /requires a fetch implementation/
  );

  await assert.rejects(
    () => fetchUrlInput('https://example.com', {
      fetchImpl: 'not a function'
    }),
    /requires a fetch implementation/
  );
});

test('fetchUrlInput uses default timeout', async () => {
  const result = await fetchUrlInput('https://example.com', {
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'text/html']]),
      text: async () => '<html>Timeout test</html>'
    }),
    timeoutMs: 5000
  });

  assert.equal(result.html, '<html>Timeout test</html>');
});

test('fetchUrlInput sends custom headers', async () => {
  let capturedOptions = null;
  await fetchUrlInput('https://example.com', {
    fetchImpl: async (url, options) => {
      capturedOptions = options;
      return {
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'text/html']]),
        text: async () => '<html>Headers test</html>'
      };
    },
    headers: { 'user-agent': 'custom-agent/1.0' }
  });

  assert.equal(capturedOptions.headers['user-agent'], 'custom-agent/1.0');
});

test('fetchUrlInput aborts on timeout', async () => {
  const fetchImpl = async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'text/html']]),
      text: async () => '<html>Slow response</html>'
    };
  };

  await assert.rejects(
    () => fetchUrlInput('https://example.com', {
      fetchImpl,
      timeoutMs: 10
    }),
    /aborted|Failed to fetch/
  );
});

test('fetchUrlInput handles empty content-type', async () => {
  const result = await fetchUrlInput('https://example.com', {
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: new Map(),
      text: async () => '<html>No content type</html>'
    })
  });

  assert.equal(result.contentType, '');
});

test('fetchUrlInput normalizes URL', async () => {
  const result = await fetchUrlInput('https://EXAMPLE.com/path', {
    fetchImpl: async (url) => ({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'text/html']]),
      text: async () => '<html>Normalized</html>'
    })
  });

  assert.equal(result.url, 'https://example.com/path');
});
