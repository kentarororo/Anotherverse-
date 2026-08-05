# Anotherverse — Game Concept

Status: **Approved authority**  
Decision: ADR-0001  
Product target: browser-playable six-turn vertical slice

## Promise

Anotherverse is a mythology × manhwa 2D autobattler, party RPG, and progression simulation. The player begins with one unknown hero, survives a mythic incursion, recruits two companions through play, and turns a fragile party into a company capable of defeating divine monsters.

The fantasy is **progression power first**. Planning exists to make growth legible: the player chooses formation, stance, target priority, techniques, and equipment, then watches those decisions succeed or fail in a readable automatic battle.

## Player pillars

1. **Ascend Through Mastery.** Levels, stats, skills, equipment, and Mythic Awakening forms produce visible, measurable power.
2. **Plan Wins Fights.** Scouting and preparation reveal enemy rules that formation, stance, priority, and gear can counter.
3. **Heroes Become a Company.** The player starts alone, recruits two coherent companions in the story, and builds relationships with mechanical consequences.
4. **Mythic Causes, Plain English.** Mythology is colourful; sentences remain direct. Every scene preserves cause → action → result.
5. **Combat Is the Spectacle.** Animation, damage numbers, status cues, and turning points explain battle before the log does.
6. **Every Reward Changes the Next Plan.** A resource, item, or relationship is shown only if it enables a decision within the slice.

## Anti-pillars

- No operations-dashboard, corporate, academy, network, breach, or licensing language.
- No procedural prose assembled by swapping unrelated nouns or clauses.
- No long story wall between fights.
- No currency or meter without an immediate source, sink, and visible consequence.
- No character appearing before recruitment.
- No twenty-turn breadth at the expense of a strong opening act.

## Core loop

1. **Read:** See a short scene, objective, enemy tell, and stakes.
2. **Prepare:** Spend or equip if useful; choose formation, stance, priority, and technique policy.
3. **Watch:** The autobattle resolves at readable speed in 12–20 meaningful beats.
4. **Understand:** See the turning point, casualties, counter used, and why the result occurred.
5. **Grow:** Take a reward or relationship consequence that changes the next preparation.

## Six-turn slice

| Turn | Purpose            | Required payoff                                                             |
| ---- | ------------------ | --------------------------------------------------------------------------- |
| 1    | Solo battle        | Teach one tell and one counter; fair victory for an informed plan.          |
| 2    | First companion    | Recruitment happens on screen; the new skill solves a visible problem.      |
| 3    | Second companion   | First full formation battle; all three heroes have distinct jobs.           |
| 4    | Recovery and build | Spend Rations or Coin; equip or craft one meaningful counter.               |
| 5    | Consequence fight  | A prior choice changes enemy, terrain, reward, or ally condition.           |
| 6    | Act boss           | Tests the learned counter and upgraded build; unlocks an Awakening promise. |

## Experience targets

- First meaningful choice: under 90 seconds.
- First battle: under 3 minutes.
- Full act: 25–35 minutes on first play.
- Story payload per turn: 60–140 words before battle, 20–80 words after it.
- An informed first-time player should win Turns 1–3 in 65–85% of runs.
- The boss should win against an unplanned/default build and lose to at least two viable prepared builds.
- After the act, a player can name each hero’s job, one counter they used, one growth target, and one choice that changed a later event.

## Product boundaries

In scope: three-hero company, six turns, deterministic seeded generation, six base archetype templates, bounded origins/names, nine core techniques, eight enemy behaviours, twelve useful items, a small fusion table, relationship effects, one boss, save/replay, browser presentation.

Out of scope for this slice: live LLM calls, unrestricted prose generation, multiplayer, endless campaign, additional currencies, open-world traversal, procedural rules, and production art beyond stable placeholder contracts.

## Authority order

When artifacts conflict, use: this concept → system GDDs → registries → ADRs → implementation docs → source. Legacy implementation is evidence, not design authority.
