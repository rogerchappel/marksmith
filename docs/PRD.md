# marksmith

Status: ready

## Scorecard

Total: 84/100
Band: build now
Last scored: 2026-04-29
Scored by: Neo

| Criterion | Points | Notes |
|---|---:|---|
| Problem pain | 18/20 | Directly addresses a repeated workflow pain. |
| Demand signal | 17/20 | Strong source signal or internal demand. |
| V1 buildability | 18/20 | Small deterministic V1 is feasible. |
| Differentiation | 12/15 | Clear wedge versus adjacent tools. |
| Agentic workflow leverage | 14/15 | Improves agent throughput or supervision. |
| Distribution potential | 5/10 | Distribution will require examples and content. |

## Pitch

A local app/service that converts messy web pages, pasted HTML, and docs into clean Markdown packs for agents, docs, and PRDs.

## Why It Matters

Agent workflows constantly need clean context. A polished Markdown converter can be CLI, macOS app, and share-sheet target, not just another terminal tool.

## Qualification

Demark validates demand for fast HTML-to-Markdown. Roger already uses docs/PRDs heavily in OSS workflows, and clean Markdown context is a direct agent productivity multiplier.

Source / adjacent research: Inspired by steipete/Demark, Swift HTML-to-Markdown tool with 219 stars / 23 forks checked 2026-04-29.

Decision: build now

## V1 Scope

- Paste HTML or URL into local converter
- Return cleaned Markdown with title, links, code blocks, and metadata
- Batch folder conversion
- Optional macOS menu/share extension later

## Out of Scope

- Cloud scraping service
- LLM summarization
- Bypassing paywalls

## Verification

- Unit or fixture tests for core parsing/generation behavior.
- README with install, quickstart, and safety notes.
- Local-first behavior documented clearly.
- No hidden network, credential, or publish behavior.

## Agent Prompt

Build `marksmith` as a deterministic local-first Markdown converter with fixtures from messy HTML pages. Avoid hidden network calls unless user supplies a URL explicitly.
