# Anotherverse

A deterministic browser prototype for a three-character auto-battle RPG management simulation.
The project is a clean-room implementation and currently contains **Milestone 0: Repository and
Contracts** only.

**Web playtest:** <https://kentarororo.github.io/Anotherverse-/>

## What runs now

- A title screen with New Campaign, Continue, Settings, version, and an advanced seed input.
- A compact Command screen shell showing the intended trio, operation, decision/forecast, and event
  feed hierarchy.
- A pure TypeScript command reducer with the complete serialisable `GameCommand` contract.
- Seven independently derived named RNG streams: world, characters, scenarios, enemies, rewards,
  combat, and narration.
- Zod runtime schemas for canonical state, campaign facts, story threads, generated definitions,
  combat/aftermath reports, content manifest, and save envelopes.
- One LocalStorage autosave behind a replaceable `SaveRepository` interface, including explicit
  corrupt and incompatible-save results.
- A corpus renderer contract that can later be joined by an optional LLM renderer without changing
  authoritative mechanics.

## Deliberately stubbed

Hero generation, scenario selection, planning controls, combat, forecasts, progression, rewards,
and corpus expansion belong to later milestones. Their contracts or screen regions exist, but the
Milestone 0 UI does not pretend they are playable. Only `START_CAMPAIGN` mutates simulation state;
later commands fail with an explicit `MilestoneNotReadyError`.

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

Run the non-browser Milestone 0 gate in one command:

```bash
npm run check
```

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
