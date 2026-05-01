# marksmith

`marksmith` is a planned local-first converter for turning messy web pages,
pasted HTML, and source documents into clean Markdown packs.

The target audience is anyone feeding context into docs, PRDs, prompts, or code
review workflows and wanting cleaner inputs than raw HTML can provide.

## Why this exists

Agent workflows are only as good as the context they ingest. `marksmith` is
meant to turn noisy source material into something readable, portable, and easy
to diff.

## Planned V1

The current product brief focuses on a deterministic local converter that can:

- accept pasted HTML or a URL as input
- extract the useful content and preserve structure
- emit clean Markdown with titles, links, code blocks, and metadata
- support batch conversion for document folders
- remain local-first by default

## Current status

This repository is still early. The current contents are scaffold files,
workflow docs, and the product brief for the first real implementation pass.

See [docs/PRD.md](docs/PRD.md) for the scoped build plan.

## Development

```sh
pnpm install
node --test
```

Before opening a PR, run:

```sh
bash scripts/validate.sh
```

## Safety and local-first notes

`marksmith` is intended to help with local document preparation. Networked or
remote processing should stay explicit rather than hidden behind the default
path.

## License

MIT
