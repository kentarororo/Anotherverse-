# ADR-0001: Mythology × Manhwa Canon and Six-Turn Slice

Date: 2026-08-05  
Status: Accepted by product owner

## Context

Anotherverse accumulated two competing identities: an older modern breach/academy operations game and a newer mythic progression RPG. Implementation breadth reached twenty turns, but progression impact, combat counterplay, resource sinks, narrative coherence, and procedural diversity remained too weak for a shippable opening.

## Decision

1. Mythology × manhwa is the sole player-facing canon.
2. Progression power is the dominant fantasy; tactical preparation supports and demonstrates that growth.
3. Development focuses on a polished six-turn, 25–35 minute vertical slice before extending the campaign.
4. Procedural generation is bounded: seeded selection among complete, tagged, compatible authored modules with typed facts and validation. Runtime LLM generation and arbitrary fragment splicing are excluded.
5. The six approved pillars in `game-concept.md` govern design and implementation.
6. Legacy modern terminology and content are quarantined until removed or deliberately remapped.

## Consequences

- Existing twenty-turn content is not automatically canonical.
- Systems without meaningful slice behavior are hidden or removed rather than displayed decoratively.
- Content tests must validate chronology, vocabulary, causal facts, mechanics, and semantic variation.
- Source, UI, acceptance documents, and tests must be propagated according to the change ledger.
- Production art can arrive later because entities and combat beats expose stable IDs and visual contracts.

## Alternatives rejected

- Preserve both modern and mythic settings: rejected because mixed vocabulary caused incoherent prose and product identity.
- Polish all twenty turns equally: rejected because it spreads effort before the opening loop proves fun.
- Free-form offline prose assembly: rejected because surface variation broke meaning and causal continuity.
