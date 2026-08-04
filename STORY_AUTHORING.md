# Anotherverse story authoring

Anotherverse does not need an online language model to produce coherent prose. It needs authored
story parts with strong boundaries. The game now selects one complete world and three complete
character arcs, then binds live names, consequences, enemies, and relationships into authored
four-beat scenes. It never builds a person by shuffling unrelated origins, traumas, motives, and
powers.

The single source to edit is
[`src/content/story/authoring.ts`](src/content/story/authoring.ts). Runtime validation rejects broken
IDs, missing scene slots, incomplete sentences, and story/mechanic contradictions before they reach
a player.

## The input that helps most

You can edit the TypeScript source directly, or send Codex the following worksheets in plain text.
You do not need to write code. Specific emotional and physical details are much more useful than a
request to "make it epic."

### 1. Story promise

Provide five short answers:

```text
The player should feel:
The heroes begin as:
The heroes are trying to become:
The recurring moral pressure is:
Content, tones, or themes to avoid:
```

Describe qualities in your own words. Do not provide whole novels or ask the generator to copy a
particular author. Useful direction sounds like "clear enough for a young reader, one irresistible
mystery per chapter, intimate friendships, visible growth, and consequences that return later."

### 2. One world pack

A world pack is chosen as a whole. Complete every line so its conflict can sustain a campaign:

```text
City name:
One image, sound, or smell that makes it recognisable:
What ordinary people do every day around magic:
The old disaster or injustice the city never repaired:
The civic authority and the promise it makes publicly:
The authority's blind spot:
The guild and what it offers heroes:
What rank pressure costs an unsuccessful squad:
One inviolable rule of breaches:
One inviolable rule of Callings:
How monsters grow, migrate, or feed:
The active faction's name:
Its respectable public face:
What it secretly intends to do (begin with a lower-case verb):
Recurring crisis site (a concrete place where danger can return):
Hidden route (a forbidden path into the world's mystery):
Public venue (where rank, hearings, and challenges are witnessed):
Public signal (the world's distinctive alarm, broadcast, or omen):
Record medium (how this world stores evidence people can contest):
Private refuge (where the heroes can safely speak or be found):
The image that opens chapter one:
The campaign's central unanswered question:
```

The secret motive must be playable. "Gain power" is too vague. "Own the missing transit record
before its survivors can challenge the city" creates evidence, witnesses, locations, opponents, and
choices.

Those six scene-vocabulary answers keep the selected world present after chapter one. Write each as
a short, setting-specific noun phrase: "the relic chimes inside the walls" is useful; "an alarm" is
not. Every scene brief binds at least one of these anchors, so a relic-city campaign cannot suddenly
behave like a transit-city campaign just because both use the same gameplay structure.

### 3. One character and Calling kit

Biography and power belong in the same kit. The formative event must cause both the present drive
and the Calling's visual language.

```text
Stable Calling ID (kebab-case):
Calling name:
Combat role (vanguard, striker, or support):
Age band (young-adult, adult, or veteran):
Where this person comes from:
The specific choice they made in the formative event:
What that choice cost:
What they want now:
What they fear will happen if they get it:
The contradiction that causes trouble with allies:
What they notice or think about that others miss:
Two unresolved hooks with people, objects, or evidence:
What the Calling looks, sounds, and feels like:
The personal act required for awakening (lower-case verb phrase):
```

A causality test should read cleanly:

```text
Because [formative choice] cost [specific loss], the hero now wants [drive] but fears [fear].
That conflict appears physically as [Calling manifestation]. Mastery requires [awakening act].
```

If those two sentences do not make sense, revise the kit before adding more detail.

### 4. A technique

Every technique has three different descriptions. Do not combine them:

```text
Name:
Visible action — what would the sprite and VFX show?
Tactical purpose — why would this hero choose it now?
Mechanical rule — exact cost, effect, duration, and cooldown:
Legal condition — exact stance, position, target state, and Resource requirement:
```

Example structure:

```text
Visible action: The bearer catches the enemy's force on a crescent shield, twists, and shatters its balance.
Tactical purpose: Use it to open a defended target for the squad's next attacks.
Mechanical rule: Spend 2 Resource to deal damage and apply Exposed for 2 rounds.
Legal condition: Requires an active target and at least 2 Resource.
```

The visible action should contain no unexplained game arithmetic. The mechanical rule should contain
no metaphor. If the mechanic changes, update the engine and its tests before changing the stable
mechanic ID.

### 5. A scene brief

Every brief is four complete sentences with four jobs:

1. **Hook:** a physical change the player can picture now.
2. **Cause:** a named earlier choice or fact that created this problem.
3. **Escalation:** a person, route, truth, relationship, or opportunity that will be lost by waiting.
4. **Decision:** why this squad must act and what kind of choice it faces.

Use only declared live slots such as `{lead}`, `{calling}`, `{priorReference}`, `{priorArtifact}`, or
the selected world's `{crisisSite}`, `{hiddenRoute}`, `{publicVenue}`, `{publicSignal}`,
`{recordMedium}`, and `{privateRefuge}`. `requiredSlots` must exactly match the unique slots in the
four sentences. A slot supplies a noun or causal reference; authored prose supplies meaning. Never
ask a slot to invent the plot.

Good causal movement:

```text
The squad released a sealed witness file last turn.
That choice lets the witness identify a new signal now.
The signal also reveals the witness's location to the faction.
The squad must choose between following the clue and protecting the person who made it possible.
```

Weak movement:

```text
Two recorded facts matter now. A mysterious danger appears. The squad must decide.
```

## What is safe to edit

- Rewrite `voice` at any time; it is the editorial contract used by reviewers.
- Add sensory detail, ordinary life, stakes, hooks, interior voice, and original prose freely.
- Rewrite world premises, portraits, and scene sentences while preserving their declared slots.
- Rewrite technique `visibleAction` and `tacticalPurpose` without changing gameplay.
- Treat IDs, rule IDs, technique IDs, costs, cooldowns, conditions, and `mechanicRule` as code-facing
  fields. Change them only with an engine/test update.
- Keep each `characterKits[].id` identical to its `calling.id`.
- Keep awakening conditions as lower-case verb phrases because the renderer inserts them after words
  such as "must" or "to."

## How freshness works offline

Freshness comes from recombination at safe boundaries:

- one of four complete worlds;
- one complete vanguard, striker, and support arc;
- live hero names and pronouns;
- one of four authored modules for each scene category;
- the actual enemies, relationship state, rank, prior choice, and consequence from this save;
- deterministic selection, so the same seed can always be reproduced and debugged.

The engine does not imitate an LLM one word at a time. That kind of unconstrained assembly is exactly
what made earlier paragraphs incoherent. It behaves more like a narrative game director: it selects a
valid authored scene, binds facts with the semantic roles that scene requires, and realises the result
through a checked prose frame.

## Validation workflow

After an edit, run:

```powershell
npm run typecheck
npm test
npm run build
```

Then read the fixed 100-paragraph corpus. Automated checks can catch broken grammar contracts and
wrong facts; they cannot decide whether a sentence is moving, vivid, or worth remembering. Score a
paragraph as coherent only when a new reader can answer: **where are we, what caused this, what is at
stake, and why must these heroes choose now?**
