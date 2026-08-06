# QA Plan: Procedural Campaign Compiler

> **Date**: 2026-08-06  
> **Scope**: 6 stories across corpus, generation, narrative, combat/progression integration, persistence, and review UI  
> **Engine**: React 19.2 / TypeScript 7 / Vite 8.2 browser runtime  
> **Epic**: `production/epics/campaign-compiler/EPIC.md`

## Quality Objective

Reject campaigns that are merely different in wording. The milestone passes only when the game repeatedly compiles a coherent, playable six-turn legend with executable mechanics, later consequences, exact replay, and measurable structural diversity.

## Story Coverage Summary

| Story                                      | Type        | Automated Test Required                              | Manual Verification Required     |
| ------------------------------------------ | ----------- | ---------------------------------------------------- | -------------------------------- |
| 001 Campaign Module Schemas and Streams    | Logic       | Schema and RNG isolation unit tests                  | None                             |
| 002 Mythic Module Catalog                  | Config/Data | Catalog lint and reference tests                     | Narrative/content sign-off       |
| 003 Compile Six-Turn Campaign              | Logic       | Compiler, causality, determinism, performance tests  | None                             |
| 004 Validate, Fingerprint, and Fall Back   | Logic       | Error-class, signature, immutability, fallback tests | None                             |
| 005 Integrate Runtime, Prose, and Saves    | Integration | Runtime, persistence, and browser journey tests      | Four-world full-act prose review |
| 006 Prove Diversity and Expose Diagnostics | Integration | 1,000-seed corpus and browser review tests           | Desktop/touch review-mode check  |

Totals: 3 Logic, 2 Integration, 0 Visual/Feel, 0 standalone UI, 1 Config/Data.

## Test Environments

- **Fast loop**: Vitest/jsdom under the repository's pinned Node toolchain.
- **Browser gate**: Playwright Chromium at `127.0.0.1:4173` using the Vite dev server.
- **Build gate**: TypeScript project build plus Vite static output using base `/Anotherverse-/`.
- **Reference compiler performance environment**: local desktop Chromium/Node runner with warm-up excluded; record device, Node version, and catalog version in evidence. Threshold is p95 <= 50 ms per six-turn plan.
- **Responsive manual widths**: 1280x720 desktop and 390x844 touch viewport.

## Automated Tests Required

### Story 001 - Schemas and deterministic streams

Paths: `src/tests/campaign-schemas.test.ts`, `src/tests/rng.test.ts`

- Parse one complete valid record for every module type.
- Reject duplicate IDs, missing versions, invalid fact IDs, absent mechanic references, and illegal exclusions with stable codes.
- Prove equal named streams produce equal selections.
- Prove extra cosmetic consumption does not change world, arc, cast, mechanics, rewards, or miracle selections.
- Keep the repository random guard green.

### Story 002 - Catalog lint

Path: `src/tests/campaign-catalog.test.ts`

- Assert every GDD section 3.5 catalog minimum.
- Resolve every ID and mechanic reference.
- Assert complete world vocabulary and required compatibility fields.
- Reject miracle records missing a trigger, rule, cost/complication, or tags.
- Scan canonical player-facing templates for legacy forbidden terms and unbound placeholders.
- Assert source-register tags and quarantined Gate City, hunter-association, system-notification, leaderboard, and licensing terms cannot enter canonical rendered prose.

### Story 003 - Compiler and causality

Paths: `src/tests/campaign-compiler.test.ts`, `src/tests/campaign-compiler.performance.test.ts`

- Assert exactly six required turn functions, four to six encounters, two ordered recruitments, and one boss.
- Traverse every choice branch and assert a later typed consequence.
- Assert every required fact has a reachable earlier producer.
- Assert each promise has a payoff or explicit continuation.
- Assert rewards expose at least one meaningful recovery/equipment/fusion decision.
- Compile equal inputs twice and deep-compare normalized plans.
- Measure canonical corpus compile p95 after warm-up.

### Story 004 - Validator, signatures, fallback

Paths: `src/tests/campaign-validation.test.ts`, `src/tests/campaign-signatures.test.ts`

- Inject one fixture for every required validation failure class.
- Assert stable error code and exact module/turn/fact context.
- Assert seed/name/wording/cosmetic changes do not change signatures.
- Assert causal/mechanical changes do change the appropriate signature.
- Assert no more than 64 deterministic complete-plan attempts.
- Assert exhausted search returns a fully valid fallback; invalid fallback returns the fatal recovery code.
- Attempt plan mutation and confirm the domain contract remains immutable.

### Story 005 - Runtime, prose, persistence

Paths: `src/tests/campaign-runtime.test.ts`, `src/tests/persistence.test.ts`, `tests/browser/campaign-compiler.spec.ts`

- New game commits one valid plan before Turn 1.
- Runtime choices, battles, rewards, and recruitment do not mutate the plan.
- A reward applies once across save/reload.
- A companion cannot appear in prose, formation, or battle before recruitment.
- Save/load restores exact plan, signatures, selected modules, active turn, and runtime facts.
- A display-only catalog change does not trigger recompilation.
- Unknown mechanical versions fail or use an explicit tested migration.
- Browser journey reaches new game -> preparation -> battle -> result -> save/reload -> next turn.

### Story 006 - Corpus proof and diagnostics

Paths: `src/tests/campaign-corpus.test.ts`, `src/tests/corpus-review.test.ts`, `tests/browser/corpus-review.spec.ts`

