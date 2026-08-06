# Campaign Compiler Adversarial Review

**Scope:** Deterministic six-turn campaign compiler milestone  
**Review posture:** Reject cosmetic variation presented as procedural storytelling  
**Corpus reference:** `fantasy-procgen-corpus-v2.md`

## Player-facing hypothesis

The same tactical game can feel like a new story on each run only when a generated act preserves one world identity and a causal chain of setup, decision, consequence, and payoff. Different seeds, names, adjectives, prose, or small stat changes do not count as different stories by themselves.

## Automated release gates

The focused adversarial suite at `src/tests/campaign-compiler-adversarial.test.ts` owns the following machine-checkable gates:

- The same seed compiles to byte-equivalent content.
- At least 500 structural fingerprints occur across 1,000 fixed seeds.
- Structural fingerprints ignore seed text, names, rendered prose, and stat jitter.
- Every referenced entity, scene, fact, encounter, and cast member resolves to a declared identifier.
- Every required fact exists before the scene that consumes it.
- A hero cannot appear in scene cast before the hero's introduction or recruitment turn.
- Every rendered scene stays inside the selected world's allowed vocabulary and avoids terms forbidden by that world pack.
- Each six-turn act contains four to six combat encounters.
- Every promised payoff is resolved by the end of the act.
- Miracles, when enabled, occur in 3% to 8% of sampled acts and never more than once in one act.

These tests deliberately measure structure rather than `semanticFingerprint` uniqueness alone. A generator fails if it can pass by including the input seed, generated names, prose, or numeric noise in its fingerprint.

## Human review still required

Automation cannot establish that prose reads like a good fantasy novel, that a revelation feels earned, or that a decision is emotionally interesting. Before release, a human reviewer should read at least 20 complete acts selected before seeing their outputs and record:

- Does every sentence have a clear subject, action, and object?
- Can the reviewer explain the immediate goal and danger after the opening scene?
- Do names and mythology remain recognizable throughout the act?
- Does each choice express a real trade-off rather than the same outcome in different words?
- Does at least one later scene visibly remember an earlier decision?
- Does the ending answer or transform the act's opening question?
- Do class, skill, enemy, and item descriptions accurately describe their executable mechanics?
- Is any paragraph technically grammatical but still unnatural, overpacked, vague, or pseudo-profound?

Passing automated gates is necessary, not sufficient. Human prose approval must not be inferred from a green test run.

## Corpus-specific risks

The supplied corpus is valuable as a tagged source ontology, but its paragraph templates and sentence fragments are unsafe as direct random tables. Review should reject:

- accidental mixing of `[EPIC]` and `[SYS]` registers inside one world identity;
- a system notification, rank, floor, sect, crown, or oath appearing without being introduced as part of that world's rules;
- character archetypes changing labels while retaining identical drives and story functions;
- promises such as betrayal, blood debt, hidden rank, or divine cost that never return as playable consequences;
- generated Asian-adjacent syllables used without a consistent naming culture;
- references to outside titles or recognizably copied proper nouns in player-facing output.

## Execution evidence

Focused command: `npm test -- --run src/tests/campaign-compiler-adversarial.test.ts`

First run: **5 passed, 1 failed** in 1.87 seconds.

Blocking finding:

- A celestial `sunken-heaven` campaign selected the beast-domain antagonist `beast-broker`. Its player-facing text repeatedly used `guardian beast`, vocabulary owned by the unselected beast world pack. This is structural incompatibility, not a wording typo. The compiler must filter antagonist and arc candidates by compatible world-domain tags before selection.
- The same run exposed an ungrammatical encounter-stakes composition: `Win before [antagonist] can [complete escalation sentence]`. The escalation field is a complete sentence and cannot safely occupy a verb slot. It needs its own complete-sentence renderer or a separately authored infinitive clause.

The repair added explicit compatible-domain declarations to arc, antagonist, encounter, and reward modules, then filtered every selection through the chosen world domain. Encounter stakes were changed to two complete sentences. The final vocabulary gate verifies those semantic compatibility contracts, selected-world terminology, reference resolution, and forbidden vocabulary; it does not reject a compatible module merely because two authored catalogs share an ordinary phrase.

Final rerun: **6 passed, 0 failed** in 620 milliseconds of test execution.

Passing gates: deterministic output, at least 500 structural fingerprints across 1,000 seeds, cosmetic-fingerprint resistance, causal/reference closure, four-to-six combat encounters, all eight enemy behaviours, cast chronology, domain/vocabulary compatibility, payoff resolution, and miracle rarity/singularity.

Automated release status: **Passed.**

## 60-chapter read-aloud verdict

All 60 integrated review entries (10 deterministic acts of six chapters) were read in sequence. The first integrated pass was **rejected** despite passing grammar-shaped tests. Three repeated assembly defects made the campaigns sound generated rather than narrated:

1. Every chapter repeated `In [world], people understand the danger through the law of [term].`
2. Later chapters pasted raw result text back into the story as `An earlier choice still matters: The party survives the battle and claims ...`.
3. The same two antagonist sentences appeared in most chapters of an act, while every paragraph ended with `Choose what the party does next.`

Narrow repairs made after the read-aloud:

- World exposition now appears once in the opening instead of being injected into every beat.
- Encounter stakes use six turn-specific, complete constructions with escalating meaning.
- Previous decisions are realised through authored causal bridges for defensive, aggressive, protective, and opportunistic choices. The bridge changes with the chapter and recruitment chronology instead of quoting the event log.
- Non-combat chapters receive direct, two-sentence stakes.
- The repeated UI instruction was removed from narrative prose; the decision remains in its dedicated UI field.
- A regression gate now rejects the three failed assembly phrases and duplicate long sentences within one six-chapter act.

Human verdict after repair: **Conditional pass for this playable slice.** The text is coherent, chronological, domain-consistent, and readable aloud without gibberish or raw state-log language. The authored beats remain deliberately concise; this is passable game narrative, not yet the density or character interiority of a finished novel. A larger external playtest should still judge emotional attachment and choice quality.

Final regression: **103/103 Vitest tests and 12/12 Playwright journeys passed** after the read-aloud repairs. Typecheck, deterministic RNG guard, production build, and `git diff --check` also passed.
