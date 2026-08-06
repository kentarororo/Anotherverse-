# Campaign Compiler Retrospective — 2026-08-06

## Outcome

Anotherverse now compiles one deterministic mythology-first campaign before Chapter 1 and plays it as a six-chapter opening act. The selected world thesis constrains the arc, antagonist, encounters, rewards, vocabulary, promises, and payoffs. The runtime no longer selects chapters from the old twenty-turn rail.

## What shipped in this iteration

- Eight world theses, eight arc shapes, eight antagonist agendas, eight encounter suites, and eight reward styles with explicit domain compatibility.
- Typed campaign facts, transitions, promise setup/payoff edges, cast-introduction chronology, rare bounded miracles, and structural fingerprints.
- A chosen lead in Chapter 1 and two newly generated companions introduced in Chapters 2 and 3.
- Four to six autobattles per act, eight enemy behaviour profiles, stronger formation pressure, and a deliberately difficult finale.
- Procedural currency, named crafting materials, relic equipment, and a final skill unlock applied to canonical progression state.
- A choice consequence that returns three chapters later and can add an enemy reinforcement.
- Six-chapter UI, dynamic read-aloud review gate, schema-15 saves containing the exact compiled plan, and content hashing that includes the procedural catalogs.

## What the tests taught us

The first integrated run passed 77 tests and failed 26. Most failures were useful evidence that the old fixed twenty-turn quest rail still defined assumptions across progression, corpus review, UI, and browser tests. Migrating those tests clarified the new contract instead of preserving accidental legacy behaviour.

The adversarial compiler pass found two genuine defects:

1. Compatible world domains were not enforced across every module catalog, allowing cross-world vocabulary contamination.
2. A complete escalation sentence had been inserted into a verb slot, producing malformed stakes.

The browser pass later found the same class of grammar defect in a different renderer. The fix was structural: complete sentences now remain complete sentences, and previous outcomes are reduced to one readable sentence rather than pasted wholesale into later chapters.

## Verified evidence

- 1,000 deterministic plans: zero invalid plans in the adversarial suite.
- At least 500 distinct structural fingerprints across that corpus.
- All eight enemy behaviours reachable.
- Four to six battles in every compiled act.
- 103 of 103 Vitest tests passing.
- 12 of 12 Playwright journeys passing, including a full campaign and mid-run resume.
- TypeScript typecheck, deterministic RNG guard, static production build, and `git diff --check` passing.

## Remaining risks

- The 60-chapter read-aloud pass found and removed repeated assembly language. Its conditional pass establishes coherence for this slice, but cannot certify that every act is emotionally compelling.
- The current structural fingerprint proves story-shape diversity, but a separate mechanical hero-kit fingerprint and richer rejected-candidate diagnostics remain future tooling work.
- The production bundle is about 546 kB before gzip and triggers Vite's chunk-size warning. This does not block the current playable slice, but route-level code splitting should happen before a wider release.
- Pixel art slots are prepared, but final authored assets, animation timing polish, audio, and VFX remain presentation work.

## Next iteration

Use human read-aloud scores to revise weak authored modules rather than adding more fragments. After the prose gate, prioritize final pixel assets, clearer reward celebration, more equipment affixes, and longer campaigns assembled from multiple validated six-chapter acts.
