# Architecture ADR-0001: Deterministic Typed Campaign Compiler

## Status

Accepted

## Date

2026-08-06

## Last Verified

2026-08-06

## Decision Makers

Product owner and Codex design/engineering review

## Summary

Anotherverse needs campaigns that are structurally different without becoming incoherent. We will compile and validate a complete typed six-turn campaign from compatible authored modules, then render prose from facts and execute mechanics from stable IDs.

## Engine Compatibility

| Field                     | Value                                                               |
| ------------------------- | ------------------------------------------------------------------- |
| **Engine**                | React 19.2 / TypeScript 7 / Vite 8.2 browser runtime                |
| **Domain**                | Core generation, narrative, persistence                             |
| **Knowledge Risk**        | Medium; validate against installed types and local build            |
| **References Consulted**  | `docs/engine-reference/web/VERSION.md`, installed package manifests |
| **Post-Cutoff APIs Used** | None required by the architecture                                   |
| **Verification Required** | Typecheck, Vitest, Playwright, static GitHub Pages build            |

## ADR Dependencies

| Field             | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| **Depends On**    | Design ADR-0001: Mythology x Manhwa Canon and Six-Turn Slice          |
| **Enables**       | Campaign Compiler epic and its implementation stories                 |
| **Blocks**        | None; this ADR is Accepted                                            |
| **Ordering Note** | Schema/catalog precede compiler; validator precedes runtime migration |

## Context

### Problem Statement

The existing generator varies a bounded set of names and text around two authored quest rails. It can produce surface variation, but it cannot guarantee one cosmology, a causal arc, compatible hero identities, executable skills, or later consequences for player choices. Adding more fragments compounds incoherence.

### Current State

The project already has deterministic streams, combat, progression, story authoring, grammar, review diagnostics, and a partial campaign generator. Its authoritative design requires mythology x manhwa, plain English, a six-turn opening, one starting hero, two story recruits, meaningful preparation, and no live model dependency. The missing unit is an immutable campaign-wide semantic plan.

### Constraints

- Static, offline GitHub Pages runtime.
- Strict deterministic TypeScript and existing seeded replay.
- Six-turn slice before broader campaign expansion.
- Original plain prose; no imitation or copied passages from reference fiction.
- Existing combat and save behaviour must remain testable during migration.

### Requirements

- Same seed, catalog version, lead choice, and player choices reproduce content and results.
- One coherent world thesis governs all player-facing modules.
- Exactly six causal turns, four to six battles, two on-screen recruitments, and one boss.
- Every major choice has a later mechanical or narrative consequence.
- Every technique, item, enemy, and miracle shown to the player has executable rules.
- At least 500 structural signatures in the canonical 1,000-seed test corpus.
- Compilation p95 at or below 50 ms on a reference desktop browser.

## Decision

Create a pure TypeScript campaign compiler. A deterministic preflight selects one world thesis and creates three compatible lead candidates; after the player's choice, the compiler promotes that lead, generates two different companions, resolves compatible complete modules into a typed causal graph, validates the entire plan, computes structural/mechanical signatures, and freezes the plan before play. Prose is rendered afterward from typed view models. Candidate search is deterministic and bounded; failure selects a complete prevalidated fallback.

### Architecture

```text
Catalog schemas -> validated module catalog
                         |
Seed streams -> world thesis -> cast/mechanics -> six-turn causal graph
                                                    |
                                                    v
                                              whole-plan validator
                                                    |
                                      valid plan or validated fallback
                                                    |
                            runtime state / prose view / review diagnostics
```

### Key Interfaces

The normative interfaces are `CampaignInput`, `WorldThesis`, `TurnPlan`, `CampaignPlan`, and `ValidationReport` in `docs/architecture/architecture.md`. The implementation may split these types across files but may not weaken these boundaries.

### Implementation Guidelines

- Give each module stable IDs, tags, requirements, outputs, exclusions, and a catalog version.
- Use separate named RNG streams for world, arc, cast, mechanics, rewards, miracles, and cosmetics.
- Generate three world-compatible lead offers. After selection, remove the two unchosen offers from campaign canon and generate two different companions.
- Set only the selected lead as recruited before Turn 1.
- Resolve facts with forward-only turn edges; reject missing prerequisites and circular dependencies.
- Bind choice consequences before rendering the choice.
- Compute signatures from selected semantic modules, causal shape, and executable mechanics; exclude seed and rendered wording.
- Keep retries bounded and record rejection codes without exposing enormous logs to the player.
- Freeze valid plans and apply runtime outcomes in separate state.

## Alternatives Considered

### Free-form offline text generator

- **Description**: Assemble sentences and quests from large interchangeable vocabularies.
- **Pros**: High apparent text variety and low upfront schema work.
- **Cons**: Weak causality, incompatible meanings, non-executable promises, and difficult testing.
- **Estimated Effort**: Lower initially, higher indefinitely through content repair.
- **Rejection Reason**: Repeats the project's main failure mode.

