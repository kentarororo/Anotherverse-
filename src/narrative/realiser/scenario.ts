import type { CharacterBlueprint } from '../../engine/model/character';
import type { CanonicalGameState } from '../../engine/model/state';
import type { WorldFact } from '../../engine/model/world';
import type { ScenarioModule, SceneFactRole } from '../corpus/scenario-modules';
import { assertNoUnresolvedSlots, withIndefiniteArticle } from './grammar';

export interface BoundSceneFact {
  role: SceneFactRole;
  fact: WorldFact;
}

export interface ScenarioScenePlan {
  module: ScenarioModule;
  turn: number;
  lead: CharacterBlueprint;
  partner: CharacterBlueprint;
  facts: readonly [BoundSceneFact, BoundSceneFact];
  threatNames: readonly string[];
  relationshipBand: 'strained' | 'professional' | 'trusted';
  rank: string;
  reputation: number;
}

function stripTerminalPunctuation(value: string): string {
  return value.trim().replace(/[.!?]+$/, '');
}

function lowerFirst(value: string): string {
  const clean = stripTerminalPunctuation(value);
  return clean.length === 0 ? clean : `${clean[0]!.toLowerCase()}${clean.slice(1)}`;
}

function possessiveName(name: string): string {
  return `${name}${name.endsWith('s') ? '’' : '’s'}`;
}

function factForRole(plan: ScenarioScenePlan, role: SceneFactRole): WorldFact {
  const binding = plan.facts.find((candidate) => candidate.role === role);
  if (binding === undefined) throw new Error(`Scene ${plan.module.id} has no ${role} fact.`);
  return binding.fact;
}

function factValue(fact: WorldFact): string {
  return stripTerminalPunctuation(String(fact.value ?? fact.objectId ?? fact.subjectId));
}

function decisionLabel(fact: WorldFact): string {
  return lowerFirst(factValue(fact));
}

function decisionReference(fact: WorldFact): string {
  if (fact.createdTurn === 0) {
    if (fact.relation === 'comes-from')
      return `the origin evidence from ${lowerFirst(factValue(fact))}`;
    if (fact.relation === 'is-squad-city') return `the squad’s first licence in ${factValue(fact)}`;
    if (fact.relation === 'pursues-motive')
      return `the faction’s effort to ${lowerFirst(factValue(fact))}`;
    return `the campaign evidence concerning ${lowerFirst(factValue(fact))}`;
  }
  const category = fact.tags[0];
  const label = decisionLabel(fact);
  if (category === 'operation') return `the Turn ${fact.createdTurn} closure`;
  if (category === 'personal') return `the squad’s decision to ${label}`;
  if (category === 'discovery') return `the evidence tied to the decision to ${label}`;
  if (category === 'rival') return `the rival dispute answered by the decision to ${label}`;
  if (category === 'social') return `the Turn ${fact.createdTurn} district hearing`;
  return `the Turn ${fact.createdTurn} decision to ${label}`;
}

function decisionOutcome(fact: WorldFact): string {
  if (fact.createdTurn === 0) {
    if (fact.relation === 'comes-from')
      return `origin evidence surfaced from ${lowerFirst(factValue(fact))}`;
    if (fact.relation === 'is-squad-city')
      return `the squad received its first licence in ${factValue(fact)}`;
    if (fact.relation === 'pursues-motive')
      return `the active faction moved to ${lowerFirst(factValue(fact))}`;
    return `campaign evidence surfaced concerning ${lowerFirst(factValue(fact))}`;
  }
  const category = fact.tags[0];
  const label = decisionLabel(fact);
  if (category === 'operation') return `the squad completed the Turn ${fact.createdTurn} closure`;
  if (category === 'personal') return `the squad chose to ${label}`;
  if (category === 'discovery') return `the squad chose to ${label}`;
  if (category === 'rival') return `the squad answered its rivals by choosing to ${label}`;
  if (category === 'social') return `the squad took a public position and chose to ${label}`;
  return `the squad chose to ${label}`;
}

