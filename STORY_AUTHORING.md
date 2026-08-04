# Anotherverse narrative authoring

Anotherverse uses a bounded offline narrative engine. It does not shuffle arbitrary sentence fragments or imitate a novelist. It selects complete worlds, complete heroes, and complete four-beat scene modules, then binds the current realm, faction, hero, Path, enemies, relationship, rank, and earlier decisions into the authored structure.

## Canonical sources

- `src/content/mythic-review.ts`: two whole realms, six fixed heroes, unique Mythic Paths, techniques, relics, and the three opening chapters.
- `src/content/path-classes.ts`: the original Oathward, Doomseeker, and Fateweaver class contracts.
- `src/narrative/corpus/scenario-modules.ts`: twenty mythology-first campaign modules and their exact choice effects.
- `src/engine/director/scenario-director.ts`: deterministic selection, live-fact binding, cooldowns, and semantic fingerprints.
- `src/narrative/realiser/scenario.ts`: grammatical slot binding and selected-world grounding.

The former administrative/technology corpus is legacy test material only. It is not registered by the production manifest and cannot be selected by a normal campaign.

## Coherence rule

Every hero follows one visible chain:

```text
Background → defining choice → desire/bond → flaw → base Path Class → unique Mythic Path → techniques → awakening
```

Every scene follows another:

```text
Hook → named cause from this save → concrete stakes → decision → exact effects → Soul Ledger fact
```

Reject a hero or scene when any arrow in either chain cannot be explained in one sentence.

## Supplying your own world

You do not need to write code. Provide:

```text
Realm and region name:
One mythic law that nobody can break:
One progression law that changes how Paths evolve:
Five rank names:
The disaster people still live around:
Active faction, public face, secret goal:
Dungeon threshold:
Forbidden route:
Public gathering place:
Distinctive omen:
How history is recorded:
Private refuge:
Central campaign mystery:
Themes or language to avoid:
```

Specific physical nouns beat invented jargon. “A stair revealed when the sea retreats” can support monsters, routes, prices, and choices. “A mysterious convergence protocol” cannot.

## Supplying a hero

```text
Name and pronouns:
Base role (guardian, finisher, or keeper):
Background name:
The defining choice they made:
What that choice cost:
What they want now:
The person, promise, or place they are bonded to:
The flaw that endangers the party:
Unique Mythic Path name and visible manifestation:
Two techniques—visible action, tactical purpose, exact rule:
The personal choice required to awaken:
```

The base role maps to Oathward, Doomseeker, or Fateweaver. The unique Path personalises the legend without erasing the party job.

## Supplying a scene

Write four sentences with four jobs:

1. Hook: a change the player can picture now.
2. Cause: a named earlier choice, faction goal, origin, or relationship.
3. Stakes: who or what will be lost by waiting.
4. Decision: two incompatible but intelligible responses.

Then state the exact effects of each response:

```text
Renown: integer
Provisions: integer
Danger: integer
Bond: integer
```

The prose may explain those effects, but it cannot invent a different result. Combat scenes leave these four deltas at zero because the deterministic battle report owns their rewards and danger.

## Safe procedural variation

Variation happens only at coherent boundaries: whole realm, region name, whole role-compatible hero, whole chapter variant, one of four modules per situation category, live names, actual monsters, current rank, relationship band, and prior Soul Ledger facts. Mechanics, identities, faction motives, and causal outcomes are never generated word by word.

Use `npm run check` for the engineering gate and `npm run test:browser` for the full playable loop. The fixed review harness remains available at `/?review=corpus`.
