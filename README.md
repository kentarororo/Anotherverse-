# Anotherverse

A deterministic browser prototype for a three-character auto-battle RPG management simulation.
The project is a clean-room implementation and currently contains **v0.7: Tactical Arena**.

**Web playtest:** <https://kentarororo.github.io/Anotherverse-/>

## What runs now

- A clean title screen with New Campaign, Continue, accessible display settings, version, and an
  advanced seed input.
- A deterministic campaign generator with four whole world packs, nine whole character/Calling
  kits, and coherent seeded Campaign Bibles.
- A whole-campaign creation and regeneration screen with three complete generated hero dossiers.
- Generated vanguard, striker, and support Callings with executable signatures, limitations,
  reactions, six starting techniques, authored conditions/costs/cooldowns, hooks, and awakening
  conditions.
- A deterministic scenario director covering operation, personal, discovery, rival, and social
  situations with choice-specific consequences.
- Twenty typed scene modules that bind valid causal fact roles before rendering original,
  four-sentence scene arcs with decisions authored for that exact dilemma.
- Persistent WorldFacts, three-stage personal StoryThreads, semantic cooldowns, causal premise
  references, and visible director score reasons in canonical state.
- Typed grammar helpers and complete authored scenario frames with unresolved-slot validation.
- Levels, experience, training points, Calling ranks, licence ranks, supply recovery, Calling
  mastery, equipment rewards, and relationship bonds that affect later situations.
- Bestiary intelligence that raises forecast confidence and equipment counter tags that resolve in
  authoritative combat events.
- Contextual character, inventory, Bestiary, world-memory, archived-log, and development inspector
  drawers.
- Four distinct two-enemy operations with eight complete ecology/counterplay/reward modules, played
  through the real Command screen.
- Formation, stance, and team-priority controls that measurably change target selection, action
  policy, mitigation, and deterministic outcomes.
- Scored legal-action policies whose visible weights and failed conditions appear in the
  development inspector.
- A discrete-round auto-battle with explicit HP, resource, hit, mitigation, status, signature,
  defeat, and twelve-round-cap events.
- A compact two-lane battle playback with canonical HP, actor/target highlights, composed
  damage/status cues, pause/replay/skip controls, and visibility-gated mobile playback.
- A 2D formation preview and five-combatant arena presentation with distinct role/enemy
  silhouettes, event VFX placeholders, stable Calling/enemy/arena asset IDs, and safe CSS fallbacks.
- Visible VIT, POW, GRD, SPD, FOC, and AP numbers on the command screen, plus plan effect,
  post-battle squad HP retention, level progress, and formation review.
- Reduced-motion battle review that starts on the first stable action frame and advances manually
  instead of skipping the battle entirely.
- A plan-sensitive forecast that never consumes the authoritative combat RNG stream.
- A readable battle chronology with expandable exact mechanics and a persistent Aftermath report.
- Four complete deterministic narration frames for every structured combat event type; rendering
  never advances or mutates simulation RNG.
- A pure TypeScript command reducer with the complete serialisable `GameCommand` contract.
- Seven independently derived named RNG streams: world, characters, scenarios, enemies, rewards,
  combat, and narration.
- Zod runtime schemas for canonical state, campaign facts, story threads, generated definitions,
  combat/aftermath reports, content manifest, and save envelopes.
- One LocalStorage autosave behind a replaceable `SaveRepository` interface, including explicit
  corrupt and incompatible-save results.
- Save schema 9 deliberately rejects older campaigns whose generated characters predate the
  story/mechanic split and validated authored-world content hash.
- A corpus renderer contract that can later be joined by an optional LLM renderer without changing
  authoritative mechanics.

## Deliberately stubbed

The director supplies 20 non-repeating causal turns before its first content cycle. The current
equipment and growth corpus is intentionally compact so playtesting can validate decisions before
more modules are authored.

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

The browser suite includes a complete 20-turn campaign, equipment and Calling progression, every
situation category, archived reports, and a save/reload continuation after Turn 10.

Run the non-browser First Playable Slice gate in one command:

```bash
npm run check
```

The final human quality gate is documented in [`PLAYTEST.md`](./PLAYTEST.md).
The fixed 100-paragraph read-aloud harness is available at `/?review=corpus` without adding
anything to the normal title screen.
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
