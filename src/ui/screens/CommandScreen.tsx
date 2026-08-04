import { calculateForecast } from '../../engine/combat/forecast';
import type { Position } from '../../engine/model/commands';
import { useAppStore } from '../../app/store';
import { renderCombatEvent } from '../../narrative/realiser/combat';
import { ManagementDrawer } from '../components/ManagementDrawer';
import { renderWorldFact } from '../../narrative/realiser/facts';
import { BattlePlaybackStage } from '../components/BattlePlaybackStage';
import { PlanningBattleStage } from '../components/PlanningBattleStage';
import { operationEncounters } from '../../content/milestone-one';
import {
  buildHeroActionPreview,
  planningRule,
  POSITION_RULES,
  PRIORITY_RULES,
  STANCE_RULES,
} from '../../engine/combat/planning';
import { buildBattleCausality } from '../../engine/reports/battle-causality';

const positions: Position[] = POSITION_RULES.map((rule) => rule.id);

function titleCase(value: string) {
  return value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function encounterIdForEnemies(enemyIds: string[]) {
  const signature = [...enemyIds].sort().join('|');
  return (
    operationEncounters.find((encounter) => [...encounter.enemyIds].sort().join('|') === signature)
      ?.id ?? 'unassigned-arena'
  );
}

export function CommandScreen() {
  const game = useAppStore((state) => state.game);
  const turnView = useAppStore((state) => state.turnView);
  const returnToTitle = useAppStore((state) => state.returnToTitle);
  const setPosition = useAppStore((state) => state.setPosition);
  const setStance = useAppStore((state) => state.setStance);
  const setTeamPriority = useAppStore((state) => state.setTeamPriority);
  const chooseSituation = useAppStore((state) => state.chooseSituation);
  const commitTurn = useAppStore((state) => state.commitTurn);
  const continueToPlanning = useAppStore((state) => state.continueToPlanning);
  const openDrawer = useAppStore((state) => state.openDrawer);
  const forecast = calculateForecast(game);
  const aftermath = game.aftermathReports.at(-1);
  const report = game.battleReports.find((candidate) => candidate.id === aftermath?.battleReportId);
  const showingAftermath = turnView === 'aftermath' && aftermath !== undefined;
  const displayedTurn = showingAftermath ? aftermath.turn : game.turn;
  const scenario = game.currentScenario;
  const isOperation = scenario?.category === 'operation';
  const battleEnemyIds =
    report === undefined
      ? []
      : Object.keys(report.hpAtStart).filter(
          (id) => game.generatedDefinitions.enemies[id] !== undefined,
        );
  const currentEnemies = (game.currentEncounter?.enemyIds ?? []).flatMap((enemyId) => {
    const enemy = game.generatedDefinitions.enemies[enemyId];
    return enemy === undefined ? [] : [enemy];
  });
  const battleAssetIds = Object.fromEntries([
    ...game.generatedDefinitions.characters.map((hero) => [hero.id, hero.callingId] as const),
    ...battleEnemyIds.map((enemyId) => [enemyId, enemyId] as const),
  ]);
  const resolvedArenaId = encounterIdForEnemies(battleEnemyIds);
  const totalBattleHpStart =
    report === undefined
      ? 0
      : game.generatedDefinitions.characters.reduce(
          (total, hero) => total + (report.hpAtStart[hero.id] ?? 0),
          0,
        );
  const totalBattleHpEnd =
    report === undefined
      ? 0
      : game.generatedDefinitions.characters.reduce(
          (total, hero) => total + (report.hpAtEnd[hero.id] ?? 0),
          0,
        );
  const formationSummary = positions
    .map((position) => {
      const hero = game.generatedDefinitions.characters.find(
        (candidate) => game.pendingPlan.positions[candidate.id] === position,
      );
      return hero === undefined ? titleCase(position) : `${titleCase(position)} ${hero.name}`;
    })
    .join(' / ');
  const causalFacts =
    scenario?.premiseFactIds.flatMap((factId) => {
      const fact = game.worldFacts.find((candidate) => candidate.id === factId && candidate.active);
      return fact === undefined ? [] : [renderWorldFact(game, fact)];
    }) ?? [];
  const actionPreview = buildHeroActionPreview(game);
  const activePriority = planningRule(
    PRIORITY_RULES,
    game.pendingPlan.teamPriorityId ?? 'break-threat',
  );
  const battleCausality = report === undefined ? [] : buildBattleCausality(game, report);
  const selectedChoice = scenario?.choices.find(
    (choice) => choice.id === game.pendingPlan.situationChoiceId,
  );
  const selectedChoiceAffordable =
    selectedChoice === undefined || game.supplies + selectedChoice.effects.provisionsDelta >= 0;

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
            <dt>Path Rank</dt>
            <dd>
              {game.rank} · {game.reputation} Renown
            </dd>
          </div>
          <div>
            <dt>Danger</dt>
            <dd>{game.threat}</dd>
          </div>
          <div>
            <dt>Provisions</dt>
            <dd>{game.supplies}</dd>
          </div>
        </dl>
        <div className="header-actions">
          <button
            className="header-link"
            type="button"
            onClick={() => openDrawer({ type: 'world' })}
          >
            World
          </button>
          <button
            className="header-link"
            type="button"
            onClick={() => openDrawer({ type: 'equipment' })}
          >
            Inventory
          </button>
          <button
            className="header-link"
            type="button"
            onClick={() => openDrawer({ type: 'bestiary' })}
          >
            Bestiary
          </button>
          <button
            className="header-link"
            type="button"
            onClick={() => openDrawer({ type: 'logs' })}
          >
            Logs
          </button>
          {import.meta.env.DEV && (
            <button
              className="header-link"
              type="button"
              onClick={() => openDrawer({ type: 'debug' })}
            >
              Debug
            </button>
          )}
          <button className="button button-quiet header-menu" type="button" onClick={returnToTitle}>
            Save / Menu
          </button>
        </div>
      </header>

      <div className="command-grid">
        <section className="panel trio-panel" aria-labelledby="trio-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Hunter status</p>
              <h2 id="trio-title">The Mythic Trio</h2>
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
                        {hero.pathClassName} · {hero.callingName} Path · Ready {member.readiness}%
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
                  <dl className="hero-stat-strip" aria-label={`${hero.name} combat stats`}>
                    {[
                      ['VIT', hero.stats.vitality],
                      ['POW', hero.stats.power],
                      ['GRD', hero.stats.guard],
                      ['SPD', hero.stats.speed],
                      ['FOC', hero.stats.focus],
                      ['AP', `${member.resource}/${member.maxResource}`],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="hero-controls">
                    <label>
                      Position
                      <select
                        aria-label={`${hero.name} position`}
                        value={game.pendingPlan.positions[hero.id]}
                        disabled={showingAftermath}
                        onChange={(event) => setPosition(hero.id, event.target.value as Position)}
                      >
                        {POSITION_RULES.map((rule) => (
                          <option value={rule.id} key={rule.id}>
                            {rule.label}
                          </option>
                        ))}
                      </select>
                      <small>
                        {planningRule(POSITION_RULES, game.pendingPlan.positions[hero.id]).effect}
                      </small>
                    </label>
                    <label>
                      Stance
                      <select
                        aria-label={`${hero.name} stance`}
                        value={game.pendingPlan.stanceIds[hero.id]}
                        disabled={showingAftermath}
                        onChange={(event) => setStance(hero.id, event.target.value)}
                      >
                        {STANCE_RULES.map((rule) => (
                          <option value={rule.id} key={rule.id}>
                            {rule.label}
                          </option>
                        ))}
                      </select>
                      <small>
                        {planningRule(STANCE_RULES, game.pendingPlan.stanceIds[hero.id]).effect}
                      </small>
                    </label>
                  </div>
                  <p>{hero.techniques.map((technique) => technique.name).join(' · ')}</p>
                  <button
                    className="hero-detail-button"
                    type="button"
                    onClick={() => openDrawer({ type: 'character', id: hero.id })}
                  >
                    Details · Level {member.level}
                  </button>
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
            <span className={!showingAftermath ? 'active' : ''}>Setup</span>
            <span className={showingAftermath ? 'active' : ''}>Action</span>
            <span className={showingAftermath ? 'active' : ''}>Result</span>
          </nav>
          <div className="operation-content">
            <p className="eyebrow">
              {showingAftermath
                ? 'Resolved situation'
                : titleCase(scenario?.category ?? 'situation')}{' '}
              {String(displayedTurn).padStart(2, '0')} · {game.campaignBible?.city.name}
            </p>
            <h2 id="operation-title">{showingAftermath ? 'Aftermath' : scenario?.title}</h2>
            {showingAftermath ? (
              <p className="operation-hook">{aftermath.summary}</p>
            ) : scenario !== null ? (
              <div className="storybook-brief" aria-label="Story situation">
                <p className="operation-hook">{scenario.sceneBeats.hook}</p>
                <dl>
                  <div>
                    <dt>Why now</dt>
                    <dd>{scenario.sceneBeats.cause}</dd>
                  </div>
                  <div>
                    <dt>What is at stake</dt>
                    <dd>{scenario.sceneBeats.stakes}</dd>
                  </div>
                  <div>
                    <dt>Your decision</dt>
                    <dd>{scenario.sceneBeats.decision}</dd>
                  </div>
                </dl>
              </div>
            ) : null}
            {!showingAftermath && causalFacts.length > 0 && (
              <aside className="causal-record" aria-label="Why this situation is happening">
                <strong>Soul Ledger remembers</strong>
                {causalFacts.map((fact) => (
                  <span key={fact}>{fact}</span>
                ))}
              </aside>
            )}
            {showingAftermath && report !== undefined ? (
              <BattlePlaybackStage
                report={report}
                combatants={game.generatedDefinitions.combatants}
                heroIds={game.generatedDefinitions.characters.map((hero) => hero.id)}
                enemyIds={battleEnemyIds}
                assetIds={battleAssetIds}
                arenaId={resolvedArenaId}
              />
            ) : isOperation && game.currentEncounter !== null ? (
              <>
                <PlanningBattleStage
                  arenaId={game.currentEncounter.id}
                  heroes={game.generatedDefinitions.characters}
                  enemies={currentEnemies}
                  partyState={game.partyState}
                  positions={game.pendingPlan.positions}
                  stanceIds={game.pendingPlan.stanceIds}
                  priorityId={game.pendingPlan.teamPriorityId}
                />
                <div className="threat-intents" aria-label="Enemy intent summary">
                  {currentEnemies.map((enemy) => (
                    <p key={enemy.id}>
                      <strong>{enemy.name}</strong>
                      <span>{enemy.signature}</span>
                    </p>
                  ))}
                </div>
              </>
            ) : (
              <div className="battle-stage" aria-label="Enemy forecast">
                {!isOperation && scenario !== null && (
                  <article className="situation-card">
                    <span>{titleCase(scenario.category)}</span>
                    <strong>{scenario.title}</strong>
                    <p>{scenario.forecast.likelyBenefit}</p>
                    <small>References {scenario.premiseFactIds.length} live campaign facts.</small>
                  </article>
                )}
                {showingAftermath && (
                  <div className="resolution-stamp">
                    <span>Resolved</span>
                    <strong>Memory written</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="panel decision-panel" aria-labelledby="decision-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{showingAftermath ? 'Consequences' : 'Decision / Forecast'}</p>
              <h2 id="decision-title">
                {showingAftermath
                  ? report === undefined
                    ? 'Resolved'
                    : titleCase(report.outcome)
                  : isOperation
                    ? 'Ready the squad'
                    : 'Choose a response'}
              </h2>
            </div>
          </div>
          {showingAftermath ? (
            <div className="aftermath-list">
              {battleCausality.length > 0 && (
                <div className="causal-aftermath" aria-label="Why the battle ended this way">
                  {battleCausality.map((beat) => (
                    <article key={beat.label}>
                      <span>{beat.label}</span>
                      <strong>{beat.title}</strong>
                      <small>{beat.detail}</small>
                    </article>
                  ))}
                </div>
              )}
              {game.generatedDefinitions.characters.map((hero) => (
                <div className="aftermath-hero-row" key={hero.id}>
                  <span>{hero.name}</span>
                  <strong>
                    {aftermath.hpByCharacter[hero.id]} HP · +
                    {aftermath.experienceByCharacter[hero.id]} XP
                  </strong>
                </div>
              ))}
              <div className="progression-summary">
                <span>Level progress</span>
                <strong>
                  {game.generatedDefinitions.characters
                    .map((hero) => {
                      const member = game.partyState[hero.id];
                      return `${hero.name} ${member === undefined ? 0 : member.experience % 50}/50`;
                    })
                    .join(' / ')}
                </strong>
              </div>
              {report !== undefined && (
                <div className="aftermath-battle-review">
                  <span>Plan result</span>
                  <strong>
                    {totalBattleHpEnd}/{totalBattleHpStart} squad HP retained / {report.rounds}{' '}
                    rounds
                  </strong>
                  <small>
                    {titleCase(game.pendingPlan.teamPriorityId ?? 'unassigned')} /{' '}
                    {formationSummary}
                  </small>
                </div>
              )}
              <div>
                <span>Provisions</span>
                <strong>+{aftermath.suppliesDelta}</strong>
              </div>
              <div>
                <span>Renown</span>
                <strong>
                  {aftermath.reputationDelta >= 0 ? '+' : ''}
                  {aftermath.reputationDelta}
                </strong>
              </div>
              <div>
                <span>Danger</span>
                <strong>
                  {aftermath.dangerDelta >= 0 ? '+' : ''}
                  {aftermath.dangerDelta}
                </strong>
              </div>
              {aftermath.bondDelta !== 0 && (
                <div>
                  <span>Bond</span>
                  <strong>
                    {aftermath.bondDelta >= 0 ? '+' : ''}
                    {aftermath.bondDelta}
                  </strong>
                </div>
              )}
              <div>
                <span>Memory</span>
                <strong>{aftermath.factIdsWritten.length} campaign fact recorded</strong>
              </div>
              {aftermath.itemIdsGranted.map((itemId) => (
                <div key={itemId}>
                  <span>Equipment recovered</span>
                  <strong>{game.generatedDefinitions.items[itemId]?.name}</strong>
                </div>
              ))}
            </div>
          ) : (
            <>
              {isOperation ? (
                <>
                  <label className="priority-control">
                    Team priority
                    <select
                      aria-label="Team priority"
                      value={game.pendingPlan.teamPriorityId ?? ''}
                      onChange={(event) => setTeamPriority(event.target.value)}
                    >
                      {PRIORITY_RULES.map((rule) => (
                        <option value={rule.id} key={rule.id}>
                          {rule.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="priority-effect" aria-live="polite">
                    <span>Exact priority rule</span>
                    <strong>{activePriority.effect}</strong>
                  </div>
                  <div className="action-preview" aria-label="Expected opening actions">
                    <span>Expected opening actions</span>
                    {actionPreview.map((preview) => (
                      <p key={preview.characterId}>
                        <strong>
                          {preview.characterName}: {preview.actionName}
                        </strong>
                        <small>{preview.explanation}</small>
                      </p>
                    ))}
                  </div>
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
                </>
              ) : (
                <div className="choice-list" role="radiogroup" aria-label="Situation response">
                  {scenario?.choices.map((choice) => (
                    <button
                      className={
                        game.pendingPlan.situationChoiceId === choice.id
                          ? 'choice selected'
                          : 'choice'
                      }
                      type="button"
                      role="radio"
                      aria-checked={game.pendingPlan.situationChoiceId === choice.id}
                      onClick={() => chooseSituation(choice.id)}
                      disabled={game.supplies + choice.effects.provisionsDelta < 0}
                      key={choice.id}
                    >
                      <strong>{choice.label}</strong>
                      <span>{choice.description}</span>
                      <small className="choice-effects">
                        Renown {choice.effects.renownDelta >= 0 ? '+' : ''}
                        {choice.effects.renownDelta}
                        {' · '}Provisions {choice.effects.provisionsDelta >= 0 ? '+' : ''}
                        {choice.effects.provisionsDelta}
                        {' · '}Danger {choice.effects.dangerDelta >= 0 ? '+' : ''}
                        {choice.effects.dangerDelta}
                        {choice.effects.bondDelta !== 0 &&
                          ` · Bond ${choice.effects.bondDelta >= 0 ? '+' : ''}${choice.effects.bondDelta}`}
                      </small>
                    </button>
                  ))}
                </div>
              )}
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
            disabled={
              !showingAftermath &&
              (game.pendingPlan.situationChoiceId === null || !selectedChoiceAffordable)
            }
          >
            {showingAftermath ? `Continue to Turn ${game.turn}` : 'Take Action'}
          </button>
        </section>
      </div>

      <section className="event-feed" aria-labelledby="event-feed-title">
        <details className="exact-battle-log">
          <summary>
            <strong id="event-feed-title">
              {showingAftermath && report !== undefined ? 'Exact battle log' : 'Turn intel'}
            </strong>
            <span>
              {showingAftermath && report !== undefined
                ? `${report.events.length} structured events`
                : 'Forecast and tactical notes'}
            </span>
          </summary>
          <div className="event-feed-heading">
            <p className="eyebrow">Chronology</p>
            <h2>Event Feed</h2>
          </div>
          <ol>
            {showingAftermath && report !== undefined ? (
              report.events.map((event) => (
                <li className="exact-event" key={event.index}>
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
            ) : showingAftermath ? (
              <li>
                <time>T{String(aftermath.turn).padStart(2, '0')}</time>
                <span>{aftermath.summary}</span>
              </li>
            ) : (
              <>
                <li>
                  <time>T{String(game.turn).padStart(2, '0')}</time>
                  <span>Threat forecast locked without consuming the combat stream.</span>
                </li>
                <li>
                  <time>T{String(game.turn).padStart(2, '0')}</time>
                  <span>
                    {isOperation ? game.currentEncounter?.signature : scenario?.forecast.likelyRisk}
                  </span>
                </li>
                <li>
                  <time>T{String(game.turn).padStart(2, '0')}</time>
                  <span>
                    {isOperation
                      ? 'Change formation, stances, and priority before taking action.'
                      : 'Choose one response; its consequence becomes campaign memory.'}
                  </span>
                </li>
              </>
            )}
          </ol>
        </details>
      </section>
      <ManagementDrawer />
    </main>
  );
}
