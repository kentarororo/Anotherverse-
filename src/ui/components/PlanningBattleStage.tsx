import type { CharacterBlueprint } from '../../engine/model/character';
import type { CombatantDefinition, PartyMemberState } from '../../engine/model/combat';
import type { Position } from '../../engine/model/commands';
import { maximumHp } from '../../engine/combat/stats';
import { PixelArtSlot } from './PixelArtSlot';

interface PlanningBattleStageProps {
  arenaId: string;
  heroes: CharacterBlueprint[];
  enemies: CombatantDefinition[];
  partyState: Record<string, PartyMemberState>;
  positions: Record<string, Position>;
  stanceIds: Record<string, string>;
  priorityId: string | null;
}

const positionOrder: Record<Position, number> = { front: 0, centre: 1, rear: 2 };

function titleCase(value: string) {
  return value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function PlanningBattleStage({
  arenaId,
  heroes,
  enemies,
  partyState,
  positions,
  stanceIds,
  priorityId,
}: PlanningBattleStageProps) {
  const orderedHeroes = [...heroes].sort(
    (left, right) =>
      positionOrder[positions[left.id] ?? 'rear'] - positionOrder[positions[right.id] ?? 'rear'],
  );

  return (
    <section
      className="planning-battle-stage"
      aria-label="Planned battle formation"
      data-art-slot={`arena:${arenaId}`}
    >
      <span className="arena-art-label">ARENA ART SLOT / {arenaId}</span>
      <div className="planning-lane planning-lane-heroes" aria-label="Planned hero positions">
        {orderedHeroes.map((hero) => {
          const member = partyState[hero.id];
          if (member === undefined) return null;
          const position = positions[hero.id] ?? 'rear';
          const stance = stanceIds[hero.id] ?? 'tactical';
          return (
            <article className="planning-unit" data-position={position} key={hero.id}>
              <PixelArtSlot assetId={hero.callingId} role={hero.role} side="heroes" compact />
              <strong>{hero.name}</strong>
              <span>
                {titleCase(position)} / {titleCase(stance)}
              </span>
              <b>
                {member.hp}/{member.maxHp} HP
              </b>
            </article>
          );
        })}
      </div>

      <div className="plan-marker">
        <span>Squad order</span>
        <strong>{titleCase(priorityId ?? 'unassigned')}</strong>
      </div>

      <div className="planning-lane planning-lane-enemies" aria-label="Enemy threats">
        {enemies.map((enemy) => {
          const hp = maximumHp(enemy.stats);
          return (
            <article className="planning-unit" key={enemy.id}>
              <PixelArtSlot assetId={enemy.id} role={enemy.role} side="enemies" compact />
              <strong>{enemy.name}</strong>
              <span>{titleCase(enemy.role)} intent</span>
              <b>{hp} HP</b>
            </article>
          );
        })}
      </div>
    </section>
  );
}
