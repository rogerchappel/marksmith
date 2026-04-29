# Orchestration Handoff

## Summary

- Workspace: default
- Repository: marksmith
- Source: taskbrief + llm-orchestration (openai:gpt-4.1-mini)
- Total tasks: 4
- Dispatch now: marksmith-implement-html-and-url-input-parsing-for-local-markdown-conversion, marksmith-develop-batch-folder-conversion-feature
- Blocked tasks: None

## Dispatch Prompt

Dispatch Wave 1 first. These tasks may run concurrently:
- marksmith-implement-html-and-url-input-parsing-for-local-markdown-conversion
- marksmith-develop-batch-folder-conversion-feature
Wait for the whole wave to finish and pass verification before dispatching the next sequential wave.

## LLM Refinement Notes

- The two implementation tasks have no dependencies and can run concurrently in the first wave.
- The verification tests depend on both implementation tasks and must run after them, so they are placed in the second wave sequentially.
- The documentation depends on both implementation tasks and the verification tests, so it is placed last in the third wave sequentially.
- This sequencing respects all dependencies and keeps tasks concurrent only when safe and independent.

## Sequential Waves

### Wave 1: Implementation

- Mode inside wave: concurrent
- Dispatch: now
- Tasks: marksmith-implement-html-and-url-input-parsing-for-local-markdown-conversion, marksmith-develop-batch-folder-conversion-feature

### Wave 2: Verification / tests

- Mode inside wave: sequential
- Dispatch: after_dependencies
- Tasks: marksmith-add-unit-and-fixture-tests-for-core-parsing-and-markdown-generation

### Wave 3: Documentation / examples

- Mode inside wave: sequential
- Dispatch: after_dependencies
- Tasks: marksmith-create-readme-with-install-quickstart-and-safety-notes

## Task Dependencies

### marksmith-implement-html-and-url-input-parsing-for-local-markdown-conversion: Implement HTML and URL input parsing for local Markdown conversion

- Phase: implementation
- Repo: marksmith
- Branch: agent/implement-html-and-url-input-parsing-for-local-markdown-conversion
- Risk: medium
- Depends on: None
- Can run concurrently with: marksmith-develop-batch-folder-conversion-feature
- Dispatchable now: Yes
- Blocked by: None

### marksmith-develop-batch-folder-conversion-feature: Develop batch folder conversion feature

- Phase: implementation
- Repo: marksmith
- Branch: agent/develop-batch-folder-conversion-feature
- Risk: medium
- Depends on: None
- Can run concurrently with: marksmith-implement-html-and-url-input-parsing-for-local-markdown-conversion
- Dispatchable now: Yes
- Blocked by: None

### marksmith-add-unit-and-fixture-tests-for-core-parsing-and-markdown-generation: Add unit and fixture tests for core parsing and Markdown generation

- Phase: verification
- Repo: marksmith
- Branch: agent/add-unit-and-fixture-tests-for-core-parsing-and-markdown-generation
- Risk: low
- Depends on: marksmith-implement-html-and-url-input-parsing-for-local-markdown-conversion, marksmith-develop-batch-folder-conversion-feature
- Can run concurrently with: None
- Dispatchable now: No
- Blocked by: None

### marksmith-create-readme-with-install-quickstart-and-safety-notes: Create README with install, quickstart, and safety notes

- Phase: documentation
- Repo: marksmith
- Branch: agent/create-readme-with-install-quickstart-and-safety-notes
- Risk: low
- Depends on: marksmith-implement-html-and-url-input-parsing-for-local-markdown-conversion, marksmith-develop-batch-folder-conversion-feature, marksmith-add-unit-and-fixture-tests-for-core-parsing-and-markdown-generation
- Can run concurrently with: None
- Dispatchable now: No
- Blocked by: None

