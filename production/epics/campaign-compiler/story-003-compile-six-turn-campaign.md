# Story 003: Compile a Coherent Six-Turn Campaign

> **Epic**: Deterministic Procedural Campaign Compiler  
> **Status**: Ready  
> **Layer**: Core  
> **Type**: Logic  
> **Estimate**: 8 hours  
> **Manifest Version**: 2026-08-06

## Context

**GDD**: `design/gdd/systems/content-generation.md`  
**Requirements**: `TR-content-003`, `TR-content-004`, `TR-content-005`, `TR-content-008`, `TR-content-012`  
**ADR Governing Implementation**: Architecture ADR-0001  
**Dependencies**: Stories 001-002  
**Engine**: TypeScript 7 / browser | **Risk**: Medium

## Behaviour

Compile one world thesis and three compatible lead offers. After the player chooses, keep that lead, generate two different companions, and compile exactly six ordered turn plans. Bind requirements, choices, consequences, promises, payoffs, four to six encounters, rewards, recruitment, and an optional compatible miracle before returning an immutable campaign plan.

## Acceptance Criteria

- [ ] The plan has one world thesis and exactly six turns in the required solo/recruit/recruit/recovery/consequence/boss order.
- [ ] Campaign creation presents three deterministic world-compatible lead candidates without formal combat-role labels; the two unchosen candidates do not become the later companions or appear in campaign canon.
- [ ] Only the selected lead is recruited before Turn 1; companions are introduced and recruited before any later reference or combat use.
- [ ] The plan contains four to six executable encounters and one boss.
- [ ] Every required fact is available from initial state or an earlier reachable turn/choice branch.
- [ ] Every major choice binds at least one later consequence, and every promise binds a payoff or explicit continuation.
- [ ] Rewards include at least one useful recovery, equipment, or fusion decision within the act.
- [ ] Equal input produces a byte-equivalent normalized plan.
- [ ] A canonical 1,000-plan compile completes within 50 ms p95 per plan on the reference test environment.

## Implementation Notes

Separate selection from validation. Use stable candidate ordering and named streams. Build the fact graph forward; do not repair invalid plans by deleting prose. Freeze accepted plan records and keep runtime outcomes elsewhere.

## Out of Scope

- Whole-plan rejection/fallback is Story 004.
- Rendering and save migration are Story 005.

## QA Test Cases

Test: compile required act shape  
Given: each allowed lead archetype across representative seeds  
When: a plan is compiled  
Then: six turn functions, recruitment order, encounter count, boss, and reward opportunity satisfy the GDD  
Edge cases: optional battle at Turn 4, miracle present/absent, each world thesis

Test: causal edges are forward and meaningful  
Given: a compiled plan with every offered choice  
When: requirements, consequences, promises, and payoffs are traversed  
Then: no edge points backward or nowhere, and every major choice changes a later typed field  
Edge cases: branch-specific payoff, act-end continuation

Test: deterministic performance  
Given: the canonical 1,000 seeds  
When: plans compile twice  
Then: normalized plans match and p95 compile time is at most 50 ms  
Edge cases: fallback-near candidate, densest valid catalog combination

## Evidence

- Automated: `src/tests/campaign-compiler.test.ts`, `src/tests/campaign-compiler.performance.test.ts`
- Readiness: **Ready** - dependencies, outputs, performance environment, and failure hand-off are defined.