function decisionArtifact(fact: WorldFact): string {
  const choice = fact.tags
    .slice(1)
    .find((tag) => /-t\d+$/.test(tag))
    ?.replace(/-t\d+$/, '');
  switch (choice) {
    case 'close-glassline':
    case 'secure-east-junction':
    case 'hold-both-routes':
    case 'close-under-observation':
      return `the Turn ${fact.createdTurn} closure telemetry`;
    case 'release-sealed-file':
      return 'the sealed file released to the inquiry';
    case 'limit-sealed-file':
      return 'the sealed file kept under limited access';
    case 'honour-old-promise':
      return 'the old promise honoured for the unlicensed witness';
    case 'refuse-old-promise':
      return 'the old promise the squad refused';
    case 'publish-witness-proof':
      return 'the witness proof released with its location exposed';
    case 'protect-witness-location':
      return 'the witness testimony kept out of the public record';
    case 'study-calling-safely':
      return 'the Calling pattern recorded without forcing it';
    case 'push-calling-response':
      return 'the Calling response pushed under scrutiny';
    case 'follow-buried-signal':
      return 'the transmitter found beyond the licensed line';
    case 'mark-signal-route':
      return 'the buried signal route marked for later';
    case 'secure-living-relic':
      return 'the living relic secured under squad responsibility';
    case 'leave-relic-dormant':
      return 'the living relic left dormant at the site';
    case 'take-trace-sample':
      return 'the pressure sample taken from the hidden route';
    case 'preserve-hidden-route':
      return 'the hidden route preserved without a sample';
    case 'open-hidden-entry':
      return 'the concealed archive entry the squad opened';
    case 'leave-archive-closed':
      return 'the concealed archive entry left unopened';
    case 'accept-monitored-demonstration':
      return 'the monitored technique demonstration';
    case 'file-formal-challenge':
      return 'the formal challenge to the rival filing';
    case 'reproduce-disputed-technique':
      return 'the disputed technique reproduced under observation';
    case 'demand-complete-telemetry':
      return 'the complete telemetry demanded from the rival';
    case 'accept-public-challenge':
      return 'the public challenge accepted under poor conditions';
    case 'refuse-public-challenge':
      return 'the staged public challenge the squad refused';
    case 'take-credit-test':
      return 'the public test used to settle closure credit';
    case 'submit-closure-evidence':
      return 'the linked closure evidence submitted to the guild';
    case 'support-witness-testimony':
      return 'the testimony supported before district witnesses';
    case 'support-office-inquiry':
      return 'the closed licence-office inquiry';
    case 'defend-independent-records':
      return 'the squad’s defence of independent records';
    case 'accept-telemetry-control':
      return 'the telemetry placed under official control';
    case 'refuse-suppression':
      return 'the report detail the squad refused to suppress';
    case 'withhold-sensitive-detail':
      return 'the sensitive detail withheld from the report';
    case 'publish-district-record':
      return 'the complete record published with district witnesses';
    case 'file-official-record':
      return 'the report filed through the licence office';
    default:
      return decisionReference(fact);
  }
}

function enemyPair(plan: ScenarioScenePlan): [string, string] {
  return [plan.threatNames[0] ?? 'a breach predator', plan.threatNames[1] ?? 'a second threat'];
}

function worldNames(state: CanonicalGameState): {
  city: string;
  civic: string;
  guild: string;
  faction: string;
  motive: string;
} {
  const bible = state.campaignBible;
  if (bible === null) throw new Error('A narrative scene requires a campaign bible.');
  const faction = bible.activeFactions[0];
  if (faction === undefined) throw new Error('A narrative scene requires an active faction.');
  return {
    city: bible.city.name,
    civic: bible.civicOrder.name,
    guild: bible.guildModel.name,
    faction: faction.name,
    motive: lowerFirst(faction.motive),
  };
}

