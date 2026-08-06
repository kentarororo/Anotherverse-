# Story 006: Prove Diversity and Expose Diagnostics

> **Epic**: Deterministic Procedural Campaign Compiler  
> **Status**: Ready  
> **Layer**: Presentation  
> **Type**: Integration  
> **Estimate**: 5 hours  
> **Manifest Version**: 2026-08-06

## Context

**GDD**: `design/gdd/systems/content-generation.md`  
**Requirements**: `TR-content-009`, `TR-content-011`, `TR-content-012`  
**ADR Governing Implementation**: Architecture ADR-0001  
**Dependencies**: Stories 001-005  
**Engine**: React 19.2 / TypeScript 7 / Playwright | **Risk**: Medium

## Behaviour

Create the canonical seeded corpus runner and extend review mode so designers can see exactly what the compiler chose, how the story is connected, what mechanics execute, why alternatives were rejected, and whether diversity/performance gates pass.

## Acceptance Criteria

- [ ] A stable canonical 1,000-seed corpus compiles twice to identical normalized results.
- [ ] Zero published plan is invalid or partial.
- [ ] The report asserts at least 500 distinct structural signatures and 100 mechanical hero-kit fingerprints.
- [ ] All eight required enemy behaviours appear in reachable encounters.
- [ ] Performance reporting asserts at most 50 ms p95 compile time in the defined test environment.
- [ ] Review mode shows seed, catalog version, world thesis, selected module IDs, causal edges, encounter/reward bindings, both signatures, validation status, and bounded rejection summaries.
- [ ] Review mode distinguishes structural/mechanical variation from name/prose variation and remains keyboard/touch operable.
- [ ] Normal player mode does not expose raw diagnostic data.

## Implementation Notes

Keep corpus metrics deterministic: stable seed list, stable normalization, and explicit thresholds. Separate machine assertions from the human-readable review panel. Limit rejection detail so pathological searches do not freeze the page.

## Out of Scope

- Automated content balancing beyond the existing encounter bands.
- Telemetry collection or network analytics.

## QA Test Cases

Test: canonical corpus gates  
Given: the committed 1,000-seed list and canonical catalog version  
When: the corpus runner executes twice  
Then: results match, zero plan is invalid, diversity/performance thresholds pass, and all enemy behaviours are reachable  
Edge cases: wording-only catalog change, reordered source arrays

Test: diagnostics match the plan  
Given: a plan with at least one rejected candidate and a branch consequence  
When: review data is produced  
Then: thesis, modules, graph, bindings, signatures, errors, and rejections match domain state  
Edge cases: no rejected candidate, fallback plan, miracle present

Manual check: review usability  
Setup: open review mode on desktop and narrow touch viewport  
Verify: navigate all required information using keyboard and touch; compare a same-signature wording variant and a distinct structure  
Pass condition: differences are clearly labelled and no raw diagnostics leak to player mode

## Evidence

- Automated: `src/tests/campaign-corpus.test.ts`, `src/tests/corpus-review.test.ts`, `tests/browser/corpus-review.spec.ts`
- Manual: `production/qa/evidence/campaign-review-evidence.md`
- Readiness: **Ready** - thresholds, fixtures, test environment, and manual evidence are named.
