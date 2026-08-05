# Anotherverse

A deterministic browser prototype for a three-character auto-battle RPG management simulation.
The project is a clean-room implementation and currently contains **v0.12: Living Company Slice**.

**Web playtest:** <https://kentarororo.github.io/Anotherverse-/>

## What runs now

- A clean title screen with New Campaign, Continue, accessible display settings, version, and an
  advanced seed input.
- A deterministic campaign generator with two mythology-first realms, six complete hero identities,
  distinct colourful origins, and balanced internal class archetypes.
- A campaign creation screen where the player chooses one of three complete starting heroes without
  being shown a Tank, Damage, or Support label.
- The two unchosen candidates never enter canonical campaign state. Chapter 1 starts with a solo
  autobattle, Chapter 2 generates and introduces the first companion, and Chapter 3 generates the
  second companion before the first full-company battle.
- Original Oathward, Doomseeker, and Fateweaver classes beneath each hero's unique Mythic Awakening, with executable signatures, limitations,
  reactions, six starting techniques, authored conditions/costs/cooldowns, hooks, and awakening
  conditions.
- Two complete, world-specific four-act quests covering all 20 chapters, with recurring allies,
  enemies, locations, objectives, and chapter payoffs.
- A deterministic quest director that selects whole authored chapters and binds only safe names,
  locations, enemies, and prior results. It never assembles plots from random sentence fragments.
- Persistent WorldFacts that store the authored result of a choice, so the next chapter can quote
  what actually happened instead of reinterpreting a button label.
- Build-time validation for unresolved slots, chapter order, choice count, forbidden meta language,
  and unsupported procedural substitutions.
- Levels, experience, training points, Hunter ranks, Renown, Rations, Coin, relic dust, Awakening
  techniques, forged equipment, and relationship bonds that affect later situations.
- Bestiary intelligence that raises forecast confidence and equipment counter tags that resolve in
  authoritative combat events.
- Contextual character, inventory, Bestiary, world-memory, archived-log, and development inspector
  drawers.
- Two solo opening encounters, four core battles, and three choice-bound secret encounters with ten
  enemy modules and ten named monster materials, played through the real Command screen.
- A deterministic Forge that consumes any three monster materials. Each material changes visible
  weapon/support and charger/hexer odds; one seeded reward draw creates an equippable relic.
- Formation, stance, and team-priority controls that measurably change target selection, action
  policy, mitigation, and deterministic outcomes.
- Scored legal-action policies whose visible weights and failed conditions appear in the
  development inspector.
- A discrete-round auto-battle with explicit HP, resource, hit, mitigation, status, signature,
  defeat, and twelve-round-cap events.
- A two-lane battle playback that shows every action in order at a readable 800 ms pace, with
  canonical HP, actor/target highlights, pause/replay/skip, and reduced-motion manual advance.
- A 2D formation preview and six-combatant arena presentation with distinct role/enemy
  silhouettes, event VFX placeholders, stable Awakening/enemy/arena asset IDs, and safe CSS fallbacks.
- Visible VIT, POW, GRD, SPD, FOC, and AP numbers on the command screen, plus plan effect,
  post-battle squad HP retention, level progress, and formation review.
- Reduced-motion battle review that starts on the first stable action frame and advances manually
  instead of skipping the battle entirely.
- A plan-sensitive forecast that never consumes the authoritative combat RNG stream.
- A readable battle chronology with expandable exact mechanics and a persistent Aftermath report.
- One stable plain-English narration frame for every structured combat event type; rendering never
  advances or mutates simulation RNG.
- A pure TypeScript command reducer with the complete serialisable `GameCommand` contract.
- Seven independently derived named RNG streams: world, characters, scenarios, enemies, rewards,
  combat, and narration.
- Zod runtime schemas for canonical state, campaign facts, story threads, generated definitions,
  combat/aftermath reports, content manifest, and save envelopes.
- One LocalStorage autosave behind a replaceable `SaveRepository` interface, including explicit
  corrupt and incompatible-save results.
- Save schema 14 deliberately rejects older campaigns that pre-created unchosen heroes or cannot
  reconstruct the selected lead, generated companions, material inventory, and Forge history.
- A corpus renderer contract that can later be joined by an optional LLM renderer without changing
  authoritative mechanics.

## Deliberately stubbed

The current slice contains two complete 20-chapter quests and one compact ten-material Forge pool.
Equipment affixes and Awakening growth remain intentionally compact while the core loop is validated.

## Setup and verification

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Quality commands:

```bash
npm run format:check
npm run guard:random
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

The browser suite includes a complete 20-turn campaign, forged equipment and Awakening progression, every
situation category, archived reports, and a save/reload continuation after Turn 10.

Run the non-browser First Playable Slice gate in one command:

```bash
npm run check
```

The final human quality gate is documented in [`PLAYTEST.md`](./PLAYTEST.md).
The fixed 100-paragraph read-aloud harness is available at `/?review=corpus` without adding
anything to the normal title screen.
The controlled Mythic Narrative v2 prototype is available at `/?review=mythic-v2`. It compares
deterministic mythology × progression-fantasy drafts built from complete authored worlds, fixed
hero identities, role-compatible relics, whole chapter variants, and immutable combat rules. Its
four review judgments are stored locally per seed and do not change a campaign save.
The requirement-by-requirement evidence ledger is in [`ACCEPTANCE.md`](./ACCEPTANCE.md).
The single editable story source, authoring worksheet, and validation rules are documented in
[`STORY_AUTHORING.md`](./STORY_AUTHORING.md).
The asset-ready pixel-art production contract, stable ID mapping, first generation batch, and
clean-room prompt templates are in [`ART_PIPELINE.md`](./ART_PIPELINE.md).

## Web deployment

Every push to `main` runs the quality gate, builds with Vite's `/Anotherverse-/` base path, and
deploys `dist` to GitHub Pages. The deployment can also be started manually from the
`deploy-pages` workflow in the Actions tab.

For the first deployment, open the repository's **Settings > Pages** page and set **Source** to
**GitHub Actions**. After the workflow succeeds, the prototype is available at:

<https://kentarororo.github.io/Anotherverse-/>

## Boundaries

```text
UI -> application store -> validated GameCommand -> pure engine reducer -> canonical state/report
                                      |
                                SaveRepository

structured report -> NarrativeRenderer -> player-facing language
```

React components display state and emit intent. They contain no authoritative simulation rules,
random draws, combat timers, or content decisions. Tests and the production browser import the same
validated content manifest from `src/content/manifest.ts`.
