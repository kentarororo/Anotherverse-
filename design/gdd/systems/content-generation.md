# System GDD — Bounded Content Generation

## Intent

Produce replayable variation through compatible authored structures, not free-form sentence roulette.

## Generation layers

1. Select one **world pack** with vocabulary, cosmology, places, factions, creatures, materials, and forbidden terms.
2. Select compatible **act skeleton**, enemy package, and consequence thread.
3. Generate candidates from complete **hero archetype templates**, then choose compatible origin, desire, flaw, name, Awakening, and technique modules.
4. Bind typed facts to complete scene templates.
5. Validate mechanics, chronology, cast, vocabulary, and prose before committing the campaign.

Randomness selects complete compatible modules. It does not splice arbitrary fragments inside a sentence.

## Compatibility rules

- Every module declares `worldTags`, `roleTags`, `mechanicTags`, required facts, produced facts, and exclusions.
- A world pack supplies all nouns used by its scenes; cross-world terms are forbidden unless an authored crossover explicitly permits them.
- Each generated hero has one combat job, one personal complication, one visible Awakening motif, and at least two executable techniques.
- Names, origin, skills, and lore are derived from the same identity seed.
- Enemy story description and mechanical behaviour share one entity ID.

## Determinism and memory

Generation uses a named seeded stream per layer so adding a cosmetic selection does not reroll mechanics. Persist selected module IDs and facts, not only rendered prose. The world memory records choices, battle results, recruitment, discovered counters, relationships, and unresolved threads.

## Required slice catalog

- 2 world packs, each internally complete.
- 2 six-turn act skeletons.
- 6 hero archetype templates with at least 3 compatible variants each.
- 9 core techniques and 6 Awakening modules.
- 8 enemy behaviours, 12 items, and 12 monster materials.
- 2 variants per scene function where safe: arrival, recruitment, recovery, consequence, boss approach.

## Quality controls

- Reject output with forbidden terminology, missing references, duplicate identities, unbound placeholders, impossible requirements, or an unrecruited cast member.
- Semantic-diversity tests compare module IDs and consequence shapes, not word differences alone.
- A review mode prints seed, selected modules, facts, encounter rules, and rendered transcript.
- Failure falls back to a complete validated authored configuration; it never publishes partial gibberish.