### Runtime live LLM

- **Description**: Request each scene or campaign from a hosted model.
- **Pros**: Flexible language and broad surface variety.
- **Cons**: Network cost, latency, nondeterminism, moderation, save/replay instability, and no guaranteed mechanical validity.
- **Estimated Effort**: Medium integration plus permanent operational burden.
- **Rejection Reason**: Violates offline static deployment and deterministic simulation.

### More fixed campaigns

- **Description**: Author many complete linear rails and select one per seed.
- **Pros**: High prose control and simple validation.
- **Cons**: Content cost scales linearly; choices and mechanical combinations remain shallow.
- **Estimated Effort**: High and recurring.
- **Rejection Reason**: Cannot reach the desired replay scale sustainably.

## Consequences

### Positive

- Story, mechanics, and worldbuilding share enforceable contracts.
- Thousands of potential campaigns emerge from a maintainable module library.
- Invalid outputs are reproducible and diagnosable by seed and module ID.
- Authored prose remains readable because templates receive complete semantic facts.

### Negative

- Upfront schema, tagging, and validation work is substantial.
- Some combinations must be rejected, reducing naive combinatorial counts.
- Content authors must think in modules, prerequisites, consequences, and mechanics.

### Neutral

- A campaign is less editable after Turn 1; runtime drama comes from planned branches plus recorded outcomes.
- Miracles remain possible but become authored exceptions rather than unrestricted randomness.

## Risks

| Risk                                         | Probability | Impact | Mitigation                                                |
| -------------------------------------------- | ----------- | ------ | --------------------------------------------------------- |
| Combinatorial dead ends                      | Medium      | High   | Compatibility linting, bounded search, validated fallback |
| High word variety but low structural variety | High        | High   | Signature tests exclude prose and seed                    |
| Catalog becomes hard to author               | Medium      | Medium | Small schemas, examples, diagnostics, authoring tests     |
| Save invalidation after content changes      | Medium      | High   | Persist plans and version mechanics/catalogs              |
| Compiler blocks first interaction            | Low         | Medium | 50 ms p95 budget and compile outside animation loop       |

## Performance Implications

| Metric            | Before                | Expected After               | Budget                        |
| ----------------- | --------------------- | ---------------------------- | ----------------------------- |
| Compiler CPU      | Small fixed selection | Bounded compatibility search | 50 ms p95 per act             |
| Battle frame time | Existing              | Unchanged                    | 16.67 ms                      |
| Serialized save   | Existing state        | Plan plus state              | Below 10 MB                   |
| Network           | None                  | None                         | Zero runtime generation calls |

## Migration Plan

1. Introduce schemas and adapt current canonical content into versioned modules.
2. Implement world thesis, six-turn planner, signatures, validator, and diagnostics behind unit tests.
3. Bind current combat, progression, crafting, recruitment, and prose realiser to `CampaignPlan`.
4. Persist the compiled plan and verify replay/save compatibility.
5. Make the compiler the default new-game path after the 1,000-seed, browser, and playtest gates pass.

**Rollback plan**: keep the current milestone campaign entry point behind a development-only switch until the compiler path passes all acceptance gates. Do not mix old and new plans inside one save.

## Validation Criteria

- [ ] 1,000 canonical seeds compile without an invalid or partial published plan.
- [ ] At least 500 distinct structural signatures occur across those seeds.
- [ ] At least 100 distinct mechanical hero-kit fingerprints occur.
- [ ] Every plan has six turns, four to six battles, two correctly timed recruits, and one boss.
- [ ] Every offered major choice has a later consequence edge.
- [ ] No unrecruited hero, missing fact, unresolved reference, mixed vocabulary, or unbound placeholder appears.
- [ ] All eight required enemy behaviours are reachable in the canonical corpus.
- [ ] Equal inputs produce byte-equivalent normalized plans and equal simulation results.
- [ ] Compilation remains within the 50 ms p95 budget.

## GDD Requirements Addressed

| GDD Document                                  | System             | Requirement                                    | How This ADR Satisfies It                    |
| --------------------------------------------- | ------------------ | ---------------------------------------------- | -------------------------------------------- |
| `design/gdd/systems/content-generation.md`    | Content Generation | Coherent deterministic structural variation    | Typed compile/validate/freeze pipeline       |
| `design/gdd/systems/narrative-recruitment.md` | Narrative          | Causal six-turn arc and recruitment timing     | Turn graph requirements and fact edges       |
| `design/gdd/systems/combat-preparation.md`    | Combat             | Executable encounters and readable counterplay | Stable encounter/mechanic bindings           |
| `design/gdd/systems/progression-economy.md`   | Progression        | Rewards change later plans                     | Reward bindings and later consequence checks |

## Related

- `design/adr/0001-mythic-manhwa-vertical-slice.md`
- `docs/architecture/architecture.md`
- `design/gdd/systems/content-generation.md`
