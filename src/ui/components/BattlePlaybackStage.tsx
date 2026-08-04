import { useEffect, useMemo, useRef, useState } from 'react';
import type { CombatantDefinition } from '../../engine/model/combat';
import type { BattleReport, CombatEvent } from '../../engine/reports/combat';
import { maximumHp } from '../../engine/combat/stats';
import { PixelArtSlot } from './PixelArtSlot';

const MAX_VISIBLE_BEATS = 16;
const BEAT_DURATION_MS = 520;

interface BattlePlaybackStageProps {
  report: BattleReport;
  combatants: Record<string, CombatantDefinition>;
  heroIds: string[];
  enemyIds: string[];
  assetIds?: Record<string, string>;
  arenaId?: string;
}

function titleCase(value: string) {
  return value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function selectBattleBeats(events: CombatEvent[]) {
  if (events.length <= MAX_VISIBLE_BEATS) return events;

  const chosen = new Map<number, CombatEvent>();
  const first = events[0];
  const last = events.at(-1);
  if (first !== undefined) chosen.set(first.index, first);
  events
    .filter((event) => event.eventType === 'defeat')
    .forEach((event) => chosen.set(event.index, event));
  if (last !== undefined) chosen.set(last.index, last);

  const strongestImpacts = events
    .filter((event) => (event.finalAmount ?? 0) > 0)
    .sort(
      (left, right) =>
        Math.abs(right.finalAmount ?? 0) - Math.abs(left.finalAmount ?? 0) ||
        left.index - right.index,
    )
    .slice(0, 4);
  strongestImpacts.forEach((event) => chosen.set(event.index, event));

  const priorityBeats = events.filter((event) =>
    ['interrupt', 'heal', 'status'].includes(event.eventType),
  );
  for (const event of priorityBeats) {
    if (chosen.size >= MAX_VISIBLE_BEATS) break;
    chosen.set(event.index, event);
  }

  const remaining = events
    .filter((event) => !chosen.has(event.index))
    .sort(
      (left, right) =>
        Math.abs(right.finalAmount ?? 0) - Math.abs(left.finalAmount ?? 0) ||
        left.index - right.index,
    );
  for (const event of remaining) {
    if (chosen.size >= MAX_VISIBLE_BEATS) break;
    chosen.set(event.index, event);
  }

  return [...chosen.values()].sort((left, right) => left.index - right.index);
}

function reducedMotionIsActive() {
  return (
    document.documentElement.dataset.reduceMotion === 'true' ||
    globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

function statusCue(event: CombatEvent) {
  return (
    event.statusChanges
      ?.filter(
        (change) =>
          change.stacksAfter !== change.stacksBefore ||
          change.durationAfter !== change.durationBefore,
      )
      .flatMap((change) => {
        if (event.eventType === 'guard' && change.statusId === 'warded') return [];
        const name = titleCase(change.statusId);
        if (change.stacksAfter === 0 && change.stacksBefore > 0) return [`${name} ends`];
        if (
          change.stacksAfter > change.stacksBefore ||
          (change.durationBefore === 0 && change.durationAfter > 0)
        ) {
          return [`Applies ${name}`];
        }
        if (change.durationAfter > change.durationBefore) return [`Refreshes ${name}`];
        return [`${name} · ${change.durationAfter}r`];
      }) ?? []
  );
}

export function formatEventCue(event: CombatEvent) {
  let primary: string | null = null;
  if (event.eventType === 'attack' || event.eventType === 'interrupt') {
    primary =
      (event.finalAmount ?? 0) > 0
        ? `-${event.finalAmount} HP`
        : event.tags.includes('miss')
          ? 'Miss'
          : 'Blocked';
  }
  if (event.eventType === 'heal') {
    primary = `+${event.finalAmount ?? event.rawAmount ?? 0} HP`;
  }
  if (event.eventType === 'guard') {
    primary = `Ward +${event.finalAmount ?? event.rawAmount ?? 0}`;
  }
  if (event.eventType === 'resource') {
    const delta = (event.resourceAfter ?? 0) - (event.resourceBefore ?? 0);
    primary = `${delta >= 0 ? '+' : ''}${delta} Power`;
  }
  if (event.eventType === 'defeat') primary = 'Down';
  if (event.eventType === 'status') primary = null;
  return [primary, ...statusCue(event)].filter((cue): cue is string => cue !== null).join(' · ');
}

function hpAtEvent(report: BattleReport, eventIndex: number | null) {
  if (eventIndex === null) return report.hpAtEnd;
  const hp = { ...report.hpAtStart };
  for (const event of report.events) {
    if (event.index > eventIndex) break;
    if (event.hpAfter !== undefined && event.targetIds[0] !== undefined) {
      hp[event.targetIds[0]] = event.hpAfter;
    }
  }
  return hp;
}

const BENEFICIAL_STATUSES = new Set(['warded', 'inspired']);

export function deriveSpriteState(id: string, event: CombatEvent | null, hp: number) {
  if (hp <= 0) return 'down';
  if (event === null) return 'idle';
  const targeted = event.targetIds.includes(id);
  const acting = event.actorId === id;
  const damaged =
    targeted &&
    (event.eventType === 'attack' || event.eventType === 'interrupt') &&
    (event.finalAmount ?? 0) > 0;
  if (damaged) return 'hit';
  if (event.eventType === 'defeat' && targeted) return 'down';
  if (event.eventType === 'heal' && targeted) return 'healed';
  if (event.eventType === 'guard' && targeted) return 'guarded';
  if (event.eventType === 'status' && targeted) {
    const appliedStatus = event.statusChanges?.find(
      (change) =>
        change.stacksAfter > change.stacksBefore || change.durationAfter > change.durationBefore,
    );
    return appliedStatus !== undefined && BENEFICIAL_STATUSES.has(appliedStatus.statusId)
      ? 'buffed'
      : 'affected';
  }
  if (event.eventType === 'resource' && (targeted || acting)) {
    return (event.resourceAfter ?? 0) >= (event.resourceBefore ?? 0) ? 'empowered' : 'affected';
  }
  if (acting) return 'acting';
  return 'idle';
}

export function BattlePlaybackStage({
  report,
  combatants,
  heroIds,
  enemyIds,
  assetIds = {},
  arenaId = 'unassigned-arena',
}: BattlePlaybackStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const beats = useMemo(() => selectBattleBeats(report.events), [report.events]);
  const reducedMotion = reducedMotionIsActive();
  const [beatIndex, setBeatIndex] = useState(0);
  const [playback, setPlayback] = useState<'waiting' | 'playing' | 'paused' | 'result'>(() =>
    reducedMotion ? 'paused' : 'waiting',
  );
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);

  useEffect(() => {
    setBeatIndex(0);
    setPlayback(reducedMotion ? 'paused' : 'waiting');
  }, [reducedMotion, report.id]);

  useEffect(() => {
    const stage = stageRef.current;
    if (stage === null) return;
    if (globalThis.matchMedia?.('(max-width: 900px)').matches === true) {
      stage.focus({ preventScroll: true });
      stage.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
    }
  }, [report.id]);

  useEffect(() => {
    if (reducedMotion || playback !== 'waiting') return;
    const stage = stageRef.current;
    if (stage === null) return;
    if (globalThis.IntersectionObserver === undefined) {
      setPlayback('playing');
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting === true && entry.intersectionRatio >= 0.6) {
          setPlayback((current) => (current === 'waiting' ? 'playing' : current));
          observer.disconnect();
        }
      },
      { threshold: [0.6] },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, [playback, reducedMotion, report.id]);

  useEffect(() => {
    if (playback !== 'playing') return;
    if (beatIndex >= beats.length - 1) {
      const timer = globalThis.setTimeout(
        () => setPlayback('result'),
        BEAT_DURATION_MS / playbackSpeed,
      );
      return () => globalThis.clearTimeout(timer);
    }
    const timer = globalThis.setTimeout(
      () => setBeatIndex((current) => current + 1),
      BEAT_DURATION_MS / playbackSpeed,
    );
    return () => globalThis.clearTimeout(timer);
  }, [beatIndex, beats.length, playback, playbackSpeed]);

  const event = playback === 'result' ? null : (beats[beatIndex] ?? null);
  const visibleEventIndex = event?.index ?? null;
  const hp = hpAtEvent(report, visibleEventIndex);
  const actorName = event === null ? '' : (report.combatantNames[event.actorId] ?? event.actorId);
  const targetName =
    event?.targetIds[0] === undefined
      ? 'the field'
      : (report.combatantNames[event.targetIds[0]] ?? event.targetIds[0]);
  const actionName =
    event === null ? '' : (report.actionNames[event.actionId] ?? titleCase(event.actionId));

  const replay = () => {
    setBeatIndex(0);
    setPlayback(reducedMotion ? 'paused' : 'playing');
  };

  const toggleOrAdvance = () => {
    if (playback === 'waiting') {
      setPlayback('playing');
      return;
    }
    if (reducedMotion) {
      if (beatIndex >= beats.length - 1) setPlayback('result');
      else setBeatIndex((current) => current + 1);
      return;
    }
    setPlayback(playback === 'playing' ? 'paused' : 'playing');
  };

  const renderLane = (side: 'heroes' | 'enemies', ids: string[]) => (
    <div className={`combat-lane combat-lane-${side}`} aria-label={`${titleCase(side)} combatants`}>
      {ids.map((id) => {
        const definition = combatants[id];
        if (definition === undefined) return null;
        const maximum = maximumHp(definition.stats);
        const current = hp[id] ?? 0;
        const state = deriveSpriteState(id, event, current);
        return (
          <article
            className={`combat-unit role-${definition.role} is-${state} ${event?.actorId === id ? 'is-actor' : ''} ${event?.targetIds.includes(id) ? 'is-target' : ''} ${current <= 0 ? 'is-defeated' : ''}`}
            data-combatant-id={id}
            data-role={definition.role}
            data-sprite-state={state}
            key={`${id}-${visibleEventIndex ?? 'result'}`}
          >
            <PixelArtSlot
              assetId={assetIds[id] ?? id}
              role={definition.role}
              side={side}
              state={state}
            />
            <div className="unit-readout">
              <span>{titleCase(definition.role)}</span>
              <strong>{definition.name}</strong>
              <div className="unit-hp-row">
                <div className="meter" aria-hidden="true">
                  <span style={{ width: `${Math.max(0, (current / maximum) * 100)}%` }} />
                </div>
                <b>
                  {current}/{maximum}
                </b>
              </div>
              {event?.targetIds.includes(id) === true && statusCue(event).length > 0 && (
                <span className="unit-status-cue">{statusCue(event).join(' / ')}</span>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );

  return (
    <div
      ref={stageRef}
      className={`battle-playback-stage stage-event-${event?.eventType ?? 'result'}`}
      data-event-type={event?.eventType ?? 'result'}
      data-highlight-index={visibleEventIndex ?? 'result'}
      data-playback-state={playback}
      data-art-slot={`arena:${arenaId}`}
      aria-label="Battle playback"
      tabIndex={-1}
    >
      <div className="battlefield">
        <span className="arena-art-label">ARENA ART SLOT / {arenaId}</span>
        {renderLane('heroes', heroIds)}
        <div className="battle-beat" key={visibleEventIndex ?? 'result'} aria-live="polite">
          {event === null ? (
            <div className={`battle-result outcome-${report.outcome}`}>
              <span>{report.outcome}</span>
              <strong>{report.rounds} rounds</strong>
              <small>{report.events.length} actions in the battle record</small>
            </div>
          ) : (
            <>
              <span
                className={`event-vfx-placeholder vfx-${event.eventType}`}
                data-art-slot={`vfx:event-${event.eventType}`}
                aria-hidden="true"
              />
              <span className="round-label">Round {event.round}</span>
              <strong>{actionName}</strong>
              <p>
                {actorName} <span aria-hidden="true">→</span> {targetName}
              </p>
              <b className="impact-cue">{formatEventCue(event)}</b>
            </>
          )}
        </div>
        {renderLane('enemies', enemyIds)}
      </div>

      <div className="playback-controls">
        <div className="beat-progress" aria-label="Battle playback progress">
          {beats.map((beat, index) => (
            <span
              className={index <= beatIndex || playback === 'result' ? 'seen' : ''}
              key={beat.index}
            />
          ))}
        </div>
        <span className="playback-count">
          {playback === 'result'
            ? 'Result'
            : playback === 'waiting'
              ? `Ready · ${beats.length} highlights`
              : `${beatIndex + 1}/${beats.length} highlights`}
        </span>
        {!reducedMotion && playback !== 'result' && (
          <button
            className="playback-button"
            type="button"
            onClick={() => setPlaybackSpeed((current) => (current === 1 ? 2 : 1))}
          >
            Speed {playbackSpeed}x
          </button>
        )}
        {playback !== 'result' && (
          <button className="playback-button" type="button" onClick={toggleOrAdvance}>
            {playback === 'waiting'
              ? 'Start playback'
              : reducedMotion
                ? 'Next highlight'
                : playback === 'playing'
                  ? 'Pause'
                  : 'Play'}
          </button>
        )}
        <button className="playback-button" type="button" onClick={replay}>
          Replay
        </button>
        {playback !== 'result' && (
          <button className="playback-button" type="button" onClick={() => setPlayback('result')}>
            Skip to result
          </button>
        )}
      </div>
    </div>
  );
}
