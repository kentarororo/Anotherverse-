# System GDD - Procedural Campaign Compiler

Status: **Approved for implementation**

Authority: game concept, Design ADR-0001, Architecture ADR-0001

## 1. Summary and Intent

The campaign compiler creates a fresh mythology x manhwa opening act while preserving an understandable autobattler and progression game. It combines compatible authored worldbuilding, narrative, hero, enemy, reward, and miracle modules into one complete six-turn causal plan. Variation must change relationships, choices, conflicts, encounters, mechanics, or payoffs; changing names or adjectives is not enough.

The compiler is offline and deterministic. It does not imitate a live language model and does not invent arbitrary rules. It creates breadth by selecting and binding meaningful modules under strict compatibility and validation contracts.

## 2. Player Fantasy and Experience

The player should feel that they have stepped into a legend made for this run: one strange divine law, one rising threat, one hero with a personal reason to fight, two companions met through events, and choices that return later. The setting can surprise the player, but the English remains simple and the mechanical meaning remains clear.

Player-facing experience rules:

- One world vocabulary and mythology remain consistent for the act.
- The player chooses one starting hero without being shown hidden tank/damage/support labels.
- The other heroes do not appear until their on-screen recruitment turns.
- Each scene establishes cause, presents an action or choice, and shows a result.
- Four to six battles drive the act. Story supports preparation and consequence instead of delaying combat.
- Each reward, skill, item, material, relationship, and miracle changes or explains a playable rule.

## 3. Detailed Design

### 3.1 Authored module corpus

Every module declares a stable ID, schema/catalog version, world tags, role tags, mechanic tags, required facts, produced facts, exclusions, and references to executable mechanics where applicable.

The catalog contains:

- **World packs**: cosmology, divine law, naming culture, places, factions, creatures, materials, allowed vocabulary, forbidden vocabulary, and sensory palette.
- **Threats and faction conflicts**: goals, methods, stakes, compatible creatures, encounter behaviours, and escalation beats.
- **Act skeletons**: exactly six turn functions with fact sockets, choice/consequence sockets, promises, payoffs, and battle ranges.
- **Hero modules**: archetype job, origin, desire, flaw, relationship tension, Awakening motif, stat profile, and executable techniques.
- **Encounter modules**: enemy identity, story purpose, executable behaviour, readable tell, counters, terrain, reward hooks, and difficulty band.
- **Progression modules**: equipment, materials, fusion recipes or weighted outcomes, stat effects, and near-term sinks.
- **Miracle modules**: rare authored exceptions with trigger, benefit, cost or complication, executable rule, and later consequence.
- **Prose views**: complete sentence and paragraph templates that receive already-bound semantic facts.

Reference fiction and the supplied fantasy corpus inform taxonomy, rhythm, and worldbuilding coverage. Player-facing text must be original, direct, and written in Anotherverse's voice.

#### Corpus adaptation policy

The supplied corpus contains two source registers. Anotherverse does not expose those source tags to players and does not import every convention:

- The epic register supplies costly power, oath/blood/fate conflicts, fellowship pressure, succession disputes, sieges, marches, faction grievances, and victories with lasting costs.
- The manhwa/LitRPG register supplies visible numeric growth, hidden potential, class advancement, rival escalation, trial structures, breakthrough moments, and reputation consequences.
- Modern Gate City, hunter-licensing, association, system-notification, leaderboard, and operations language remains quarantined by the concept anti-pillars. Equivalent gameplay must be expressed through mythic institutions, trials, omens, rankings, or character observation in plain English.
- Corpus arc shapes are decomposed into typed functions and causal edges. Paragraph templates and combinable sentence fragments are references for coverage only; they are not copied or randomly concatenated.
- Epic power costs and manhwa progression unlocks should coexist: growth is exciting because the player sees what rises, while the world remains credible because exceptional power asks a price.
- A shared generated-name registry is authoritative for a run. A place, faction, item, or person is selected once and referenced by stable ID afterward.

### 3.2 Compilation stages

