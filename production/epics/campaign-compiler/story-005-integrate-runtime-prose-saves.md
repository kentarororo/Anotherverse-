# Story 005: Integrate Runtime, Prose, and Saves

> **Epic**: Deterministic Procedural Campaign Compiler  
> **Status**: Ready  
> **Layer**: Feature  
> **Type**: Integration  
> **Estimate**: 8 hours  
> **Manifest Version**: 2026-08-06

## Context

**GDD**: `design/gdd/systems/content-generation.md`  
**Requirements**: `TR-content-004`, `TR-content-005`, `TR-content-010`  
**ADR Governing Implementation**: Architecture ADR-0001  
**Dependencies**: Stories 003-004  
**Engine**: React 19.2 / TypeScript 7 / browser | **Risk**: Medium

## Behaviour

Make the compiled plan the source for the new-game runtime. Apply choices, combat results, rewards, recruitment, and relationships as separate runtime facts; render original plain prose from typed facts; save and restore the exact plan without silent recompilation.

## Acceptance Criteria

- [ ] Starting a new game compiles and commits one valid immutable plan before Turn 1.
- [ ] Runtime commands change runtime facts only and cannot rewrite the campaign plan.
- [ ] Combat uses the encounter and mechanics bound in the active turn; progression applies each reward once.
- [ ] Prose views receive typed facts and never create or parse mechanic IDs.
- [ ] No companion appears in prose, formation, or battle before the plan's recruitment fact resolves.
- [ ] Save data contains schema/catalog versions, seed, lead, selected modules, signatures, exact compiled plan, and runtime facts.
- [ ] Save/load restores the same plan and current turn even after catalog wording changes; incompatible mechanical schema changes fail or migrate explicitly.
- [ ] The existing browser new-game, preparation, battle, result, and save/load journeys remain usable.

## Implementation Notes

Adapt the store behind compiler/runtime interfaces instead of putting compiler rules in Zustand or React. Render prose as a terminal projection. Keep legacy milestone entry available only as a development rollback until the new path passes the epic gate.

## Out of Scope

- Review diagnostics and aggregate proof are Story 006.
- Redesigning all battle visuals is a separate presentation epic.

## QA Test Cases

Test: new game commits one plan  
Given: a seed and chosen lead  
When: the player starts the act  
Then: a valid frozen plan exists and Turn 1 uses its scene/encounter bindings  
Edge cases: fallback plan, each lead archetype

Test: runtime facts preserve plan  
Given: a committed plan  
When: choices, recruitment, combat, and rewards resolve  
Then: only runtime state changes and each result is applied once  
Edge cases: reload before reward claim, loss/retry, branch consequence

Test: exact save/load  
Given: a run saved after recruitment and a changed display-only catalog  
When: the save loads  
Then: plan, signatures, runtime facts, and active turn match the saved run without recompilation  
Edge cases: unknown mechanic version, missing migration, corrupted plan

Manual check: readable generated act  
Setup: play one complete act from each world thesis  
Verify: direct original English, cause-action-result flow, correct cast timing, and mechanically accurate text  
Pass condition: no gibberish, copied phrasing, techno language, or contradiction

## Evidence

- Automated: `src/tests/campaign-runtime.test.ts`, `src/tests/persistence.test.ts`, `tests/browser/campaign-compiler.spec.ts`
- Manual: `production/qa/evidence/campaign-runtime-prose-evidence.md`
- Readiness: **Ready** - cross-system ownership and all persistence outcomes are explicit.
