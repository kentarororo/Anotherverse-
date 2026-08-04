# First Playable Slice acceptance ledger

This ledger maps the master brief to current authoritative evidence. A green command is not treated
as proof unless a named test exercises the requirement.

## Automated gates

| Requirement                                                                                                                | Evidence                                                                                        | Status                   |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------ |
| Strict TypeScript, Vite, React, Zustand, Zod, Vitest, Playwright, CSS, LocalStorage boundary                               | `package.json`, `tsconfig.app.json`, `src/persistence`, `npm run check`, `npm run test:browser` | Pass                     |
| Same seed and commands produce byte-equivalent state and reports                                                           | `engine.test.ts` deterministic reducer/battle tests; `director.test.ts` 20-turn replay          | Pass                     |
| Save/resume preserves the future                                                                                           | `persistence.test.ts`; `full-campaign.spec.ts` reload after Turn 10                             | Pass                     |
| Narration cannot change mechanics/RNG                                                                                      | `rng.test.ts`; `narrative.test.ts` mutation snapshot                                            | Pass                     |
| No production `Math.random`                                                                                                | `scripts/guard-random.mjs`, run by `npm run check`                                              | Pass                     |
| 100 generated trios: unique names, coverage, signatures, limitations, reactions, hooks, ≥90 fingerprints                   | `generation.test.ts`                                                                            | Pass                     |
| Typed grammar and unresolved-slot rejection                                                                                | `grammar.test.ts`; `corpus-review.test.ts`                                                      | Pass                     |
| Fixed 100-paragraph corpus, strict fact roles, scene-specific choices, and content-hashed review scores                    | `corpus-review.test.ts`; `director.test.ts`; `corpus-review.spec.ts`; `/?review=corpus`         | Pass (structure)         |
| First 20 turns contain five categories and no repeated fingerprint                                                         | `director.test.ts`; `full-campaign.spec.ts`                                                     | Pass                     |
| Every battle terminates by Round 12                                                                                        | `engine.test.ts`; 25-seed executable generation test                                            | Pass                     |
| HP, resource, and status changes are structured and traceable                                                              | `engine.test.ts`; `CombatEventSchema`                                                           | Pass                     |
| Forecast is plan-sensitive and does not consume combat RNG                                                                 | `engine.test.ts`                                                                                | Pass                     |
| Formation, stance, priority, signatures, limitations, reactions, equipment, and six statuses alter mechanics               | `engine.test.ts`; `progression.test.ts`; `policy.test.ts`                                       | Pass                     |
| Six starting techniques execute with authored conditions, costs, and cooldowns                                             | `engine.test.ts` second-technique/cooldown tests                                                | Pass                     |
| Four complete narration frames for every combat event type                                                                 | `narrative.test.ts`; 28 modules in `contentManifest`                                            | Pass                     |
| Four distinct operation encounters align scenario, enemies, forecast, and Bestiary                                         | `director.test.ts` operation-variety test; `full-campaign.spec.ts`                              | Pass                     |
| Every scenario references two active facts and every resolution writes memory                                              | `director.test.ts`; visible **Why now** record in Command screen                                | Pass                     |
| Memory changes later weighting; urgent threads pre-empt; contradictions are rejected visibly                               | `director.test.ts`                                                                              | Pass                     |
| Equipment counters, Bestiary confidence, supplies, reputation, rank, relationships, Calling rank, and training affect play | `progression.test.ts`; `engine.test.ts`; 20-turn browser test                                   | Pass                     |
| Autosave on creation/action/equip/learn; corrupt/schema-7 recovery; confirmation before replacement                        | `persistence.test.ts`; `foundation.spec.ts`                                                     | Pass                     |
| Title Settings, 1365×768 loop, sticky Take Action, 125% text, reduced motion, keyboard focus return                        | `foundation.spec.ts`                                                                            | Pass                     |
| Playback waits for visibility; units remain mobile-contained; canonical HP, cues, and recipient states match events        | `battle-playback.test.tsx`; `foundation.spec.ts`                                                | Pass                     |
| Planning and battle stages expose five stable unit art slots, an arena slot, VFX slots, and reduced-motion action review   | `battle-playback.test.tsx`; `foundation.spec.ts`; `ART_PIPELINE.md`                             | Pass (CSS placeholders)  |
| Real UI completes 20 turns, equips both rewards, develops all heroes, reloads, and archives all reports                    | `full-campaign.spec.ts`                                                                         | Pass                     |
| GitHub Pages build uses `/Anotherverse-/` and deploys `dist` from `main`                                                   | `vite.config.ts`; `.github/workflows/pages.yml`                                                 | Pass; deploys after push |

## Human gates

| Requirement                                                                                                    | How to verify                                              | Status                  |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------- |
| Read aloud 100 fixed paragraphs: at least 95 natural and 85 coherent                                           | Deploy, open `/?review=corpus`, read and score all entries | Pending fresh v2 review |
| After 20 turns, explain hero distinctions, next preparation, causal event, progression goal, and battle result | Follow `PLAYTEST.md` on the deployed build                 | Pending human playtest  |

The First Playable Slice must not be marked complete until both human rows pass. If either fails,
fix state, forecasts, logs, memory, grammar, or hierarchy before adding more content.
