# Anotherverse - Systems Index

Status: **Approved for the generated six-turn slice**

| System                  | Authority                                                    | Owns                                                                                               | Depends on                                        | Slice priority     |
| ----------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------ |
| Campaign Compiler       | [content-generation.md](systems/content-generation.md)       | World thesis, corpus schemas, typed six-turn plan, compatibility, validation, signatures, fallback | Entity/terminology registries, named RNG streams  | P0 foundation/core |
| Combat & Preparation    | [combat-preparation.md](systems/combat-preparation.md)       | Formation, stance, priority, actions, encounter resolution, battle readability                     | Heroes, enemies, progression loadout              | P0 core/feature    |
| Progression & Economy   | [progression-economy.md](systems/progression-economy.md)     | Stats, XP, level, Awakening, rewards, inventory, recovery, fusion                                  | Combat results, content catalog                   | P0 feature         |
| Narrative & Recruitment | [narrative-recruitment.md](systems/narrative-recruitment.md) | Six-turn arc, scene facts, choices, companion timing, relationship consequences                    | World thesis, campaign plan, combat encounter IDs | P0 feature         |
| Save & Replay           | Existing implementation plus architecture contract           | Seed, versions, compiled plan, runtime facts, deterministic restoration                            | All state-owning systems                          | P1 feature         |
| Presentation            | Existing UI plus concept contracts                           | Screen hierarchy, battle animation, feedback, accessibility, review diagnostics                    | All systems                                       | P1 presentation    |

## Dependency flow

`Seed + catalog version + lead choice -> world thesis -> coherent cast and typed six-turn plan -> whole-plan validation -> scene facts -> preparation -> deterministic combat -> rewards/consequences -> next scene state`

No system may invent a narrative fact outside this flow. Presentation may summarize authority but never replace it.

## Cross-system contracts

- `schemaVersion`, `catalogVersion`, `worldId`, `actId`, `turn`, `seed`, `recruitedHeroIds`, selected module IDs, signatures, and resolved fact IDs are shared causal state.
- Narrative references only recruited heroes. Recruitment becomes true before a joining hero enters combat.
- Combat consumes a frozen preparation plan and returns an immutable result report.
- Progression applies rewards once from that report; narrative reads the applied result.
- Generated display text is derived from typed facts and must not be parsed back into rules.
- Every displayed resource has at least one usable sink within the following two turns.
- The compiled plan is immutable. Runtime facts record outcomes without rewriting the promised causal structure.
- Every major choice binds at least one later consequence before the choice is displayed.
- Semantic signatures exclude seed and rendered wording.

## Delivery gates

1. Determinism: equal seed, catalog, lead, and choices produce equal content and combat.
2. Reachability: all six turns and the boss are reachable; no required resource sink deadlocks progress.
3. Coherence: no incompatible world terms, premature hero mentions, contradictory outcomes, missing facts, or unresolved promises.
4. Balance: specified win-rate bands and at least two boss-winning builds.
5. Readability: battle result is explainable from visible beats without opening the full log.
6. Structural diversity: the canonical 1,000-seed corpus yields at least 500 distinct structural signatures and 100 mechanical hero-kit fingerprints.
7. Completeness: every act has six turns, four to six battles, two correctly timed recruits, one boss, and no missing payoff.
8. Performance: six-turn compilation completes within 50 ms p95 on the reference desktop browser.
