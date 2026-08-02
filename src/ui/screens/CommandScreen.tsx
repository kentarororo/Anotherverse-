import { calculateForecast } from '../../engine/combat/forecast';
import type { Position } from '../../engine/model/commands';
import { maximumHp } from '../../engine/combat/stats';
import { useAppStore } from '../../app/store';
import { actionName, renderCombatEvent } from '../../narrative/realiser/combat';

const positions: Position[] = ['front', 'centre', 'rear'];
const stances = ['aggressive', 'guarded', 'tactical', 'supportive'] as const;
const priorities = [
  ['focus-weakest', 'Focus Weakest'],
  ['protect-rear', 'Protect Rear'],
  ['break-threat', 'Break Threat'],
  ['conserve-power', 'Conserve Power'],
] as const;

function titleCase(value: string) {
  return value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function CommandScreen() {
  const game = useAppStore((state) => state.game);
  const turnView = useAppStore((state) => state.turnView);
  const returnToTitle = useAppStore((state) => state.returnToTitle);
  const setPosition = useAppStore((state) => state.setPosition);
  const setStance = useAppStore((state) => state.setStance);
  const setTeamPriority = useAppStore((state) => state.setTeamPriority);
  const commitTurn = useAppStore((state) => state.commitTurn);
  const continueToPlanning = useAppStore((state) => state.continueToPlanning);
  const forecast = calculateForecast(game);
  const report = game.battleReports.at(-1);
  const aftermath = game.aftermathReports.at(-1);
  const showingAftermath =
    turnView === 'aftermath' && report !== undefined && aftermath !== undefined;
  const displayedTurn = showingAftermath ? report.turn : game.turn;

  return (
    <main className="command-screen">
      <header className="command-header">
        <div className="campaign-label">
          <span className="status-dot" /> {game.campaignBible?.city.name ?? 'Campaign'}
        </div>
        <dl className="campaign-metrics">
          <div>
            <dt>Turn</dt>
            <dd>{displayedTurn}</dd>
          </div>
          <div>
            <dt>Rank</dt>
            <dd>{game.rank}</dd>
          </div>
          <div>
            <dt>Threat</dt>
            <dd>{game.threat}</dd>
          </div>
          <div>
            <dt>Supplies</dt>
            <dd>{game.supplies}</dd>
          </div>
        </dl>
        <button className="button button-quiet header-menu" type="button" onClick={returnToTitle}>
          Save / Menu
        </button>
      </header>

      <div className="command-grid">
        <section className="panel trio-panel" aria-labelledby="trio-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Squad status</p>
              <h2 id="trio-title">The Trio</h2>
            </div>
            <span className="badge">3 / 3</span>
          </div>
          <div className="hero-list">
            {game.generatedDefinitions.characters.map((hero) => {
              const member = game.partyState[hero.id];
              if (member === undefined) return null;
              const hpPercent = (member.hp / member.maxHp) * 100;
              return (
                <article className={`hero-card role-${hero.role}`} key={hero.id}>
                  <div className="hero-card-heading">
                    <div>
                      <strong>{hero.name}</strong>
                      <span>
                        {hero.callingName} · {titleCase(hero.role)}
                      </span>
                    </div>
                    <b>
                      {member.hp}/{member.maxHp}
                    </b>
                  </div>
                  <div
                    className="meter"
                    aria-label={`${hero.name} HP ${member.hp} of ${member.maxHp}`}
                  >
                    <span style={{ width: `${hpPercent}%` }} />
                  </div>
                  <div className="hero-controls">
                    <label>
                      Position
                      <select
                        aria-label={`${hero.name} position`}
                        value={game.pendingPlan.positions[hero.id]}
                        disabled={showingAftermath}
                        onChange={(event) => setPosition(hero.id, event.target.value as Position)}
                      >
                        {positions.map((position) => (
                          <option value={position} key={position}>
                            {titleCase(position)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Stance
                      <select
                        aria-label={`${hero.name} stance`}
                        value={game.pendingPlan.stanceIds[hero.id]}
                        disabled={showingAftermath}
                        onChange={(event) => setStance(hero.id, event.target.value)}
                      >
                        {stances.map((stance) => (
                          <option value={stance} key={stance}>
                            {titleCase(stance)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <p>{hero.techniqueIds.map(actionName).join(' · ')}</p>
                </article>
              );
            })}
          </div>
          <div className="synergy-strip">
            <span>Squad synergy</span>
            <strong>Break → Exploit → Ward</strong>
          </div>
        </section>

        <section className="panel operation-panel" aria-labelledby="operation-title">
          <nav className="phase-tabs" aria-label="Turn phases">
            <span className={!showingAftermath ? 'active' : ''}>Brief</span>
            <span className={!showingAftermath ? 'active' : ''}>Plan</span>
            <span className={showingAftermath ? 'active' : ''}>Battle</span>
            <span className={showingAftermath ? 'active' : ''}>Aftermath</span>
          </nav>
          <div className="operation-content">
            <p className="eyebrow">
              Operation {String(displayedTurn).padStart(2, '0')} · Transit district
            </p>
            <h2 id="operation-title">{game.currentEncounter?.title}</h2>
            <p>{showingAftermath ? aftermath.summary : game.currentEncounter?.brief}</p>
            <div
              className="battle-stage"
              aria-label={showingAftermath ? 'Battle result' : 'Enemy forecast'}
            >
              {game.currentEncounter?.enemyIds.map((enemyId) => {
                const enemy = game.generatedDefinitions.enemies[enemyId];
                if (enemy === undefined) return null;
                const maxHp = maximumHp(enemy.stats);
                const hp = showingAftermath ? (report.hpAtEnd[enemyId] ?? 0) : maxHp;
                return (
                  <article className="enemy-card" key={enemyId}>
                    <span>{enemy.role.toUpperCase()}</span>
                    <strong>{enemy.name}</strong>
                    <div className="meter enemy-meter">
                      <span style={{ width: `${(hp / maxHp) * 100}%` }} />
                    </div>
                    <b>
                      {hp}/{maxHp} HP
                    </b>
                    <p>{enemy.signature}</p>
                  </article>
                );
              })}
              {showingAftermath && (
                <div className={`outcome-stamp outcome-${report.outcome}`}>
                  <span>{report.outcome}</span>
                  <strong>{report.rounds} rounds</strong>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="panel decision-panel" aria-labelledby="decision-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{showingAftermath ? 'Consequences' : 'Decision / Forecast'}</p>
              <h2 id="decision-title">
                {showingAftermath ? titleCase(report.outcome) : 'Lock the squad plan'}
              </h2>
            </div>
          </div>
          {showingAftermath ? (
            <div className="aftermath-list">
              {game.generatedDefinitions.characters.map((hero) => (
                <div key={hero.id}>
                  <span>{hero.name}</span>
                  <strong>
                    {aftermath.hpByCharacter[hero.id]} HP · +
                    {aftermath.experienceByCharacter[hero.id]} XP
                  </strong>
                </div>
              ))}
              <div>
                <span>Supplies</span>
                <strong>+{aftermath.suppliesDelta}</strong>
              </div>
              <div>
                <span>Memory</span>
                <strong>Glassline result recorded</strong>
              </div>
            </div>
          ) : (
            <>
              <label className="priority-control">
                Team priority
                <select
                  aria-label="Team priority"
                  value={game.pendingPlan.teamPriorityId ?? ''}
                  onChange={(event) => setTeamPriority(event.target.value)}
                >
                  {priorities.map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="forecast-list">
                <div>
                  <span>Victory band</span>
                  <strong>{titleCase(forecast.victoryBand)}</strong>
                </div>
                <div>
                  <span>Incoming damage</span>
                  <strong>
                    {forecast.incomingDamage[0]}–{forecast.incomingDamage[1]}
                  </strong>
                </div>
                <div>
                  <span>Scouting confidence</span>
                  <strong>{titleCase(forecast.confidence)}</strong>
                </div>
              </div>
              <div className="forecast-notes">
                <p>
                  <b>Advantage:</b> {forecast.advantages[0]}
                </p>
                <p>
                  <b>Risk:</b> {forecast.vulnerabilities[0]}
                </p>
              </div>
            </>
          )}
          <button
            className="button button-primary commit-button"
            type="button"
            onClick={showingAftermath ? continueToPlanning : commitTurn}
          >
            {showingAftermath ? `Continue to Turn ${game.turn}` : 'Commit Plan'}
          </button>
        </section>
      </div>

      <section className="event-feed" aria-labelledby="event-feed-title">
        <div>
          <p className="eyebrow">Chronology</p>
          <h2 id="event-feed-title">Event Feed</h2>
        </div>
        <ol>
          {showingAftermath ? (
            report.events.map((event) => (
              <li key={event.index}>
                <time>R{String(event.round).padStart(2, '0')}</time>
                <details>
                  <summary>{renderCombatEvent(report, event)}</summary>
                  <div className="mechanics-line">
                    {event.hitChance !== undefined &&
                      `Hit ${Math.round(event.hitChance * 100)}% · Roll ${event.roll?.toFixed(3)} · `}
                    {event.rawAmount !== undefined &&
                      `Raw ${event.rawAmount} · Mitigated ${event.mitigatedAmount ?? 0} · Final ${event.finalAmount ?? 0}`}
                    {event.resourceBefore !== undefined &&
                      ` · Resource ${event.resourceBefore}→${event.resourceAfter}`}
                  </div>
                </details>
              </li>
            ))
          ) : (
            <>
              <li>
                <time>T{String(game.turn).padStart(2, '0')}</time>
                <span>Threat forecast locked without consuming the combat stream.</span>
              </li>
              <li>
                <time>T{String(game.turn).padStart(2, '0')}</time>
                <span>{game.currentEncounter?.signature}</span>
              </li>
              <li>
                <time>T{String(game.turn).padStart(2, '0')}</time>
                <span>Change formation, stances, and priority before committing once.</span>
              </li>
            </>
          )}
        </ol>
      </section>
    </main>
  );
}