function renderOperation(plan: ScenarioScenePlan, state: CanonicalGameState): string {
  const world = worldNames(state);
  const [firstEnemy, secondEnemy] = enemyPair(plan);
  const prior = plan.facts.find((binding) => binding.fact.createdTurn > 0)?.fact;

  if (prior === undefined) {
    switch (plan.module.sceneKind) {
      case 'breach-return':
        return `A pressure alarm seals the Glassline platforms beneath ${world.city}, trapping the evening crowd between ${withIndefiniteArticle(firstEnemy)} and ${withIndefiniteArticle(secondEnemy)}. ${world.faction}, already trying to ${world.motive}, has claimed the only complete survey of the breach. The ${world.civic} will release that survey only if the squad accepts immediate responsibility for the closure. The trio has one chance to lock its formation before the trapped commuters lose their safe route.`;
      case 'junction-pressure':
        return `${world.city} loses power at East Junction just as ${withIndefiniteArticle(firstEnemy)} crosses the tram lanes and ${withIndefiniteArticle(secondEnemy)} begins copying emergency signals. ${world.faction} offers its private telemetry in exchange for control of the recovered evidence, consistent with its effort to ${world.motive}. The ${world.civic} refuses those terms but cannot produce another forecast before the junction opens to commuters. The squad must choose a formation using incomplete public data.`;
      case 'split-route':
        return `Two evacuation routes divide beneath ${world.city}, with ${withIndefiniteArticle(firstEnemy)} holding the narrow concourse and ${withIndefiniteArticle(secondEnemy)} erasing signs from the wider path. ${world.faction} has access to older route plans because it intends to ${world.motive}, but it will not release them without a licence concession. The ${world.civic} orders the squad to recover both routes before the breach pressure rises again. Breaking the front line and protecting the rear cannot be delegated to the same hero.`;
      case 'observed-closure':
        return `${world.faction} arrives at a breach in ${world.city} with cameras, survey crews, and a claim to the site based on its plan to ${world.motive}. Beyond the survey cordon, ${withIndefiniteArticle(firstEnemy)} drives witnesses toward the breach while ${withIndefiniteArticle(secondEnemy)} turns the squad’s own telemetry against the rear line. The ${world.civic} will certify the closure, but the public footage will decide who receives credit. The trio must fight under observation without letting the survey dictate its formation.`;
      default:
        break;
    }
  }

  const cause = decisionReference(prior ?? plan.facts[0].fact);
  switch (plan.module.sceneKind) {
    case 'breach-return':
      return `The pressure trace from ${cause} flares beneath ${world.city}’s Glassline platforms before inspectors can certify it as stable. The ${firstEnemy} blocks the evacuation lane while the ${secondEnemy} uses the old closure telemetry to mark the rear line. The return proves that the earlier victory removed the threat but not its route into the station. The trio must revise its formation before the next train reaches the sealed platform.`;
    case 'junction-pressure':
      return `The public position around ${decisionArtifact(prior ?? plan.facts[0].fact)} draws a crowd to East Junction in ${world.city} just as its breach alarms fail. The ${firstEnemy} moves openly through the tram lanes while the ${secondEnemy} hides inside the emergency signal, making the squad’s rear line the easier target. With witnesses now measuring the squad against its own promises, withdrawal would carry a visible cost. The trio asks ${plan.lead.name} to call which threat deserves the opening action.`;
    case 'split-route': {
      const secondCause = decisionReference(plan.facts[1].fact);
      return `The consequences of ${cause} and ${secondCause} have sent two groups of witnesses to opposite sides of ${world.city}’s split concourse. The ${firstEnemy} holds the narrow route while the ${secondEnemy} removes safe-path markings from the wider one. Saving either group first will expose the other to the enemy signature the squad already knows. Formation, not rhetoric, will determine whether both routes remain open.`;
    }
    case 'observed-closure':
      return `${world.faction} uses ${cause} to justify placing its own survey team inside the next ${world.city} closure. The ${firstEnemy} moves through the observers’ sightline at the front while the ${secondEnemy} reflects squad telemetry toward the rear line. A clean victory will preserve the squad’s account; a confused one will support the faction’s effort to ${world.motive}. The trio must act before observation becomes control of the site.`;
    default:
      throw new Error(`Unsupported operation scene: ${plan.module.sceneKind}`);
  }
}

function renderPersonal(plan: ScenarioScenePlan, state: CanonicalGameState): string {
  const world = worldNames(state);
  const origin = lowerFirst(factValue(factForRole(plan, 'origin')));
  const prior = plan.facts.find((binding) => binding.role !== 'origin')!.fact;
  const priorReference = decisionReference(prior);
  const hero = plan.lead;
  const heroPossessive = possessiveName(hero.name);
  const subject = hero.pronouns.subject;
  const pastBe = subject.toLowerCase() === 'they' ? 'were' : 'was';

  switch (plan.module.sceneKind) {
    case 'sealed-record':
      return `After ${priorReference}, the ${world.civic} summons ${hero.name} to compare the squad’s telemetry with a sealed file from ${origin}. One timestamp places ${heroPossessive} Calling at the incident before ${subject} ${pastBe} officially registered. The discrepancy could clear an omitted witness or make ${hero.name} the focus of a licence inquiry. ${hero.name} asks the squad to decide how much of the file should become public.`;
    case 'old-promise':
      return `A courier from ${origin} intercepts ${hero.name} after ${priorReference} and presents a promise signed during ${heroPossessive} formative incident. Fulfilling it would divert squad access toward an unlicensed witness; refusing it would leave that witness exposed to the institution that erased the agreement. ${hero.name} admits the signature is genuine but will not decide for the others. The squad must choose whether shared trust includes this old obligation.`;
    case 'missing-witness':
      return `The evidence trail opened by ${priorReference} leads to a witness omitted from every public account of ${origin}. The witness identifies ${hero.name} by the distinctive rule of ${heroPossessive} ${hero.callingName}, then produces a fragment of telemetry no outsider should possess. Their testimony could explain why ${hero.name} was misclassified, but releasing it would reveal the witness’s location. The squad must decide whether proof or protection matters more now.`;
    case 'calling-response':
      return `Residual pressure from ${priorReference} follows ${hero.name} back to headquarters and activates ${heroPossessive} ${hero.callingName} without a command. Its pattern matches a suppressed case from ${origin}, but it stops just short of the known awakening condition: ${lowerFirst(hero.awakeningCondition)}. The reaction offers a safer path to study the Calling and a faster path that risks institutional scrutiny. ${hero.name} asks the squad which path becomes part of their shared record.`;
    default:
      throw new Error(`Unsupported personal scene: ${plan.module.sceneKind}`);
  }
}

