# Anotherverse Architecture

Status: Approved for implementation  
Architecture version: 2026-08-06  
Runtime: React 19.2 / TypeScript 7 / Vite 8.2 / browser

## Purpose

Anotherverse is a deterministic, offline mythology x manhwa autobattler. This architecture replaces the fixed-story rail with a campaign compiler that creates one coherent world and a typed six-turn causal plan before play. Presentation renders that plan; it never invents rules or story facts.

## Architectural Principles

1. **Compile, then play.** The campaign plan is committed before Turn 1 and is immutable except for explicit runtime outcomes and player choices.
2. **Facts before prose.** Mechanics, chronology, relationships, and consequences are typed data. Plain-English prose is a one-way rendering of those facts.
3. **One world thesis per run.** Cosmology, power law, vocabulary, factions, threat, names, creatures, and materials come from compatible modules.
4. **Meaningful variation.** Diversity is measured from structural and mechanical signatures, not seeds or adjective changes.
5. **Named RNG streams.** Cosmetic additions cannot reroll mechanics. Identical seed, catalog version, and choices reproduce the run.
6. **Fail closed.** Invalid candidates are rejected. Exhausted search uses a complete validated fallback campaign, never a partial story.
7. **Pure domain core.** Compiler, validation, progression, and combat remain framework-independent TypeScript.

## Layer and Module Ownership

| Layer        | Module             | Owns                                                                                      | May depend on                       | Must not own                            |
| ------------ | ------------------ | ----------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------- |
| Foundation   | Seed Streams       | Named deterministic streams, stable sampling, fingerprints                                | Nothing above Foundation            | Content meaning or UI                   |
| Foundation   | Corpus Catalog     | Validated world, arc, scene, hero, technique, item, enemy, miracle modules                | Schemas                             | Selection or prose state                |
| Core         | Campaign Compiler  | World thesis, cast, six-turn causal graph, encounter/reward bindings, semantic signature  | Seed Streams, Corpus Catalog        | Runtime combat outcomes                 |
| Core         | Campaign Validator | Compatibility, reference, reachability, chronology, vocabulary, prose and diversity gates | Compiled plan, schemas              | Candidate generation                    |
| Core         | Prose Realiser     | Complete sentence templates from typed view models                                        | Validated plan and runtime facts    | Rules, random selection, state mutation |
| Feature      | Campaign Runtime   | Choices, resolved facts, recruitment, combat results, rewards, unresolved threads         | Immutable plan, combat, progression | Plan rewriting                          |
| Feature      | Save Adapter       | Schema/catalog version, seed, selected module IDs, plan fingerprint, runtime state        | Campaign Runtime                    | Generated decisions                     |
| Presentation | React App          | Review, preparation, battle playback, results, diagnostics                                | Read-only selectors and commands    | Domain calculations                     |

## Data Flow

```text
seed + catalogVersion + player lead choice
             |
             v
       Named RNG Streams
             |
             v
   World Thesis / Identity Context
             |
             v
   Cast + Mechanics + Arc Candidates
             |
             v
   Six-Turn Typed Causal Graph
             |
             v
 Campaign Validator --reject--> next bounded candidate
             |
             +--exhausted--> validated fallback plan
             |
             v
      Immutable CampaignPlan
             |
     +-------+--------+
     |                |
     v                v
Campaign Runtime   Review Diagnostics
     |
     v
Combat/Progression Results -> Runtime Facts -> Prose Realiser -> React UI
```

## Core Contracts

