# Architecture Control Manifest

Manifest version: 2026-08-06  
Authority: Architecture ADR-0001 and approved system GDDs

This is the implementation guardrail for the campaign compiler milestone. A story may strengthen a rule, but changing ownership or weakening a rule requires a new Accepted ADR.

## Foundation Layer

### Required

- Pure deterministic functions for RNG and catalog validation.
- Stable kebab-case module IDs and explicit schema/catalog versions.
- Separate named streams for `world`, `arc`, `cast`, `mechanics`, `rewards`, `miracles`, and `cosmetics`.
- Runtime validation at authored-data and save boundaries.

### Forbidden

- `Math.random`, wall-clock input, browser entropy, locale-sensitive sort, or unstable iteration as a decision source.
- Catalog records that combine incompatible worlds without an explicit crossover declaration.
- Player-facing prose as an authoritative identifier.

### Guardrails

- Catalog validation reports stable error codes and exact module IDs.
- Cosmetic stream consumption must not alter normalized mechanical output.

## Core Layer

### Required

- One immutable `WorldThesis` and one immutable `CampaignPlan` per new game.
- Six ordered `TurnPlan` records with typed requirements, outputs, choices, promises, and payoffs.
- Whole-plan validation before any scene is shown.
- Structural and mechanical signatures that exclude seed and rendered wording.
- Bounded deterministic retries plus a complete validated fallback.

### Forbidden

- Editing a committed plan to hide a failed prerequisite.
- Selecting prose before mechanics and causal facts are bound.
- A choice with no later consequence edge.
- A displayed skill, item, enemy rule, or miracle without executable mechanics.

### Guardrails

- Compilation p95 at or below 50 ms for a six-turn act.
- Exactly six turns, four to six encounters, two on-screen recruitments, and one boss.
- Only the chosen lead is recruited before Turn 1.
- All promises pay off within the act or are explicitly marked as act-end continuations.

## Feature Layer

### Required

- Runtime state records player choices, battle results, rewards, recruitment, relationships, counters, and unresolved continuations separately from the plan.
- Combat consumes a frozen preparation snapshot and returns an immutable result.
- Progression applies each reward once; narrative reads applied results.
- Saves persist plan, versions, selected IDs, signatures, and runtime facts.

### Forbidden

- Recompiling a loaded save against a newer catalog without an explicit migration.
- Mentioning or using an unrecruited hero.
- Granting a reward without a usable sink or meaningful planning effect.

### Guardrails

- Equal seed, catalog version, lead, and choices reproduce equal plans and results.
- Existing combat/progression behaviour remains covered during migration.

## Presentation Layer

### Required

- React consumes view models and invokes commands; it does not evaluate domain rules.
- Plain-English cause, action, and result; story payload remains within the concept budgets.
- Review mode displays thesis, modules, causal edges, signatures, encounters, and validation/rejection diagnostics.
- Keyboard focus and touch activation for every required action.

### Forbidden

- Parsing rendered prose for mechanics.
- Hiding required information behind hover only.
- Exposing raw internal diagnostics in normal player mode.
- Long text walls between battles or techno/operations terminology.

### Guardrails

- Battle playback targets 60 fps.
- New game reaches a meaningful choice within 90 seconds and battle within three minutes.

## Quality Gates

- 1,000-seed canonical corpus publishes no invalid plan.
- At least 500 distinct structural signatures and 100 mechanical hero-kit fingerprints.
- All eight enemy behaviours reachable.
- No unresolved reference, vocabulary leak, unbound placeholder, premature hero mention, or missing consequence.
- Vitest, Playwright, typecheck, static build, and deterministic random guard pass.
