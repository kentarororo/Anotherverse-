# Anotherverse rulebook crosswalk

This is the clean-room contract for adapting structural lessons from the supplied _Player’s Basic Rules_ into Anotherverse. It does not license copying that game’s prose, setting, terminology, characters, formulas, interface, or art.

## Playwrite contract

- Player role: guide a three-person hunter party whose choices become the next chapter of its legend.
- Canonical loop: **Brief → Plan → Autobattle → Aftermath → Memory**.
- Canonical promise: every visible choice names its mechanical effect before commitment; every result shows the cause that produced it.
- Tone: mythology × progression fantasy. Concrete people, monsters, prices, promises, and places take priority over administrative or technological abstraction.
- Canonical terms: Mythic Path, Path Rank, hunter, trial, descent, relic, AP, HP, Ward, Provisions, Renown, Danger, Soul Ledger.
- Forbidden drift: licence, telemetry, breach authority, signal network, contract-grade, procedural record, or unexplained invented nouns in player-facing prose.
- Causal trace: **world law → present danger → player plan → deterministic rule → visible battle event → consequence → campaign fact**.

## Adopt / adapt / replace / omit

| Source pages    | Structural lesson                                                  | Decision | Anotherverse owner                           | Visible proof                                           | Test                                    |
| --------------- | ------------------------------------------------------------------ | -------- | -------------------------------------------- | ------------------------------------------------------- | --------------------------------------- |
| 2–3, 63         | Describe situation, choose an action, resolve it, state the result | Adapt    | Scenario director, Command screen, Aftermath | Brief, exact plan rules, battle, causal recap           | First-contact player can explain Turn 1 |
| 3–4             | Specific rules override general rules                              | Adapt    | Technique contracts and combat policy        | Technique card names its legal condition and effect     | Policy unit tests                       |
| 4, 57–62        | One readable core resolution                                       | Replace  | Deterministic five-stat combat engine        | Forecast and structured combat events                   | Seed replay equality                    |
| 6–10, 20, 33–36 | Identity, role, ideal, bond, and flaw reinforce play               | Adapt    | Background → Path Class → Mythic Path        | Defining choice, Bond, Flaw, class feature, unique Path | Generated trio schema test              |
| 9, 64–65        | Party order changes exposure                                       | Adapt    | Position target rules                        | Front/centre/rear show exact enemy behaviour            | Combat target tests                     |
| 43–47           | Equipment properties create counterplay                            | Adapt    | Relic/equipment definitions                  | Relic states stat and enemy counter tag                 | Equipment tests                         |
| 67–68           | Recovery creates resource decisions                                | Adapt    | HP, readiness, Provisions                    | Aftermath shows carryover and recovery cost             | Multi-turn tests                        |
| 69–73           | Ordered combat and bounded actions                                 | Adapt    | Autobattle initiative and policy             | Rounds, AP, techniques, reactions                       | Combat report tests                     |
| 73–75           | Show target, modifier, resolution, damage/status                   | Adapt    | Structured combat events                     | Playback plus exact battle log                          | Report schema tests                     |
| 75–76, 106      | HP, temporary protection, and non-stacking conditions              | Adapt    | HP, Ward, status engine                      | HP/Ward/status changes in events                        | Combat rule tests                       |
| 78–81           | Abilities need a consistent data block                             | Adapt    | Character technique schema                   | Action, purpose, AP, cooldown, condition                | Authoring validation                    |
| 10              | Rank changes capability and story scope                            | Adapt    | Path progression                             | Rank names and Path mastery hooks                       | Progression tests                       |
| 107–111         | Gods and factions need domain, goal, method, and flaw              | Adapt    | Campaign bible                               | Myth law, progression law, active faction motive        | Campaign generation test                |
| 112–114         | Combat truth and personality belong together                       | Adapt    | Character dossier                            | Stats, Path, desire, flaw, rules in one view            | Browser accessibility test              |
| 115             | Play matters more than prolonged character assembly                | Adopt    | Campaign creation                            | One review screen, then immediate Turn 1                | First-action timing gate                |

## Current implementation slice

The clean-room structure now covers the full first 20 turns. The three opening chapters establish the selected realm and trio; every later module remains mythology-first and binds two live campaign facts. Every brief exposes Hook → Why now → Stakes → Decision, every response declares exact Renown, Provisions, Danger, and Bond deltas, and every resolved choice becomes Soul Ledger memory. Oathward, Doomseeker, and Fateweaver are Anotherverse's original base classes; each hero then carries a distinct Mythic Path, biography, techniques, flaw, bond, and awakening requirement.
