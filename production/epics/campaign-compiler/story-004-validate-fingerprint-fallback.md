# Story 004: Validate, Fingerprint, and Fall Back

> **Epic**: Deterministic Procedural Campaign Compiler  
> **Status**: Ready  
> **Layer**: Core  
> **Type**: Logic  
> **Estimate**: 6 hours  
> **Manifest Version**: 2026-08-06

## Context

**GDD**: `design/gdd/systems/content-generation.md`  
**Requirements**: `TR-content-006`, `TR-content-007`, `TR-content-009`  
**ADR Governing Implementation**: Architecture ADR-0001  
**Dependencies**: Story 003  
**Engine**: TypeScript 7 / browser | **Risk**: Medium

## Behaviour

Validate the complete candidate plan before publication, calculate normalized structural and mechanical signatures, retry deterministically within the 64-plan budget, and return a complete prevalidated fallback when search is exhausted.

## Acceptance Criteria

- [ ] Validation detects missing facts, circular/invalid chronology, unrecruited hero references, incompatible vocabulary, unresolved IDs, duplicate identities, unbound placeholders, non-executable mechanics, missing sinks, and missing choice/payoff edges.
- [ ] Every issue has a stable code plus relevant module, turn, fact/reference, and reason.
- [ ] Structural signatures use semantic module/graph shape and exclude seed, names, prose, and cosmetic adjectives.
- [ ] Mechanical signatures use stat profiles and executable technique/enemy/item/miracle rule IDs and exclude wording.
- [ ] Candidate search never exceeds 64 complete-plan attempts and follows a deterministic rejection sequence.
- [ ] Exhaustion returns a complete validated fallback; an invalid fallback stops new-game creation with a plain diagnostic code.
- [ ] Published plans and nested plan collections are immutable at the domain boundary.

## Implementation Notes

Validation is independent from candidate creation so tests can inject malformed plans. Keep rejection summaries bounded. Signature normalization must sort unordered sets by stable ID. Never treat a different hash caused by a seed or name as diversity.

## Out of Scope

- Runtime application is Story 005.
- 1,000-seed aggregate reporting is Story 006.

## QA Test Cases

Test: reject each incoherence class  
Given: one minimally malformed plan fixture per required error class  
When: whole-plan validation runs  
Then: publication is denied with the expected stable code and exact context  
Edge cases: two simultaneous failures, branch-only missing fact, forbidden term inside a complete sentence

Test: signatures ignore cosmetic changes  
Given: equal semantic plans with different seeds, names, or wording  
When: signatures are calculated  
Then: structural and mechanical signatures remain equal  
Edge cases: reordered tag arrays, changed mechanic ID, changed consequence type

Test: bounded fallback  
Given: a catalog/input constructed so every candidate is invalid  
When: compilation runs  
Then: exactly the bounded deterministic attempts occur and a valid complete fallback is returned  
Edge cases: invalid fallback produces the documented fatal diagnostic

## Evidence

- Automated: `src/tests/campaign-validation.test.ts`, `src/tests/campaign-signatures.test.ts`
- Readiness: **Ready** - error classes, bounds, and observable failure outcomes are exhaustive.
