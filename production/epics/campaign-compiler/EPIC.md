# Epic: Deterministic Procedural Campaign Compiler

> **Layer**: Core, with required Foundation and Feature integration  
> **GDD**: `design/gdd/systems/content-generation.md`  
> **Architecture Module**: Campaign Compiler and Campaign Validator  
> **Status**: Ready  
> **Stories**: 6 Ready

## Overview

Replace fixed quest-rail selection with a deterministic compiler that binds one coherent mythology, a compatible three-hero cast, executable mechanics, and a typed six-turn causal graph before Turn 1. The epic also validates and fingerprints the plan, connects it to runtime/save/prose boundaries, and exposes review diagnostics proving that variation is structural rather than cosmetic.

## Governing ADRs

| ADR                   | Decision Summary                                                                          | Engine Risk |
| --------------------- | ----------------------------------------------------------------------------------------- | ----------- |
| Architecture ADR-0001 | Compile, validate, fingerprint, and freeze a typed campaign plan; render prose afterward. | Medium      |
| Design ADR-0001       | Mythology x manhwa canon, progression-first autobattler, six-turn opening slice.          | Low         |

## GDD Requirements

| TR-ID          | Requirement                                      | ADR Coverage |
| -------------- | ------------------------------------------------ | ------------ |
| TR-content-001 | Versioned typed authored module contracts        | ADR-0001     |
| TR-content-002 | Independent deterministic RNG streams            | ADR-0001     |
| TR-content-003 | Single coherent world thesis                     | ADR-0001     |
| TR-content-004 | Immutable typed six-turn causal plan             | ADR-0001     |
| TR-content-005 | Choices have consequences; promises have payoffs | ADR-0001     |
| TR-content-006 | Whole-plan validation                            | ADR-0001     |
| TR-content-007 | Complete validated fallback                      | ADR-0001     |
| TR-content-008 | Authored miracle contract                        | ADR-0001     |
| TR-content-009 | Structural and mechanical diversity gates        | ADR-0001     |
| TR-content-010 | Exact save/load without silent recompilation     | ADR-0001     |
| TR-content-011 | Complete review diagnostics                      | ADR-0001     |
| TR-content-012 | 50 ms p95 compilation budget                     | ADR-0001     |

No untraced requirements remain for this epic.

## Ordered Stories

1. [Story 001: Define Campaign Module Schemas and Streams](story-001-campaign-module-schemas.md)
2. [Story 002: Build the Mythic Module Catalog](story-002-mythic-module-catalog.md)
3. [Story 003: Compile a Coherent Six-Turn Campaign](story-003-compile-six-turn-campaign.md)
4. [Story 004: Validate, Fingerprint, and Fall Back](story-004-validate-fingerprint-fallback.md)
5. [Story 005: Integrate Runtime, Prose, and Saves](story-005-integrate-runtime-prose-saves.md)
6. [Story 006: Prove Diversity and Expose Diagnostics](story-006-prove-diversity-diagnostics.md)

## Definition of Done

This epic is complete when all six stories are closed, every GDD acceptance criterion has automated or documented evidence, the canonical 1,000-seed corpus has zero invalid published plans, at least 500 structural signatures and 100 mechanical hero-kit fingerprints are observed, the compiler meets its 50 ms p95 budget, and typecheck, Vitest, Playwright, deterministic guard, and static build pass.

## Explicit Non-Goals

- Live LLM generation or network content services.
- Endless campaigns or replacing the six-turn milestone with twenty-turn breadth.
- Procedurally inventing combat rules that are not executable.
- Production art, audio, multiplayer, or a second economy.