```ts
type ModuleId = string;
type FactId = string;

interface LeadCandidate {
  id: ModuleId;
  name: string;
  originSummary: string;
  awakeningMotif: string;
  techniquePreviewIds: readonly ModuleId[];
}

interface CampaignOffer {
  seed: string;
  catalogVersion: string;
  thesis: WorldThesis;
  leadCandidates: readonly [LeadCandidate, LeadCandidate, LeadCandidate];
}

interface CampaignInput {
  offer: CampaignOffer;
  selectedLeadId: ModuleId;
}

interface WorldThesis {
  worldPackId: ModuleId;
  cosmologyId: ModuleId;
  powerLawId: ModuleId;
  namingCultureId: ModuleId;
  threatId: ModuleId;
  factionConflictId: ModuleId;
  allowedVocabulary: readonly string[];
  forbiddenVocabulary: readonly string[];
}

interface TurnPlan {
  turn: 1 | 2 | 3 | 4 | 5 | 6;
  function: 'solo' | 'recruit-one' | 'recruit-two' | 'recovery' | 'consequence' | 'boss';
  requires: readonly FactId[];
  offers: readonly ChoicePlan[];
  produces: readonly FactId[];
  encounterId?: ModuleId;
  rewardTableId?: ModuleId;
  promiseIds: readonly string[];
  payoffIds: readonly string[];
}

interface CampaignPlan {
  schemaVersion: number;
  catalogVersion: string;
  seed: string;
  thesis: WorldThesis;
  heroes: readonly CompiledHero[];
  turns: readonly [TurnPlan, TurnPlan, TurnPlan, TurnPlan, TurnPlan, TurnPlan];
  structuralSignature: string;
  mechanicalSignature: string;
}

interface ValidationReport {
  valid: boolean;
  errors: readonly ValidationIssue[];
  warnings: readonly ValidationIssue[];
  selectedModuleIds: readonly ModuleId[];
  rejectedCandidates: readonly RejectionSummary[];
}
```

All identifiers are stable, player-independent keys. Rendered strings are excluded from equality, save restoration, and mechanical evaluation.

## Compiler Pipeline

1. Parse the seed/catalog version, select a world pack, and bind a single `WorldThesis`.
2. Compile a deterministic `CampaignOffer` containing three world-compatible lead candidates. The UI hides formal tank/damage/support labels.
3. Validate `CampaignInput`, promote the chosen candidate to lead, discard the two unchosen candidates from campaign canon, and generate two new compatible companions. Only the chosen lead is recruited at the start.
4. Select an act skeleton and bind exactly six turn functions.
5. Resolve requirements and produced facts into a directed acyclic causal graph.
6. Bind four to six combat encounters, rewards, materials, equipment or fusion opportunities, and one boss.
7. Bind every promised thread to a later payoff within the act or label it explicitly as an act-end continuation.
8. Validate and calculate semantic signatures. Retry with a bounded attempt budget or use a validated fallback.
9. Freeze and persist the plan before showing Turn 1.

## Miracle Contract

A miracle is an authored, rare exception module. It may break the ordinary power curve, but must declare its trigger, visible rule, immediate benefit, cost or later complication, mechanic implementation, rarity weight, and vocabulary compatibility. Miracles never bypass schema, causal, determinism, or executable-mechanics validation.

## Persistence and Compatibility

- Save `schemaVersion`, `catalogVersion`, original seed, accepted offer ID, chosen lead, selected module IDs, both signatures, the compiled plan, and runtime facts.
- A save loads only when its schema can be migrated and all referenced mechanic IDs remain resolvable.
- Catalog wording changes must not alter mechanics. Mechanical changes require a catalog version change.
- A loaded plan is not silently recompiled against a newer catalog.

## Error Handling and Diagnostics

- Validation errors use stable codes and include module ID, turn, offending fact/reference, and rejection reason.
- Review mode exposes seed, thesis, selected modules, causal edges, encounters, reward bindings, signatures, and bounded rejection summaries.
- Player mode receives a plain recovery message only when the complete fallback also fails. It never shows a half-built campaign.

## Performance and Scale

- Compilation p95: at most 50 ms for a six-turn act on a reference desktop browser.
- No compiler work in the 60 fps battle playback loop.
- Search is bounded and deterministic; validation is linear in selected modules and causal edges where practical.
- The authored catalog must represent more than 10,000 potential semantic campaign signatures without storing 10,000 complete scripts.
- The milestone gate requires at least 500 distinct structural campaign signatures across the canonical 1,000-seed corpus.

## Security and Privacy

The runtime makes no content-generation network call and needs no user credentials. Seeds and local saves stay in browser storage. Imported catalogs, if added later, must pass the same schema and content validation before use.

## Migration Boundaries

Existing combat, progression, and presentation code may be adapted behind the new contracts. Legacy twenty-turn rails remain quarantined and must not be mixed into the compiled slice. Migration proceeds story by story; the old campaign builder remains available only as a temporary rollback until compiler acceptance gates pass.
