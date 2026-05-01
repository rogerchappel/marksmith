# marksmith

marksmith is a local-first HTML to Markdown converter. It is designed for deterministic conversion of pasted HTML and folders of `.html`/`.htm` files without cloud services, credentials, telemetry, or hidden network calls.

## Status

This repository is early-stage. Confirm the current support, release, and security posture before using it in production.

## Install

Requirements:

- Node.js 20 or newer
- npm, pnpm, yarn, or bun

Install from a checkout:

```sh
git clone https://github.com/rogerchappel/marksmith.git
cd marksmith
npm install
```

There are currently no runtime npm dependencies. `npm install` is still useful to prepare the package manager environment and future dependency metadata.

## Quickstart

### Convert one HTML string in JavaScript

```js
import { htmlToMarkdown } from './src/converter/index.js';

const { markdown, title } = htmlToMarkdown(`
  <!doctype html>
  <html>
    <head><title>Example Article</title></head>
    <body>
      <h1>Hello</h1>
      <p>A <strong>local</strong> conversion with <a href="/docs">links</a>.</p>
    </body>
  </html>
`, { includeTitle: true });

console.log(title);    // Example Article
console.log(markdown); // Markdown output
```

### Convert a folder of HTML files

```sh
node src/cli/index.js batch --input ./html --output ./markdown
```

The batch command:

- Finds `.html` and `.htm` files recursively under the input folder
- Preserves nested folder structure in the output folder
- Writes `.md` files with converted Markdown
- Includes the document `<title>` as a top-level heading by default

Disable generated title headings with:

```sh
node src/cli/index.js batch --input ./html --output ./markdown --no-title
```

### Parse pasted HTML or explicit URLs programmatically

The parser distinguishes pasted HTML, plain text, and explicit `http(s)` URLs. URL input is identified without fetching unless you opt in:

```js
import { parseInput } from './src/parser/html.js';

const pending = await parseInput('https://example.com/article');
console.log(pending); // { kind: 'url', url: 'https://example.com/article', needsFetch: true }

const fetched = await parseInput('https://example.com/article', { fetchUrl: true });
console.log(fetched.kind); // html
```

Use `fetchUrl: true` only when the URL was intentionally provided by the user.

## CLI reference

```sh
node src/cli/index.js --help
node src/cli/index.js batch --input <folder> --output <folder> [--no-title]
```

## Safety and local-first behavior

marksmith is built to keep conversion local by default:

- Pasted HTML and local batch conversion do not perform network requests.
- URL fetching only happens when an explicit `http://` or `https://` URL is provided and the caller opts in with `fetchUrl: true`.
- There are no cloud, LLM, analytics, telemetry, or credential-collection features in the current implementation.
- The converter does not require API keys, tokens, browser cookies, or account credentials.
- Scripts and styles are ignored during conversion; generated Markdown is plain text output based on the supported HTML elements.

As with any converter, review generated Markdown before publishing it. Remote pages may contain untrusted content, tracking URLs, or links you do not want to keep.

## Verify

Run the local validation script before opening a pull request:

```sh
bash scripts/validate.sh
```

The validation script checks required repository files and runs available package scripts, including the Node test suite:

```sh
npm test
```

You can also run the tests directly:

```sh
node --test
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations. Changes should be small, reviewable, and verified before review.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance.

## License

MIT
