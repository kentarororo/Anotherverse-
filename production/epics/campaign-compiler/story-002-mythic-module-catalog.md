# Story 002: Build the Mythic Module Catalog

> **Epic**: Deterministic Procedural Campaign Compiler  
> **Status**: Ready  
> **Layer**: Foundation  
> **Type**: Config/Data  
> **Estimate**: 6 hours  
> **Manifest Version**: 2026-08-06

## Context

**GDD**: `design/gdd/systems/content-generation.md`  
**Requirements**: `TR-content-001`, `TR-content-008`, `TR-content-009`  
**ADR Governing Implementation**: Architecture ADR-0001  
**Engine**: TypeScript 7 / browser | **Risk**: Medium

## Behaviour

Adapt and expand the canonical mythology corpus into complete compatible modules. The catalog must provide enough world, act, cast, mechanics, rewards, and miracles for the compiler's diversity targets without copying prose from reference titles.

## Acceptance Criteria

- [ ] The catalog meets every minimum in GDD section 3.5 and validates without unresolved references.
- [ ] Each world combination supplies its own cosmology, power law, naming culture, threat, faction conflict, creatures, materials, and vocabulary rules.
- [ ] Each hero identity binds a coherent origin, desire, flaw, Awakening motif, stat profile, and at least two executable techniques.
- [ ] Every encounter exposes an executable enemy behaviour, visible tell, at least one counter, and reward hook.
- [ ] Every miracle declares a trigger, benefit, visible cost or later complication, executable rule, and compatible world tags.
- [ ] Prose modules are original complete templates in plain English; no arbitrary noun/clause splicing is introduced.
- [ ] Epic cost/oath/faction structures and manhwa progression/trial/breakthrough structures are adapted into Anotherverse modules without importing Gate City, hunter association, system-notification, leaderboard, or licensing language.

## Implementation Notes

Use the supplied corpus as a taxonomy and vocabulary reference, not as text to reproduce. Prefer a smaller set of complete semantic modules over a larger list of disconnected phrases. Catalog linting must run in tests.

## Out of Scope

- Selection and causal binding are Story 003.
- Quantitative corpus proof is Story 006.

## QA Test Cases

Manual check: module coherence  
Setup: review every world, hero, miracle, and one full compatible module chain  
Verify: names, motives, powers, mechanics, and vocabulary describe the same identity/world  
Pass condition: no unexplained cross-world term or non-executable promise

Test: catalog minimums and references  
Given: the complete canonical catalog  
When: catalog linting runs  
Then: all GDD minimums pass and every reference resolves  
Edge cases: duplicate ID, forbidden term, missing technique, miracle without cost

## Evidence

- Automated: `src/tests/campaign-catalog.test.ts`
- Manual: `production/qa/evidence/mythic-module-catalog-evidence.md`
- Readiness: **Ready** - data minimums and review standard are explicit.
