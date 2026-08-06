# Technical Preferences

Status: Configured

Last verified: 2026-08-06

## Engine & Language

- **Runtime**: Browser application built with React 19.2 and Vite 8.2.
- **Language**: TypeScript 7, strict mode, ES2022 target.
- **Rendering**: React DOM, CSS, and lightweight 2D sprite/animation layers. No canvas or game-engine dependency is required for the current slice.
- **State**: Zustand 5 for application state; pure TypeScript modules own simulation and generation rules.
- **Validation**: Zod 4 at authored-data and persistence boundaries.
- **Hosting**: Static GitHub Pages deployment under `/Anotherverse-/`.

## Input & Platform

- **Target Platforms**: Current evergreen desktop and mobile browsers.
- **Input Methods**: Keyboard and mouse are primary; responsive touch is supported for all required play actions.
- **Primary Input**: Mouse/pointer with keyboard focus and activation equivalents.
- **Gamepad Support**: None for this milestone.
- **Touch Support**: Responsive touch targets; no hover-only information or gesture-only actions.
- **Platform Notes**: The game must run without a server, live model, network API, or filesystem access after the static bundle loads.

## Naming Conventions

- **Types and React components**: PascalCase.
- **Functions, variables, and Zustand actions**: camelCase.
- **Events and facts**: stable kebab-case identifiers.
- **Source files**: kebab-case for domain modules; PascalCase for React components.
- **Tests**: `*.test.ts` or `*.test.tsx` beside the existing test suite.
- **Constants**: SCREAMING_SNAKE_CASE only for true module-level constants; otherwise descriptive camelCase.

## Performance Budgets

- **Target framerate**: 60 fps during battle playback and UI animation.
- **Frame budget**: 16.67 ms; campaign compilation must not occur inside an animation frame loop.
- **Campaign compilation**: 50 ms p95 for one six-turn act on a reference desktop browser; yield or move work off the critical interaction path if the catalog grows beyond this budget.
- **Initial JavaScript**: Preserve the current static-site model and avoid large runtime generation dependencies.
- **Memory ceiling**: 150 MB working set target on desktop; one compiled campaign plus catalogs must remain below 10 MB serialized.

## Testing

- **Unit and integration**: Vitest 4 with jsdom and Testing Library.
- **Browser journeys**: Playwright 1.62 against Chromium.
- **Required suites**: deterministic RNG guard, compiler schemas, compatibility filtering, causal graph validation, prose validation, semantic diversity, combat/progression integration, save/load, and critical browser journeys.
- **Coverage policy**: Every Logic and Integration story has tests for each acceptance criterion. Coverage percentage is secondary to explicit behaviour coverage.

## Forbidden Patterns

- `Math.random`, current time, array iteration order, or browser-global entropy in generation or simulation.
- Parsing player-facing prose to recover mechanics or causal state.
- Free-form noun/clause splicing that bypasses typed facts and complete sentence templates.
- React components owning combat, generation, progression, or narrative rules.
- Hidden mutation of a compiled campaign plan after it is committed.
- Network or live-LLM dependencies in the playable campaign path.
- Cross-world vocabulary unless a module explicitly declares an authored crossover contract.

## Allowed Libraries / Addons

- React, React DOM, Zustand, and Zod as pinned in `package.json`.
- Vite, Vitest, Testing Library, Playwright, and Prettier for development.
- New runtime dependencies require an Accepted ADR and a bundle/performance justification.

## Architecture Decisions Log

- [Architecture ADR-0001: Deterministic Typed Campaign Compiler](../../docs/architecture/adr-0001-campaign-compiler.md)
- [Design ADR-0001: Mythology x Manhwa Canon and Six-Turn Slice](../../design/adr/0001-mythic-manhwa-vertical-slice.md)

## Engine Specialists

- **Primary**: Web/TypeScript technical director.
- **Language/Code Specialist**: TypeScript gameplay programmer.
- **Shader Specialist**: Not required; consult a web graphics specialist before adding WebGL shaders.
- **UI Specialist**: React UI programmer with responsive and accessibility review.
- **Additional Specialists**: Narrative systems designer for corpus and renderer contracts; QA automation for seeded property tests.
- **Routing Notes**: Domain logic belongs in pure TypeScript. React work must consume domain contracts rather than create them.

### File Extension Routing

| File Extension / Type            | Specialist to Spawn                           |
| -------------------------------- | --------------------------------------------- |
| `.ts` domain and simulation code | TypeScript gameplay programmer                |
| `.tsx` and CSS UI                | React UI programmer                           |
| JSON/YAML/content catalogs       | Narrative systems designer plus schema review |
| Test files                       | QA automation specialist                      |
| General architecture review      | Web/TypeScript technical director             |
