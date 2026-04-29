# Task Brief: Implement HTML and URL input parsing for local Markdown conversion

## Objective

Enable users to paste HTML or provide a URL to convert content into clean Markdown locally

## Repository

marksmith

## Suggested Branch

agent/implement-html-and-url-input-parsing-for-local-markdown-conversion

## Task Type

feature

## Risk Level

Medium

## Context

Source: llm (openai:gpt-4.1-mini)

V1 scope requires accepting pasted HTML or URLs and converting them to Markdown with title, links, code blocks, and metadata

## Allowed Paths

- src/parser
- src/converter
- src/cli

## Forbidden Paths

- src/cloud
- src/llm
- src/network

## Expected Commits

- Add HTML input parser
- Add URL fetch and parse module
- Integrate parsing with Markdown converter

## Verification

- Unit tests for HTML and URL input parsing
- Fixture tests for conversion accuracy
- Manual test of local conversion from pasted HTML and URL

## Stop Conditions

- HTML and URL inputs convert correctly to Markdown with expected elements
- No network calls occur unless URL is explicitly provided

## Review Pack Required

Yes.

## Human Decision Needed

- None

## Agent Prompt

Build deterministic local-first Markdown converter input handling for pasted HTML and URLs, avoiding hidden network calls unless URL is explicit.

---

# Task Brief: Develop batch folder conversion feature

## Objective

Allow users to convert multiple HTML files in a folder to Markdown in batch mode

## Repository

marksmith

## Suggested Branch

agent/develop-batch-folder-conversion-feature

## Task Type

feature

## Risk Level

Medium

## Context

Source: llm (openai:gpt-4.1-mini)

V1 scope includes batch folder conversion to improve workflow efficiency

## Allowed Paths

- src/batch
- src/converter
- src/cli

## Forbidden Paths

- src/cloud
- src/llm

## Expected Commits

- Add batch folder processing module
- Integrate batch processing with converter
- Add CLI commands for batch conversion

## Verification

- Unit tests for batch processing logic
- Fixture tests for multiple file conversions
- Manual test of batch folder conversion

## Stop Conditions

- Batch folder conversion completes successfully with correct Markdown output for all files

## Review Pack Required

Yes.

## Human Decision Needed

- None

## Agent Prompt

Implement batch folder conversion to process multiple HTML files into Markdown locally.

---

# Task Brief: Create README with install, quickstart, and safety notes

## Objective

Provide clear documentation for installation, usage, and safety of the local-first Markdown converter

## Repository

marksmith

## Suggested Branch

agent/create-readme-with-install-quickstart-and-safety-notes

## Task Type

documentation

## Risk Level

Low

## Context

Source: llm (openai:gpt-4.1-mini)

Verification requires README to cover install, quickstart, and safety notes including no hidden network or credential behavior

## Allowed Paths

- README.md
- docs/

## Forbidden Paths

- src/

## Expected Commits

- Add install instructions
- Add quickstart guide
- Add safety and local-first behavior notes

## Verification

- README includes install instructions
- README includes quickstart guide
- README documents local-first behavior and safety notes

## Stop Conditions

- README is complete and reviewed for clarity and accuracy

## Review Pack Required

No.

## Human Decision Needed

- None

## Agent Prompt

Write comprehensive README covering installation, quickstart, and safety notes emphasizing local-first behavior.

---

# Task Brief: Add unit and fixture tests for core parsing and Markdown generation

## Objective

Ensure core parsing and Markdown generation behave correctly and deterministically

## Repository

marksmith

## Suggested Branch

agent/add-unit-and-fixture-tests-for-core-parsing-and-markdown-generation

## Task Type

test

## Risk Level

Low

## Context

Source: llm (openai:gpt-4.1-mini)

Verification requires unit or fixture tests for core parsing and generation behavior

## Allowed Paths

- tests/
- src/parser
- src/converter

## Forbidden Paths

- src/cloud
- src/llm

## Expected Commits

- Add unit tests for HTML parsing
- Add fixture tests for Markdown output
- Integrate tests into CI pipeline

## Verification

- Unit tests cover parsing edge cases
- Fixture tests validate Markdown output correctness
- Tests run successfully in CI

## Stop Conditions

- All core parsing and generation tests pass reliably

## Review Pack Required

Yes.

## Human Decision Needed

- None

## Agent Prompt

Develop comprehensive unit and fixture tests for core HTML parsing and Markdown generation modules.
