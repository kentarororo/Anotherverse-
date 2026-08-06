import { useState } from 'react';
import { calculateForecast } from '../../engine/combat/forecast';
import type { Position } from '../../engine/model/commands';
import { useAppStore } from '../../app/store';
import { renderCombatEvent } from '../../narrative/realiser/combat';
import { ManagementDrawer } from '../components/ManagementDrawer';
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

function sceneKindLabel(value: string) {
  return value === 'operation' ? 'Battle' : titleCase(value);
}

function signed(value: number) {
  if (value > 0) return `+${value}`;
  if (value < 0) return `−${Math.abs(value)}`;
  return '0';
}

function encounterIdForEnemies(enemyIds: string[]) {
  const signature = [...enemyIds].sort().join('|');
  return (
    operationEncounters.find((encounter) => [...encounter.enemyIds].sort().join('|') === signature)
      ?.id ?? 'unassigned-arena'
  );
}

export function CommandScreen() {
  const [completedPlaybackReportId, setCompletedPlaybackReportId] = useState<string | null>(null);
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
  const restParty = useAppStore((state) => state.restParty);
  const forecast = calculateForecast(game);
  const aftermath = game.aftermathReports.at(-1);
  const report = game.battleReports.find((candidate) => candidate.id === aftermath?.battleReportId);
  const showingAftermath = turnView === 'aftermath' && aftermath !== undefined;
  const aftermathReady = report === undefined || completedPlaybackReportId === report.id;
  const displayedTurn = showingAftermath ? aftermath.turn : game.turn;
  const scenario = game.currentScenario;
  const recruitedHeroes = game.generatedDefinitions.characters.filter((hero) => {
    if (!game.recruitedCharacterIds.includes(hero.id)) return false;
    if (!showingAftermath || hero.id === game.leadCharacterId) return true;
    const recruitment = game.worldFacts.find(
      (fact) => fact.id === `fact-recruited-${hero.id}` && fact.relation === 'joined-party',
    );
    return recruitment !== undefined && recruitment.createdTurn <= displayedTurn;
  });
  const selectedChoice = scenario?.choices.find(
    (choice) => choice.id === game.pendingPlan.situationChoiceId,
  );
  const hasBattle = game.currentEncounter !== null;
  const newDropIds = showingAftermath ? (aftermath.itemIdsGranted ?? []) : [];
  const newMaterialIds = showingAftermath ? (aftermath.materialIdsGranted ?? []) : [];
  const newRewardCount = newDropIds.length + newMaterialIds.length;
  const materialCount = Object.values(game.materials).reduce((sum, count) => sum + count, 0);
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
    ...recruitedHeroes.map((hero) => [hero.id, hero.callingId] as const),
    ...battleEnemyIds.map((enemyId) => [enemyId, enemyId] as const),
  ]);
  const resolvedArenaId = encounterIdForEnemies(battleEnemyIds);
  const totalBattleHpStart =
    report === undefined
      ? 0
      : recruitedHeroes.reduce((total, hero) => total + (report.hpAtStart[hero.id] ?? 0), 0);
  const totalBattleHpEnd =
    report === undefined
      ? 0
      : recruitedHeroes.reduce((total, hero) => total + (report.hpAtEnd[hero.id] ?? 0), 0);
  const formationSummary = positions
    .map((position) => {
      const hero = recruitedHeroes.find(
        (candidate) => game.pendingPlan.positions[candidate.id] === position,
      );
      return hero === undefined ? titleCase(position) : `${titleCase(position)} ${hero.name}`;
    })
    .join(' / ');
  const actionPreview = buildHeroActionPreview(game);
  const activePriority = planningRule(
    PRIORITY_RULES,
    game.pendingPlan.teamPriorityId ?? 'break-threat',
  );
  const battleCausality = report === undefined ? [] : buildBattleCausality(game, report);
  const selectedChoiceAffordable =
    selectedChoice === undefined || game.supplies + selectedChoice.effects.provisionsDelta >= 0;
  const alternateChoice = scenario?.choices.find((choice) => choice.id !== selectedChoice?.id);
  const partyNeedsRest = recruitedHeroes.some((hero) => {
    const member = game.partyState[hero.id];
    return member !== undefined && (member.hp < member.maxHp || member.readiness < 100);
  });

  return (
    <main className="command-screen">
      <header className="command-header">
        <div className="campaign-label">
          <span className="status-dot" /> {game.campaignBible?.city.name ?? 'Campaign'}
        </div>
        <dl className="campaign-metrics">
          <div>
            <dt>Chapter</dt>
            <dd>{displayedTurn}</dd>
          </div>
          <div>
            <dt>Rank</dt>
            <dd>
              {game.rank} · {game.reputation}
            </dd>
          </div>
          <div>
            <dt>Rations</dt>
            <dd>{game.supplies}</dd>
          </div>
          <div>
            <dt>Coin</dt>
            <dd>{game.coins}</dd>
          </div>
          <div>
            <dt>Dust</dt>
            <dd>{game.relicDust}</dd>
          </div>
          <div>
            <dt>Monster parts</dt>
            <dd>{materialCount}</dd>
          </div>
          {newRewardCount > 0 && (
            <div className="new-drop-metric" data-new-drop-count={newRewardCount}>
              <dt>New</dt>
              <dd>
                <button
                  type="button"
                  onClick={() =>
                    openDrawer({ type: newMaterialIds.length > 0 ? 'forge' : 'equipment' })
                  }
                >
                  {newRewardCount} drop{newRewardCount === 1 ? '' : 's'}
                </button>
              </dd>
            </div>
          )}
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
            onClick={() => openDrawer({ type: 'forge' })}
          >
            Forge
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
              <p className="eyebrow">Awakened company</p>
              <h2 id="trio-title">Your Heroes</h2>
            </div>
            <span className="badge">{recruitedHeroes.length} / 3</span>
          </div>
          <div className="hero-list">
            {recruitedHeroes.map((hero) => {
              const member = game.partyState[hero.id];
              if (member === undefined) return null;
              const hpPercent = (member.hp / member.maxHp) * 100;
              return (
                <article className={`hero-card role-${hero.role}`} key={hero.id}>
                  <div className="hero-card-heading">
                    <div>
                      <strong>{hero.name}</strong>
                      <span>
                        {hero.pathClassName} · Mythic Awakening: {hero.callingName} · Ready{' '}
                        {member.readiness}%
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
          <div className="synergy-strip" aria-live="polite">
            <span>{recruitedHeroes.length === 1 ? 'Current tactic' : 'Party tactic'}</span>
            <strong>
              {recruitedHeroes.length === 1
                ? 'Survive → Learn → Grow'
                : recruitedHeroes.length === 2
                  ? 'Guard → Strike'
                  : 'Break → Exploit → Ward'}
            </strong>
          </div>
        </section>

        <section
          className="panel operation-panel"
          aria-labelledby="operation-title"
          data-scenario-category={scenario?.category}
        >
          <div className="turn-state-label">{showingAftermath ? 'Result' : 'Action'}</div>
          <div className="operation-content">
            <p className="eyebrow">
              {scenario?.quest.title ?? 'Main Quest'} · Act {scenario?.quest.act ?? 1} of 3 ·
              Chapter {displayedTurn} of 6
            </p>
            <h2 id="operation-title">
              {showingAftermath
                ? aftermathReady
                  ? 'Aftermath'
                  : 'Battle in progress'
                : scenario?.title}
            </h2>
            {showingAftermath ? (
              aftermathReady ? (
                <p className="operation-hook">{aftermath.summary}</p>
              ) : null
            ) : scenario !== null ? (
              <div className="storybook-brief" aria-label="Story situation">
                <div className="quest-objective">
                  <span>{scenario.quest.actTitle}</span>
                  <strong>Current goal: {scenario.quest.objective}</strong>
                </div>
                <p className="operation-hook">{scenario.sceneBeats.hook}</p>
                <dl>
                  <div>
                    <dt>{displayedTurn === 1 ? 'Why now' : 'Previously'}</dt>
                    <dd>{scenario.sceneBeats.cause}</dd>
                  </div>
                  <div>
                    <dt>At stake</dt>
                    <dd>{scenario.sceneBeats.stakes}</dd>
                  </div>
                  <div>
                    <dt>Choose</dt>
                    <dd>{scenario.sceneBeats.decision}</dd>
                  </div>
                </dl>
              </div>
            ) : null}
            {showingAftermath && report !== undefined ? (
              <BattlePlaybackStage
                report={report}
                combatants={game.generatedDefinitions.combatants}
                heroIds={recruitedHeroes.map((hero) => hero.id)}
                enemyIds={battleEnemyIds}
                assetIds={battleAssetIds}
                arenaId={resolvedArenaId}
                onPlaybackComplete={() => setCompletedPlaybackReportId(report.id)}
              />
            ) : hasBattle && game.currentEncounter !== null ? (
              <>
                <PlanningBattleStage
                  arenaId={game.currentEncounter.id}
                  heroes={recruitedHeroes}
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
                <div className="reward-preview" aria-label="Battle reward">
                  <span>Win reward</span>
                  <strong>{game.currentEncounter.rewardPreview}</strong>
                </div>
              </>
            ) : (
              <div className="battle-stage" aria-label="Enemy forecast">
                {!hasBattle && scenario !== null && (
                  <article className="situation-card">
                    <span>{sceneKindLabel(scenario.category)}</span>
                    <strong>{scenario.title}</strong>
                    <p>{scenario.forecast.likelyBenefit}</p>
                  </article>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="panel decision-panel" aria-labelledby="decision-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                {showingAftermath
                  ? aftermathReady
                    ? 'Battle result'
                    : 'Watch the battle'
                  : hasBattle
                    ? 'Battle plan'
                    : 'Your choice'}
              </p>
              <h2 id="decision-title">
                {showingAftermath
                  ? aftermathReady
                    ? report === undefined
                      ? 'Resolved'
                      : titleCase(report.outcome)
                    : 'Actions are playing'
                  : hasBattle
                    ? 'Ready the party'
                    : 'Choose a response'}
              </h2>
            </div>
          </div>
          {showingAftermath ? (
            aftermathReady ? (
              <div className="aftermath-list" aria-live="polite">
                <section className={`aftermath-outcome outcome-${report?.outcome ?? 'resolved'}`}>
                  <span>Chapter {aftermath.turn}</span>
                  <strong>
                    {report === undefined ? 'Choice resolved' : titleCase(report.outcome)}
                  </strong>
                  <p>{aftermath.summary.split(/(?<=[.!?])\s+/)[0]}</p>
                </section>
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
                {recruitedHeroes.map((hero) => (
                  <div className="aftermath-hero-row" key={hero.id}>
                    <span>{hero.name}</span>
                    <strong>
                      {aftermath.hpByCharacter[hero.id] ?? game.partyState[hero.id]?.hp ?? 0} HP · +
                      {aftermath.experienceByCharacter[hero.id] ?? 0} XP
                    </strong>
                  </div>
                ))}
                <div className="progression-summary">
                  <span>Level progress</span>
                  <strong>
                    {recruitedHeroes
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
                      {totalBattleHpEnd}/{totalBattleHpStart} party HP retained / {report.rounds}{' '}
                      rounds
                    </strong>
                    <small>
                      {titleCase(game.pendingPlan.teamPriorityId ?? 'unassigned')} /{' '}
                      {formationSummary}
                    </small>
                  </div>
                )}
                <div>
                  <span>Rations</span>
                  <strong>{signed(aftermath.suppliesDelta)}</strong>
                </div>
                <div>
                  <span>Renown</span>
                  <strong>{signed(aftermath.reputationDelta)}</strong>
                </div>
                <div>
                  <span>Danger</span>
                  <strong>{signed(aftermath.dangerDelta)}</strong>
                </div>
                <div>
                  <span>Coin</span>
                  <strong>{signed(aftermath.coinsDelta)}</strong>
                </div>
                <div>
                  <span>Dust</span>
                  <strong>{signed(aftermath.relicDustDelta)}</strong>
                </div>
                {aftermath.bondDelta !== 0 && (
                  <div>
                    <span>Bond</span>
                    <strong>{signed(aftermath.bondDelta)}</strong>
                  </div>
                )}
                <div>
                  <span>Chapter {aftermath.turn} complete</span>
                  <strong>{aftermath.summary.split(/(?<=[.!?])\s+/)[0]}</strong>
                </div>
                {aftermath.itemIdsGranted.map((itemId) => (
                  <div key={itemId} className="reward-row">
                    <span>Equipment recovered</span>
                    <strong>{game.generatedDefinitions.items[itemId]?.name}</strong>
                  </div>
                ))}
                {aftermath.materialIdsGranted.map((materialId, index) => (
                  <div key={`${materialId}-${index}`} className="reward-row">
                    <span>Monster material</span>
                    <strong>
                      {game.generatedDefinitions.materials[materialId]?.name ?? materialId}
                    </strong>
                  </div>
                ))}
                {aftermath.characterIdsRecruited.map((characterId) => (
                  <div key={characterId} className="recruitment-result">
                    <span>Companion joined</span>
                    <strong>
                      {
                        game.generatedDefinitions.characters.find((hero) => hero.id === characterId)
                          ?.name
                      }
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="playback-prompt" role="status">
                <strong>The battle is resolving.</strong>
                <span>Watch the key actions, or use Skip to result on the battlefield.</span>
              </div>
            )
          ) : (
            <>
              {hasBattle ? (
                <>
                  {alternateChoice !== undefined && (
                    <button
                      className="choice-change-button"
                      type="button"
                      onClick={() => chooseSituation(alternateChoice.id)}
                    >
                      Choose instead: {alternateChoice.label}
                    </button>
                  )}
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
                    <span>Order</span>
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
                      <span>Chance of victory</span>
                      <strong>{titleCase(forecast.victoryBand)}</strong>
                    </div>
                    <div>
                      <span>Incoming damage</span>
                      <strong>
                        {forecast.incomingDamage[0]}–{forecast.incomingDamage[1]}
                      </strong>
                    </div>
                    <div>
                      <span>Scout report</span>
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
                        Renown {signed(choice.effects.renownDelta)}
                        {' · '}Rations {signed(choice.effects.provisionsDelta)}
                        {' · '}Danger {signed(choice.effects.dangerDelta)}
                        {choice.effects.bondDelta !== 0 &&
                          ` · Bond ${signed(choice.effects.bondDelta)}`}
                      </small>
                    </button>
                  ))}
                </div>
              )}
              {hasBattle && (
                <div className="forecast-notes">
                  <p>
                    <b>Advantage:</b> {forecast.advantages[0]}
                  </p>
                  <p>
                    <b>Risk:</b> {forecast.vulnerabilities[0]}
                  </p>
                </div>
              )}
            </>
          )}
          {!showingAftermath && (
            <button
              className="button button-quiet camp-button"
              type="button"
              disabled={game.supplies < 1 || !partyNeedsRest}
              onClick={restParty}
            >
              Rest company · 1 Ration
            </button>
          )}
          <button
            className="button button-primary commit-button"
            type="button"
            onClick={
              showingAftermath
                ? aftermath.turn >= 6
                  ? returnToTitle
                  : continueToPlanning
                : commitTurn
            }
            disabled={
              (showingAftermath && !aftermathReady) ||
              (!showingAftermath &&
                (game.pendingPlan.situationChoiceId === null || !selectedChoiceAffordable))
            }
          >
            {showingAftermath
              ? !aftermathReady
                ? 'Battle in progress'
                : aftermath.turn >= 6
                  ? 'Finish Campaign'
                  : `Continue to Turn ${game.turn}`
              : 'Take Action'}
          </button>
        </section>
      </div>

      <section className="event-feed" aria-labelledby="event-feed-title">
        <details className="exact-battle-log">
          <summary>
            <strong id="event-feed-title">
              {showingAftermath && report !== undefined ? 'Battle details' : 'Chapter notes'}
            </strong>
            <span>
              {showingAftermath && report !== undefined
                ? `${report.events.length} actions`
                : 'Story and tactical notes'}
            </span>
          </summary>
          <div className="event-feed-heading">
            <p className="eyebrow">In order</p>
            <h2>What happened</h2>
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
                  <span>The party has reviewed the danger. No resources have been spent.</span>
                </li>
                <li>
                  <time>T{String(game.turn).padStart(2, '0')}</time>
                  <span>
                    {hasBattle ? game.currentEncounter?.signature : scenario?.forecast.likelyRisk}
                  </span>
                </li>
                <li>
                  <time>T{String(game.turn).padStart(2, '0')}</time>
                  <span>
                    {hasBattle
                      ? 'Change formation, stances, and priority before taking action.'
                      : 'Choose one response. The result will shape the next chapter.'}
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