1. Validate seed and catalog version, then select one world pack and bind a `WorldThesis`: cosmology, power law, naming culture, threat, faction conflict, vocabulary, creatures, and materials.
2. Compile three compatible lead candidates for campaign creation. Hide formal combat-role labels while showing enough character and skill information for a meaningful choice.
3. After selection, promote the chosen lead, discard the two unchosen candidates from campaign canon, and compile two different companion identities and kits. Only the chosen lead begins recruited.
4. Select one six-turn act skeleton and bind its required narrative functions: solo, first recruitment, second recruitment, recovery/build, consequence, and boss.
5. Build a forward-only typed fact graph. Each turn declares requirements, offered choices, produced facts, promises, and payoffs.
6. Bind four to six executable encounters, including the act boss. Bind rewards and at least one useful recovery, equipment, or fusion decision.
7. Optionally bind a compatible miracle according to its rarity. A miracle never bypasses validation.
8. Validate the complete plan, calculate structural and mechanical signatures, then freeze it.
9. Render prose from typed view models when the relevant turn and result are displayed.

### 3.3 Compatibility and causality

- Cross-world nouns are forbidden unless an explicit authored crossover permits them.
- Names, origin, Awakening motif, skills, lore, and vocabulary derive from the same hero identity context.
- Enemy story identity and combat behaviour share one stable entity ID.
- A required fact must be produced by an earlier turn, initial state, or declared choice branch.
- A major choice must change at least one later encounter, reward, ally condition, available option, or ending state.
- A promise must have a payoff in a later turn or an explicit act-end continuation marker.
- Recruitment becomes true before a companion enters formation, battle, dialogue, or prose references.
- Rewards must have a meaningful use within the act or be clearly labelled as an act-end progression promise.

### 3.4 Determinism, memory, and failure

Generation uses named seeded streams for world, arc, cast, mechanics, rewards, miracles, and cosmetics. Adding a cosmetic option must not reroll mechanics. Saves persist versions, seed, selected module IDs, signatures, the compiled plan, player choices, battle results, recruitment, rewards, relationships, counters, and unresolved continuations.

Candidate search is bounded and deterministic. Invalid candidates record stable rejection reasons and are never published. Exhausted search selects a complete prevalidated fallback; it never shows partial prose or a mechanically impossible scene.

### 3.5 Required milestone catalog

- At least 4 complete world thesis combinations assembled from compatible world modules.
- At least 4 six-turn act skeletons with 2 or more safe variants for each scene function.
- 6 base hero archetypes with at least 4 compatible identity variants and enough mechanic combinations to produce 100 hero-kit fingerprints.
- At least 9 core techniques, 6 Awakening modules, 8 enemy behaviours, 12 items, 12 monster materials, and 8 meaningful fusion outcomes.
- At least 6 authored miracle modules, each with a cost or later complication.
- A combinatorial catalog capable of more than 10,000 potential semantic campaign signatures before compatibility rejection.

## 4. Formulas and Selection Rules

Candidate selection is weighted but never overrides hard compatibility.

```text
eligible(candidate) =
  requirementsSatisfied
  AND noExclusionConflict
  AND worldVocabularyCompatible
  AND allMechanicReferencesResolve
  AND causalEdgesRemainReachable
```

```text
score(candidate) =
  baseWeight
  + payoffCoverageBonus
  + mechanicNeedBonus
  + relationshipTensionBonus
  + noveltyBonus
  - recentModulePenalty
  - repetitionPenalty
```

The seeded stream samples only from the highest valid score band. Ties use stable module-ID ordering before deterministic sampling.

```text
structuralSignature = hash(
  worldThesisIds,
  actSkeletonId,
  turnFunctions,
  choiceConsequenceEdgeTypes,
  recruitmentContexts,
  encounterBehaviourSequence,
  payoffTypes
)
```

```text
mechanicalSignature = hash(
  heroStatProfiles,
  executableTechniqueIds,
  enemyBehaviourIds,
  itemEffectIds,
  miracleRuleIds
)
```

Seed, names, rendered prose, and cosmetic adjectives are excluded from both signatures.

Miracle occurrence is capped at one bound miracle per six-turn act for the milestone. Its authored rarity weight is evaluated only after all mandatory encounters, counters, and reward sinks are valid.

## 5. Edge Cases and Failure Behaviour

