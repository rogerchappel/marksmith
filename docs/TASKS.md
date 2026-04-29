# Task Brief: Implement core HTML to Markdown conversion

## Objective

Develop the core functionality to convert pasted HTML or URLs into cleaned Markdown including title, links, code blocks, and metadata

## Repository

marksmith

## Suggested Branch

agent/implement-core-html-to-markdown-conversion

## Task Type

feature

## Risk Level

Medium

## Context

Source: llm (openai:gpt-4.1-mini)

This is the main feature of marksmith to enable local conversion of messy HTML to clean Markdown for agent workflows

## Allowed Paths

- src/converter/*
- src/utils/*

## Forbidden Paths

- src/network/*
- src/cloud/*

## Expected Commits

- feat: add HTML to Markdown conversion core logic
- test: add unit tests for HTML parsing and Markdown generation
- docs: update README with install and quickstart

## Verification

- Unit tests covering parsing and generation of Markdown from HTML fixtures
- No network calls unless URL explicitly provided
- README updated with usage instructions

## Stop Conditions

- Core conversion passes all unit tests
- No hidden network or credential usage detected

## Review Pack Required

Yes.

## Human Decision Needed

- None

## Agent Prompt

Build `marksmith` as a deterministic local-first Markdown converter with fixtures from messy HTML pages. Avoid hidden network calls unless user supplies a URL explicitly.

---

# Task Brief: Add batch folder conversion feature

## Objective

Enable users to convert multiple HTML files in a folder to Markdown in batch mode

## Repository

marksmith

## Suggested Branch

agent/add-batch-folder-conversion-feature

## Task Type

feature

## Risk Level

Medium

## Context

Source: llm (openai:gpt-4.1-mini)

Batch processing is required to handle multiple documents efficiently as part of V1 scope

## Allowed Paths

- src/batch/*
- src/converter/*

## Forbidden Paths

- src/network/*
- src/cloud/*

## Expected Commits

- feat: add batch folder conversion support
- test: add tests for batch processing

## Verification

- Unit tests for batch processing logic
- Batch conversion produces correct Markdown outputs for multiple files

## Stop Conditions

- Batch conversion feature passes tests
- No network or cloud dependencies introduced

## Review Pack Required

Yes.

## Human Decision Needed

- None

## Agent Prompt

Build `marksmith` as a deterministic local-first Markdown converter with fixtures from messy HTML pages. Avoid hidden network calls unless user supplies a URL explicitly.

---

# Task Brief: Document local-first behavior and usage

## Objective

Create README content covering installation, quickstart, safety notes, and local-first behavior

## Repository

marksmith

## Suggested Branch

agent/document-local-first-behavior-and-usage

## Task Type

documentation

## Risk Level

Low

## Context

Source: llm (openai:gpt-4.1-mini)

Clear documentation is essential for user adoption and to clarify no hidden network or credential usage

## Allowed Paths

- README.md

## Forbidden Paths

- src/*

## Expected Commits

- docs: add install, quickstart, and safety notes to README

## Verification

- README includes install instructions, quickstart guide, and safety notes
- Local-first behavior clearly documented

## Stop Conditions

- README reviewed and approved

## Review Pack Required

No.

## Human Decision Needed

- None

## Agent Prompt

Build `marksmith` as a deterministic local-first Markdown converter with fixtures from messy HTML pages. Avoid hidden network calls unless user supplies a URL explicitly.