function renderDiscovery(plan: ScenarioScenePlan, state: CanonicalGameState): string {
  const world = worldNames(state);
  const origin = lowerFirst(factValue(factForRole(plan, 'origin')));
  const prior = plan.facts.find((binding) => binding.role !== 'origin')!.fact;
  const cause = decisionReference(prior);
  const hero = plan.lead;
  const heroPossessive = possessiveName(hero.name);

  switch (plan.module.sceneKind) {
    case 'buried-signal':
      return `A maintenance receiver beneath ${world.city} repeats the same cadence that surfaced during ${cause}. ${hero.name} recognises a second layer because experience with ${origin} taught ${hero.pronouns.object} how hidden pressure channels are identified. Following it could expose who buried the transmitter, but the route passes beyond the licensed breach line. The squad must decide whether the signal is evidence worth crossing for.`;
    case 'living-relic':
      return `A relic recovered after ${cause} ignores the ${world.civic} catalogue team and responds when ${hero.name} enters the room. Its inner seal bears a service mark from ${origin}, though the institution denies ever handling living breach matter. The relic mirrors ${heroPossessive} ${hero.callingName} without granting control, making ownership both valuable and dangerous. The squad can secure it as evidence or leave the bond dormant at the site.`;
    case 'residual-trace':
      return `Surveyors find a second pressure trace branching away from ${cause}, too deliberate to be debris from the closure. ${hero.name} can read the branch because experience with ${origin} taught ${hero.pronouns.object} a discarded method for separating living signatures from structural noise. The trace points toward protected infrastructure and fades whenever the ${world.civic} scanners approach. The squad must choose between preserving the hidden route and securing a sample before it disappears.`;
    case 'hidden-archive':
      return `The key recovered through ${cause} opens no door, but it causes a blank wall beneath ${world.city} to display an archive index. ${hero.name} recognises the indexing rule from ${origin}; one missing entry carries the same identifier as ${heroPossessive} Calling. Opening it may explain the connection, while also notifying whoever concealed the archive. The squad must decide whether knowledge is worth announcing their presence.`;
    default:
      throw new Error(`Unsupported discovery scene: ${plan.module.sceneKind}`);
  }
}

function renderRival(plan: ScenarioScenePlan, state: CanonicalGameState): string {
  const world = worldNames(state);
  const operation = plan.facts.find((binding) => binding.role === 'prior-operation')?.fact;
  const first = operation ?? plan.facts[0].fact;
  const second =
    plan.facts.find((binding) => binding.fact.id !== first.id)?.fact ?? plan.facts[1].fact;
  const firstCause = decisionReference(first);
  const secondOutcome = decisionOutcome(second);
  const secondArtifact = decisionArtifact(second);
  const rivalStatus = plan.rank === 'Gold' ? 'decorated' : 'higher-ranked';
  const trust =
    plan.relationshipBand === 'trusted'
      ? `${plan.lead.name} and ${plan.partner.name} have enough trust to present one account, but disagreement in public would still strengthen the claim.`
      : plan.relationshipBand === 'strained'
        ? `The filing targets an existing disagreement between ${plan.lead.name} and ${plan.partner.name}, making a divided response especially dangerous.`
        : `${plan.lead.name} and ${plan.partner.name} must agree on one account before either speaks for the squad.`;

  switch (plan.module.sceneKind) {
    case 'illegal-technique-claim':
      return `A ${rivalStatus} squad files an objection to ${firstCause}, alleging that the decisive technique was never licensed. Its filing also cites ${secondArtifact} as proof that the trio concealed where the technique came from. ${trust} The squad’s ${plan.rank} licence gives it the right to choose between a monitored demonstration and a formal challenge through the ${world.guild}.`;
    case 'edited-record':
      return `A rival squad publishes an edited version of ${firstCause} in which its own intervention creates the opening that won the encounter. The edit removes ${secondArtifact}, so it looks plausible to anyone who saw only the public feed. ${trust} The trio’s ${plan.rank} licence lets it reproduce the technique under observation or force the dispute onto the complete telemetry.`;
    case 'public-challenge':
      return `The ranking board converts the dispute around ${firstCause} into a public challenge with deliberately poor starting conditions. Organisers exclude ${secondArtifact} from the briefing, preventing the trio from using its strongest contextual evidence. ${trust} Accepting could strengthen the squad’s ${plan.rank} licence; refusing would let the rival version stand uncontested.`;
    case 'closure-credit':
      return `Another squad claims contractual credit for ${firstCause}, arguing that its earlier survey made the closure possible. It presents ${secondArtifact} as a separate incident, even though the two are causally linked in the squad’s evidence. ${trust} Under the trio’s ${plan.rank} licence, the ${world.guild} must accept either a public test or a documented challenge before assigning the reward.`;
    default:
      throw new Error(`Unsupported rival scene: ${plan.module.sceneKind}`);
  }
}