| Condition                                    | Required behaviour                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| No candidate satisfies a slot                | Backtrack deterministically within the bounded budget; otherwise use the complete fallback plan. |
| Choice branch cannot reach a payoff          | Reject the entire candidate plan before Turn 1.                                                  |
| Hero referenced before recruitment           | Reject with turn and hero ID; never delete the sentence to hide the logic error.                 |
| Module uses forbidden or foreign vocabulary  | Reject the module binding and report the exact token/module.                                     |
| Technique or item lacks executable mechanics | Reject at catalog validation time.                                                               |
| Duplicate hero identity or name              | Reselect from the cast stream; never append a random suffix in player prose.                     |
| A reward has no usable sink                  | Rebind reward/turn or reject the plan.                                                           |
| Miracle removes all boss challenge           | Require its declared cost/counter or reject it for this plan.                                    |
| Catalog wording changes                      | Mechanical and structural signatures remain equal.                                               |
| Catalog mechanic changes                     | Increment catalog version; existing saves retain their compiled plan.                            |
| Fallback also fails validation               | Stop new-game creation with a plain recovery message and a diagnostic code.                      |

## 6. Dependencies and Interfaces

- **Depends on**: entity and terminology registries, deterministic seed streams, executable combat techniques, enemy behaviours, progression items/materials, and validated prose templates.
- **Produces for Narrative**: world thesis, cast introductions, typed facts, choices, consequence bindings, promises, and payoffs.
- **Produces for Combat**: encounter IDs, enemy behaviours, terrain, readable tells, difficulty bands, and reward table IDs.
- **Produces for Progression**: hero kits, equipment/material drops, fusion opportunities, and Awakening promises.
- **Produces for Persistence**: schema/catalog versions, seed, selected module IDs, normalized signatures, immutable plan, and runtime-fact schema.
- **Produces for UI/Review**: player view models plus thesis, graph, binding, signature, and rejection diagnostics.

Rendered prose is a terminal view. No downstream system may parse it to recover a fact, item, rule, or identifier.

## 7. Tuning Knobs

| Knob                           | Milestone value                                 | Purpose                                                              |
| ------------------------------ | ----------------------------------------------- | -------------------------------------------------------------------- |
| Compiler attempt budget        | 64 complete-plan candidates                     | Bounds cost while allowing backtracking                              |
| Battles per act                | 4-6                                             | Keeps combat central                                                 |
| Miracle cap                    | 0-1 per act                                     | Preserves rarity and legibility                                      |
| Story before battle            | 60-140 words                                    | Limits text walls                                                    |
| Story after battle             | 20-80 words                                     | States result and consequence                                        |
| Recent module penalty window   | Previous 3 generated acts in review corpus only | Measures/catalog-tunes repetition; not persistent player history yet |
| Compilation budget             | 50 ms p95                                       | Protects first interaction                                           |
| Structural diversity gate      | At least 500 signatures / 1,000 seeds           | Rejects superficial variation                                        |
| Mechanical hero diversity gate | At least 100 kit fingerprints / 1,000 seeds     | Ensures progression/build variety                                    |

## 8. Acceptance Criteria

- [ ] Equal seed, catalog version, chosen lead, and player choices produce equal normalized plans, prose facts, and combat results.
- [ ] The canonical 1,000-seed corpus publishes zero invalid or partial plans.
- [ ] Those seeds produce at least 500 distinct structural signatures and 100 mechanical hero-kit fingerprints.
- [ ] Every plan contains exactly six ordered turns, four to six battles, two correctly timed on-screen recruitments, and one boss.
- [ ] Every major choice changes a later encounter, reward, ally condition, option, or ending state.
- [ ] Every promise has a later payoff or an explicit act-end continuation.
- [ ] No plan contains an unrecruited hero reference, missing fact, unresolved ID, mixed world vocabulary, unbound placeholder, impossible requirement, or duplicate identity.
- [ ] All displayed techniques, enemy behaviours, items, materials, fusion outcomes, and miracles resolve to executable mechanics.
- [ ] All eight required enemy behaviours are reachable across the canonical corpus.
- [ ] Corpus review exposes seed, thesis, selected modules, causal edges, encounters, rewards, signatures, and bounded rejection reasons.
- [ ] Plain prose stays within the concept word budgets and passes forbidden-term and placeholder validation.
- [ ] Compilation completes within 50 ms p95 on the reference desktop browser and performs no work in battle animation frames.
- [ ] Save/load restores the exact compiled plan and runtime facts without silently recompiling against newer content.
- [ ] If candidate search is exhausted, the player receives a complete validated fallback plan rather than partial content.
