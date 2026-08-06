# Story 001: Define Campaign Module Schemas and Streams

> **Epic**: Deterministic Procedural Campaign Compiler  
> **Status**: Ready  
> **Layer**: Foundation  
> **Type**: Logic  
> **Estimate**: 4 hours  
> **Manifest Version**: 2026-08-06

## Context

**GDD**: `design/gdd/systems/content-generation.md`  
**Requirements**: `TR-content-001`, `TR-content-002`  
**ADR Governing Implementation**: Architecture ADR-0001  
**Engine**: TypeScript 7 / browser | **Risk**: Medium

## Behaviour

Create the typed and runtime-validated contracts for world, arc, hero, encounter, progression, miracle, prose-view, campaign input, and compiled plan modules. Extend deterministic streams so world, arc, cast, mechanics, rewards, miracles, and cosmetics are independently addressable.

## Acceptance Criteria

- [ ] Every authored module requires a stable ID, catalog version, tags, requirements, outputs, exclusions, and mechanic references where applicable.
- [ ] Malformed modules fail with stable error codes and include the offending module ID/path.
- [ ] All seven named streams reproduce equal selections for equal seed and stream name.
- [ ] Consuming extra values from the cosmetics stream leaves all normalized mechanical selections unchanged.
- [ ] No generation schema or stream calls `Math.random`, the clock, locale-dependent ordering, or browser entropy.

## Implementation Notes

Keep schemas and domain types framework-independent. Sort candidate IDs explicitly before weighted sampling. Make module contracts narrow enough for authoring but never optional where omission could create an incoherent fact or non-executable rule.

## Out of Scope

- Catalog content is Story 002.
- Candidate compilation is Story 003.

## QA Test Cases

Test: all module categories validate complete records  
Given: one valid record per module category  
When: each record is parsed  
Then: all stable fields and references survive normalization  
Edge cases: empty tags, duplicate IDs, absent version, missing mechanic reference

Test: malformed content fails usefully  
Given: a record missing a required field  
When: catalog validation runs  
Then: the error has a stable code and exact module path  
Edge cases: unknown fields, invalid fact ID, circular self-reference

Test: named streams are isolated  
Given: two runs with equal seed and one run consumes extra cosmetic values  
When: all mechanical streams select modules  
Then: normalized mechanical selections are byte-equivalent  
Edge cases: empty seed, Unicode seed, large sample count

## Evidence

- Automated: `src/tests/campaign-schemas.test.ts`, `src/tests/rng.test.ts`
- Readiness: **Ready** - criteria are deterministic and independently testable.
