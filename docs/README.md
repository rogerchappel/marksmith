# marksmith Documentation

marksmith is a local-first HTML to Markdown converter. Start with the root [README](../README.md) for install, quickstart, CLI usage, and safety notes.

## Contents

- [Product requirements](PRD.md)
- [Task briefs](TASKS.md)
- [Orchestration handoff](ORCHESTRATION.md)
- [Contributing guide](../CONTRIBUTING.md)
- [Security policy](../SECURITY.md)
- [Agent instructions](../AGENTS.md)

## Safety model

- Local HTML conversion and batch folder conversion do not make network requests.
- URL fetches are explicit opt-in behavior for provided `http(s)` URLs.
- The current implementation does not use cloud services, LLM calls, telemetry, or stored credentials.

## Verification

Run repository checks from the project root:

```sh
bash scripts/validate.sh
npm test
```