function renderSocial(plan: ScenarioScenePlan, state: CanonicalGameState): string {
  const world = worldNames(state);
  const first = plan.facts[0].fact;
  const second = plan.facts[1].fact;
  const firstOutcome = decisionOutcome(first);
  const secondOutcome = decisionOutcome(second);
  const secondReference = decisionReference(second);
  const secondArtifact = decisionArtifact(second);
  const licence = `${plan.rank} licence`;

  switch (plan.module.sceneKind) {
    case 'district-testimony':
      return `District witnesses ask ${plan.lead.name} and ${plan.partner.name} to testify after ${firstOutcome}. Their account also depends on how the squad handled ${secondArtifact}, a detail the ${world.civic} wants withheld until its inquiry closes. Supporting the witnesses may cost the squad access tied to its ${licence}; supporting the office would leave the district without a public explanation. The hearing begins before either side can change the terms.`;
    case 'licence-hearing':
      return `The ${world.civic} summons ${plan.lead.name} and ${plan.partner.name} to a licence hearing because ${firstOutcome}. ${world.faction}, still trying to ${world.motive}, uses the dispute to argue that independent squads should surrender their raw telemetry. The trio’s ${licence} is not yet at risk, but its future access to evidence is. The squad must choose whose account receives its support.`;
    case 'called-favour':
      return `A district official approaches ${plan.lead.name} and ${plan.partner.name}, invokes the goodwill created when ${firstOutcome}, and asks the squad to suppress one detail from the case involving ${secondArtifact}. The detail would embarrass the office without changing the immediate threat forecast, yet hiding it would weaken every later challenge to the official account. The request tests whether the trio’s public allies can also set its limits. The squad must answer before the report is filed.`;
    case 'report-ownership':
      return `${plan.lead.name} and ${plan.partner.name} receive three competing claims to the report after ${firstOutcome}: one from the ${world.civic}, one from the ${world.guild}, and one from district witnesses. Their versions classify ${secondReference} as proof, misconduct, or irrelevant context. The squad’s ${licence} gives it standing to choose an account, while its ${plan.reputation >= 0 ? 'positive' : 'damaged'} reputation ensures that choice will travel. The trio must decide who can publish the complete evidence.`;
    default:
      throw new Error(`Unsupported social scene: ${plan.module.sceneKind}`);
  }
}

export function renderScenarioScene(plan: ScenarioScenePlan, state: CanonicalGameState): string {
  let paragraph: string;
  switch (plan.module.category) {
    case 'operation':
      paragraph = renderOperation(plan, state);
      break;
    case 'personal':
      paragraph = renderPersonal(plan, state);
      break;
    case 'discovery':
      paragraph = renderDiscovery(plan, state);
      break;
    case 'rival':
      paragraph = renderRival(plan, state);
      break;
    case 'social':
      paragraph = renderSocial(plan, state);
      break;
  }
  assertNoUnresolvedSlots(paragraph);
  if (/\s{2,}/.test(paragraph)) throw new Error(`Double whitespace in scene ${plan.module.id}.`);
  if (!/[.!?]$/.test(paragraph)) throw new Error(`Scene ${plan.module.id} is not complete.`);
  if (paragraph.split(/(?<=[.!?])\s+/).length < 3)
    throw new Error(`Scene ${plan.module.id} lacks a complete discourse arc.`);
  return paragraph;
}
