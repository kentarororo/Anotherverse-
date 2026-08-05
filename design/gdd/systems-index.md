# Anotherverse — Systems Index

Status: **Approved for the six-turn slice**

| System                  | Authority                                                    | Owns                                                                            | Depends on                           | Slice priority                      |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------ | ----------------------------------- |
| Combat & Preparation    | [combat-preparation.md](systems/combat-preparation.md)       | Formation, stance, priority, actions, encounter resolution, battle readability  | Heroes, enemies, progression loadout | P0                                  |
| Progression & Economy   | [progression-economy.md](systems/progression-economy.md)     | Stats, XP, level, Awakening, rewards, inventory, recovery, fusion               | Combat results, content catalog      | P0                                  |
| Narrative & Recruitment | [narrative-recruitment.md](systems/narrative-recruitment.md) | Six-turn arc, scene facts, choices, companion timing, relationship consequences | World content, combat encounter IDs  | P0                                  |
| Content Generation      | [content-generation.md](systems/content-generation.md)       | Seeded selection, compatibility rules, templates, validation, diversity         | Entity and terminology registries    | P0                                  |
| Presentation            | Existing UI plus concept contracts                           | Screen hierarchy, battle animation, feedback, accessibility                     | All four systems                     | P1; no separate rules authority yet |
| Save & Replay           | Existing implementation                                      | Seed, schema, deterministic restoration                                         | All state-owning systems             | P1; preserve while migrating        |

## Dependency flow

`Seed + world pack → coherent cast and act plan → scene facts → preparation → deterministic combat → rewards/consequences → next scene state`

No system may invent a narrative fact outside this flow. Presentation may summarize authority but never replace it.

## Cross-system contracts

- `worldId`, `actId`, `turn`, `seed`, `recruitedHeroIds`, and resolved fact IDs are shared causal state.
- Narrative references only recruited heroes. Recruitment becomes true before a joining hero enters combat.
- Combat consumes a frozen preparation plan and returns an immutable result report.
- Progression applies rewards once from that report; narrative reads the applied result.
- Generated display text is derived from typed facts and must not be parsed back into rules.
- Every displayed resource has at least one usable sink within the following two turns.

## Delivery gates

1. Determinism: equal seed + choices produce equal content and combat.
2. Reachability: all six turns and the boss are reachable; no required resource sink deadlocks progress.
3. Coherence: no incompatible world terms, premature hero mentions, or contradictory outcomes.
4. Balance: specified win-rate bands and at least two boss-winning builds.
5. Readability: battle result is explainable from visible beats without opening the full log.
