# Anotherverse narrative authoring

Anotherverse uses a bounded offline story engine. It does not shuffle arbitrary fragments or imitate a novelist. Each campaign selects one complete world quest, then plays its authored chapters in order. Procedural variation is limited to details that keep their meaning: hero names, pronouns, origins, role-compatible partners, enemy names, locations, and the exact result of the previous choice.

## Canonical sources

- `src/content/mythic-review.ts`: the two realms, six fixed heroes, Mythic Paths, relics, and three opening chapters.
- `src/content/quest-arcs.ts`: the two four-act quests and their exact chapter choices, results, and effects.
- `src/content/path-classes.ts`: the original Oathward, Doomseeker, and Fateweaver class contracts.
- `src/engine/director/scenario-director.ts`: deterministic chapter selection and safe slot binding.
- `src/engine/simulation/apply-command.ts`: authoritative mechanics and storage of the selected authored result.

The quest arc is the story owner. The renderer may substitute a compatible name or concrete noun, but it may not invent a new motive, artifact, event, or causal link.

## Coherence rules

Every hero follows one visible chain:

```text
Background -> defining choice -> desire and bond -> flaw -> base class -> Mythic Path -> techniques -> awakening
```

Every campaign follows one visible chain:

```text
Central problem -> four act goals -> ordered chapters -> player action -> authored result -> next chapter
```

Every chapter answers four plain questions:

1. What changed?
2. What caused it?
3. What happens if the party waits?
4. What can the player do now?

Reject a chapter if a reader cannot answer those questions after one read. Reject any callback that changes the meaning of the earlier choice.

## Supplying your own world

You do not need to write code. Provide:

```text
Realm and region name:
One mythic law that nobody can break:
One progression law that changes how Paths evolve:
Five rank names:
The disaster people still live around:
Active faction, public face, and secret goal:
Dungeon threshold:
Forbidden route:
Public gathering place:
Distinctive omen:
Private refuge:
Central campaign question:
Four act titles and one goal for each act:
Themes or language to avoid:
```

Use physical nouns and ordinary verbs. "A stair appears when the sea retreats" can support monsters, routes, prices, and choices. "A mysterious convergence protocol" cannot.

## Supplying a hero

```text
Name and pronouns:
Base role (guardian, finisher, or keeper):
Background:
The defining choice they made:
What that choice cost:
What they want now:
The person, promise, or place they protect:
The flaw that endangers the party:
Mythic Path and its visible manifestation:
Two techniques - visible action, tactical purpose, and exact rule:
The personal choice required to awaken:
```

The base role maps to Oathward, Doomseeker, or Fateweaver. The unique Path personalises the legend without erasing the party job.

## Supplying a chapter

Write complete sentences for four beats:

1. Hook: a change the player can picture now.
2. Cause: the exact result of the previous chapter, or a stable fact already established by the quest.
3. Stakes: the person, place, promise, or resource that will be lost by waiting.
4. Decision: two incompatible actions in simple language.

Each choice also needs a complete authored result and exact effects:

```text
Choice label: a short command such as "Guard the ferry"
Forecast: what the hero expects before acting
Result: what actually happens, written as the first fact of the next chapter
Renown: integer
Provisions: integer
Danger: integer
Bond: integer
```

The result must name the visible action and the new condition it creates. Do not write "the choice becomes a fact," "the record remembers," or any sentence that exists only to explain the engine.

## Safe procedural variation

Allowed substitutions are whole, typed concepts: a realm, a complete hero, a role-compatible partner, a name, a pronoun, a location of the right kind, an enemy from the current encounter, or the unchanged authored result of the previous choice.

The engine must never turn a button label into an object, omen, motive, or prophecy. It must never join unrelated scene modules because they have matching tags. New variety comes from authoring another complete chapter variant or another complete quest arc.

Use `npm run check` for the engineering gate and `npm run test:browser` for the playable loop. The fixed read-aloud harness remains available at `/?review=corpus`.
