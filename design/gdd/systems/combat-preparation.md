# System GDD — Combat & Preparation

## Intent

Preparation should turn knowledge into advantage, then autobattle should make that advantage visible.

## Player inputs

- **Formation:** front, middle, rear; one hero per position when three are present.
- **Stance:** Guarded, Aggressive, Tactical, Supportive.
- **Priority:** Break Greatest Threat, Finish the Weakest, Protect the Rear, or Hold for an Opening.
- **Loadout:** one equipped item per hero in the slice; one item has one owner.

Each control must show one short rule and forecast delta. Inputs freeze when battle starts. Hold for an Opening reserves 1 AP but permits an emergency heal or vulnerable-target finisher; it must never disable all techniques.

## Required mechanical identities

| Choice     | Benefit                               | Cost                      |
| ---------- | ------------------------------------- | ------------------------- |
| Front      | Draws attacks; enables guard skills   | Higher exposure           |
| Rear       | Lower exposure; enables ranged skills | Vulnerable if front falls |
| Guarded    | Guard and protection                  | Lower damage              |
| Aggressive | Power and execute access              | Lower Guard               |
| Tactical   | Accuracy, counter/skill setup         | Lower peak output         |
| Supportive | Earlier healing and aid triggers      | Lower direct output       |

Values live in code and balance data, but no option may be strictly better in all encounters.

## Resolution contract

- Seeded and deterministic; no wall-clock input.
- Normal playback target: one action beat every 0.7–1.2 seconds, with speed and skip controls.
- A battle contains 12–20 presented beats; repeated low-information basic attacks may be grouped without changing simulation.
- A beat shows actor, target, action, damage/heal/status, HP change, and trigger/counter reason.
- Show at most three decisive turning points after combat.
- Defeat explains the first failed counter or formation break, not merely “numbers were low.”

## Enemy behaviour contract

The slice ships at least eight mechanically distinct behaviours: front breaker, rear hunter, ritual charger, healer, protector, swarm, executioner, and status controller. Each has a visible tell, a discoverable counter, and an authored visual cue.

## Balance gates

- Turns 1–3: informed-plan win rate 65–85%; clearly wrong plan at least 20 percentage points lower.
- Turn 6: default/unplanned build below 40%; two prepared builds above 60%.
- Every stance is optimal in at least one catalogued encounter test.
- No policy option loses all representative simulations.
- Position or stance changes alter target selection, survival, action access, or output—not forecast text alone.

## Outputs

`victory`, surviving HP, action events, decisive beats, counter events, defeat cause, XP basis, loot table ID, injuries/readiness delta, and facts required by the next scene.