- Compile the stable 1,000-seed corpus twice and compare normalized output.
- Assert zero invalid/partial published plans.
- Assert at least 500 structural signatures and 100 mechanical hero-kit fingerprints.
- Assert all eight required enemy behaviours are reachable.
- Assert review data exactly matches thesis, module, graph, encounter, reward, signature, validation, and rejection domain data.
- Assert normal player mode contains no raw rejection or internal module diagnostics.
- Browser-check keyboard navigation and narrow touch layout for review mode.

## Property and Mutation Tests

Use generated test fixtures or deterministic table expansion for these invariants:

- Reordering catalog source arrays does not change output.
- Changing cosmetics does not change mechanical signature or combat input.
- Removing a fact producer always invalidates the dependent plan.
- Moving recruitment later always invalidates earlier companion references.
- Replacing an executable rule ID changes the mechanical signature.
- Rewording a valid complete template changes neither structural nor mechanical signature.
- Every valid plan remains valid after serialize/deserialize.

## Manual QA Checklist

### Mythic module catalog

Evidence: `production/qa/evidence/mythic-module-catalog-evidence.md`  
Sign-off: narrative systems designer plus product owner

- [ ] Read all hero selection descriptions: each is concise, grammatical, and hides its formal combat role.
- [ ] Read one complete module chain per world thesis: cosmology, character, enemy, material, skill, and item belong to the same world.
- [ ] Inspect all miracles: the exceptional power and its cost/complication are understandable.
- [ ] Search for copied passages, techno/operations language, vague filler, and arbitrary compound nouns; none remain.

### Runtime prose and causality

Evidence: `production/qa/evidence/campaign-runtime-prose-evidence.md`  
Sign-off: playwrite review plus product owner

- [ ] Play one act from each world thesis.
- [ ] Confirm only the chosen lead appears in Turn 1.
- [ ] Confirm both companions enter through visible story events before formation/combat use.
- [ ] For each choice, identify the later changed encounter, reward, ally condition, option, or ending state.
- [ ] Confirm every scene reads as cause -> action/choice -> result in original plain English.
- [ ] Confirm battle tells, skills, drops, crafting opportunities, and miracle effects match the simulation.

### Review mode usability

Evidence: `production/qa/evidence/campaign-review-evidence.md`  
Sign-off: QA lead

- [ ] Compare two same-signature wording variants; UI labels them cosmetic.
- [ ] Compare two structurally different plans; UI identifies the changed thesis/edges/encounters.
- [ ] Navigate the view with keyboard only.
- [ ] Navigate required controls at 390x844 using touch-sized targets.
- [ ] Confirm normal play hides internal validation and rejection data.

## Smoke Test Scope

1. Static build loads at the GitHub Pages base path.
2. Title screen starts a new game and lead selection works.
3. Compiler returns a valid six-turn plan.
4. Turn 1 preparation and autobattle resolve.
5. First and second recruitment happen at the correct turns.
6. A choice changes Turn 5 or Turn 6 as promised.
7. Reward/equipment/fusion can affect a later plan.
8. Save/reload restores the same plan and active runtime facts.
9. Corpus review loads and displays matching diagnostics.
10. Existing combat, progression, and random-guard suites remain green.

## Playtest Requirements

| Goal                                                                                 | Minimum sessions               | Target player           |
| ------------------------------------------------------------------------------------ | ------------------------------ | ----------------------- |
| Can a player explain the world rule, threat, and each hero's role after one act?     | 5                              | New players             |
| Does a player notice at least one choice consequence without being told where it is? | 5                              | New players             |
| Does planning, gear, or fusion visibly change a difficult battle result?             | 5                              | RPG/autobattler players |
| Do three seeds feel like different legends rather than rewritten quests?             | 3 sessions each from 3 players | Mixed                   |
| Is prose consistently clear and human, with no gibberish or techno drift?            | 12 acts reviewed               | Product owner/playwrite |

Session notes: `production/session-logs/playtest-campaign-compiler-[session].md`.

Playtest rejection rule: if two of three compared seeds share the same causal structure and encounter/mechanical sequence despite different wording, return to Stories 002-004. If any act contains a contradiction, premature cast member, unresolved promise, or non-executable claim, return to Stories 001-005 before adding more content.

## Regression Risks

| Risk                                       | Required regression                                                                                 |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Named RNG changes alter combat replay      | Existing RNG, engine, and combat suites                                                             |
| New plan contract breaks current UI        | Browser critical path and component tests                                                           |
| Catalog IDs invalidate saves               | Persistence migration and exact restore tests                                                       |
| Narrative validation blocks all candidates | Known-valid fixture plus fallback test                                                              |
| Bulk corpus test becomes slow/flaky        | Stable seed list, no wall-clock assertions except isolated benchmark, deterministic output artifact |

## Exit Criteria

- [ ] All six story test suites pass.
- [ ] Canonical 1,000-seed gates pass twice from a clean test run.
- [ ] Typecheck, deterministic guard, Vitest, Playwright, and production build pass.
- [ ] All three manual evidence files exist with required sign-off.
- [ ] No open Severity 1 or Severity 2 defect; no known coherence defect is waived.
- [ ] Product owner can play at least three generated acts and confirms they feel structurally different and plainly written.
- [ ] Legacy fixed rails are not the default new-game path.

## Definition of Done

A story is complete only when every acceptance criterion has automated evidence or the named manual evidence, all dependencies remain green, its story file is closed through the normal story-done workflow, and no issue is hidden by weakening a validator or diversity threshold.

---

Generated from the approved campaign-compiler GDD, ADR, control manifest, epic, and story files.
