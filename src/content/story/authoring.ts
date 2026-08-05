import type { StoryAuthoringSource } from './contract.ts';

/**
 * @deprecated Archived modern-city corpus from the pre-mythic prototype.
 *
 * Production campaigns are authored by `mythic-review.ts`, `opening-recruitment.ts`, and
 * `quest-arcs.ts`. Keep this fixture only while its old schema/realiser tests remain useful; do
 * not import it into campaign generation or describe it as production content.
 */
export const LEGACY_MODERN_STORY_AUTHORING = {
  schemaVersion: 1,
  voice: {
    promise:
      'Clear, propulsive fantasy about overlooked people earning visible power while deciding who gets protected, believed, and remembered.',
    viewpoint:
      'Stay close to one hero at a time. Show the physical detail they notice first, the private fear it awakens, and the choice they make anyway.',
    sentenceRhythm:
      'Open with a clean image, tighten through a concrete complication, then end on an irreversible choice or an unanswered question.',
    sceneRule:
      'Every brief must establish where the heroes are, what changed because of an earlier cause, what will be lost if they wait, and why this squad must answer.',
    progressionRule:
      'New strength must solve an old frustration, expose a harder cost, and make the hero recognisably different in the next scene.',
    mysteryRule:
      'Reveal one testable answer at a time. Each answer should close a small question while opening a more personal one.',
    prohibitedShortcuts: [
      'Do not combine unrelated biography fragments.',
      'Do not name a prior fact without explaining how it changes the present scene.',
      'Do not use institutional language where a physical image or human consequence is clearer.',
      'Do not describe a technique only as damage, healing, a buff, or a status effect.',
      'Do not promise emotions the scene has not earned through action.',
    ],
  },
  worlds: [
    {
      id: 'lumen-port',
      city: {
        name: 'Lumen Port',
        sensoryIdentity:
          'Rain shines blue on elevated rails, salt gathers on old flood walls, and warning lamps burn beneath the harbour.',
        ordinaryLife:
          'Night markets open under the train arches while commuters trade breach forecasts with the morning weather.',
        oldWound:
          'During the First Cascade, an entire underground line vanished from the civic map with two trains still inside it.',
      },
      civicOrder: {
        name: 'Breach Safety Directorate',
        publicPromise: 'No district will face an open breach without a licensed response.',
        blindSpot:
          'Its closure records protect the city from panic, but also make inconvenient survivors easy to erase.',
      },
      guild: {
        name: 'Contract Squad Registry',
        publicPromise: 'Any three compatible Calling-bearers can earn a public licence.',
        pressure:
          'A squad that cannot build rank loses access to the equipment and routes that make higher-rank work survivable.',
      },
      rankTiers: ['Unranked', 'Bronze', 'Silver', 'Gold'],
      breachLaw:
        'Every breach leaves a pressure trace that can be measured until someone deliberately severs it.',
      powerLaw:
        'A Calling grows only when its bearer acts through the personal condition that first awakened it.',
      threatEcology:
        'Predators follow the pressure wakes beneath transit lines, while stranger colonies settle wherever old closures were falsified.',
      faction: {
        name: 'The Meridian Office',
        publicFace: 'A private archive that restores documents damaged during the First Cascade.',
        secretMotive: 'own the missing transit record before its survivors can challenge the city',
      },
      sceneVocabulary: {
        crisisSite: 'the rain-bright Glassline platforms',
        hiddenRoute: 'the drowned Blackwater Line',
        publicVenue: 'Floodwall Hall',
        publicSignal: 'the blue harbour warning lamps',
        recordMedium: 'the pressure-trace closure ledger',
        privateRefuge: 'a shuttered tea stall beneath the night market',
      },
      premise: {
        requiredSlots: ['city', 'civic', 'guild', 'faction', 'factionMotive'],
        sentences: [
          'In {city}, the last trains run above streets where rain makes every breach alarm shine like a second moon.',
          'The {civic} promises that no district stands alone, while the {guild} turns that promise into contracts, rankings, and three-person squads.',
          'Beneath the public order, {faction} intends to {factionMotive}.',
          'A newly licensed trio takes its first closure on the night a signal returns from a railway the city insists never existed.',
        ],
      },
      campaignQuestion:
        'Who survived on the missing line, and why does the city fear their account more than the breaches beneath it?',
    },
    {
      id: 'vanta-cross',
      city: {
        name: 'Vanta Cross',
        sensoryIdentity:
          'Rank banners ripple between black-glass towers, arena bells mark the hours, and static prickles before every breach storm.',
        ordinaryLife:
          'Children collect squad cards, shops offer discounts by licence colour, and whole districts watch the rankings before they watch the news.',
        oldWound:
          'The city survived its longest breach season by abandoning the outer wards in an order that no official now admits signing.',
      },
      civicOrder: {
        name: 'Municipal Threshold Bureau',
        publicPromise: 'Protection is assigned by transparent risk and proven squad performance.',
        blindSpot:
          'Performance data rewards visible victories while hiding the people who were never given a defender.',
      },
      guild: {
        name: 'Licensed Company Compact',
        publicPromise: 'Rank belongs to whoever can earn it in public.',
        pressure:
          'Sponsors control training halls, prime contracts, and which failures the public is allowed to forget.',
      },
      rankTiers: ['Unranked', 'Bronze', 'Silver', 'Gold'],
      breachLaw:
        'Breach storms gather around neglected Calling emissions before tearing open at the weakest civic boundary.',
      powerLaw:
        'A witnessed feat strengthens a Calling, but an honest bond can strengthen it more deeply than applause.',
      threatEcology:
        'Storm-fed hunters grow bolder near crowded arenas, learning the rhythms of whatever techniques win most often.',
      faction: {
        name: 'The Crownless Academy',
        publicFace: 'A scholarship school for talents without sponsors.',
        secretMotive:
          'bind unsponsored prodigies to the Academy before they can expose how rank trials are fixed',
      },
      sceneVocabulary: {
        crisisSite: 'the storm-ringed Crown Arena',
        hiddenRoute: 'the service maze beneath the ranking towers',
        publicVenue: 'the Grand Ascension Amphitheatre',
        publicSignal: 'the citywide rank bells',
        recordMedium: 'the black-glass performance record',
        privateRefuge: 'an unsponsored rooftop training court',
      },
      premise: {
        requiredSlots: ['city', 'civic', 'guild', 'faction', 'factionMotive'],
        sentences: [
          'Every tower in {city} carries a rank board, and every board teaches the same lesson: power only matters after a crowd believes it.',
          'The {civic} sends protection where the numbers demand, while the {guild} sells the best numbers to the best-sponsored squads.',
          'From its charity arenas, {faction} works to {factionMotive}.',
          'Then an unranked trio wins a doomed district contract, and the victory appears on every board except the official record.',
        ],
      },
      campaignQuestion:
        'Can the squad climb a ranking designed to own its winners without becoming another performance the city can edit?',
    },
    {
      id: 'halcyon-ward',
      city: {
        name: 'Halcyon Ward',
        sensoryIdentity:
          'White gardens grow over sealed construction pits, relic chimes murmur in the walls, and warm dust falls from buildings that dream.',
        ordinaryLife:
          'Residents leave offerings beside maintenance hatches and pretend the answering knocks are only pipes.',
        oldWound:
          'A civic renewal project built half the city over a buried settlement whose living relics were declared inert.',
      },
      civicOrder: {
        name: 'Civic Incursion Authority',
        publicPromise: 'Every awakened relic will be contained without harm to residents.',
        blindSpot:
          'It treats anything that cannot speak in an approved way as property rather than a witness.',
      },
      guild: {
        name: 'Threefold Licence Council',
        publicPromise: 'No relic site is entered without three Callings able to check one another.',
        pressure:
          'A bonded hero is promoted as an asset until the bond begins asking questions of its own.',
      },
      rankTiers: ['Unranked', 'Bronze', 'Silver', 'Gold'],
      breachLaw:
        'A sealed relic can sleep for generations, but a lie told over its resting place gives it a voice.',
      powerLaw:
        'A Calling may be inherited from a person, a place, or a promise that refuses to die.',
      threatEcology:
        'Living structures defend buried memories by growing guardians from stone, wire, roots, and borrowed dreams.',
      faction: {
        name: 'The Quiet Survey',
        publicFace: 'A neutral team mapping relic risk beneath new construction.',
        secretMotive:
          'hide proof that the city itself is waking because its oldest promise was broken',
      },
      sceneVocabulary: {
        crisisSite: 'the whispering foundations of White Garden',
        hiddenRoute: 'the root corridor beneath the sealed settlement',
        publicVenue: 'the Hall of Three Chimes',
        publicSignal: 'the relic chimes inside the walls',
        recordMedium: 'the dreaming-stone memory',
        privateRefuge: 'a memorial greenhouse closed after dusk',
      },
      premise: {
        requiredSlots: ['city', 'civic', 'guild', 'faction', 'factionMotive'],
        sentences: [
          'The houses of {city} have begun whispering the names of people who vanished before their foundations were poured.',
          'The {civic} calls it a containment problem, and the {guild} sends three-person squads to quiet each address before dawn.',
          'Only {faction} knows enough to {factionMotive}.',
          'When a wall speaks directly to one newly licensed hero, the squad must decide whether its first duty is to the living city or the life buried beneath it.',
        ],
      },
      campaignQuestion:
        'What promise is the city trying to remember, and which of the heroes was chosen to keep it?',
    },
    {
      id: 'cinder-bay',
      city: {
        name: 'Cinder Bay',
        sensoryIdentity:
          'Red ash drifts across canal lights, salvage cranes loom over tiled roofs, and bottled breach-fire glows behind shop counters.',
        ordinaryLife:
          'Families heat their homes with licensed breach cells while pretending not to ask where the cheapest ones came from.',
        oldWound:
          'A refinery fire once burned for nine days and left a second shoreline visible only to Calling-bearers.',
      },
      civicOrder: {
        name: 'District Breach Commission',
        publicPromise: 'Every dangerous harvest will be traced from breach to buyer.',
        blindSpot:
          'The same companies it audits supply the equipment keeping poor districts alive.',
      },
      guild: {
        name: 'Independent Squad Exchange',
        publicPromise: 'Contracts belong to the squad willing to take the risk.',
        pressure:
          'Crews buy their own gear, carry their own injuries, and can be ruined by one disputed closure.',
      },
      rankTiers: ['Unranked', 'Bronze', 'Silver', 'Gold'],
      breachLaw:
        'Harvested breach matter remembers its source and strains toward anything taken from the same opening.',
      powerLaw:
        'A Calling can consume stored breach matter for speed, but every use makes the source better able to recognise its bearer.',
      threatEcology:
        'Scavengers hunt illegal harvest routes, feeding on discarded cells until their bodies mimic the tools used against them.',
      faction: {
        name: 'Ashline Holdings',
        publicFace: "The city's largest supplier of affordable breach equipment.",
        secretMotive:
          'provoke controlled disasters until it can patent the only gear capable of surviving them',
      },
      sceneVocabulary: {
        crisisSite: 'the ash-lit Ember Canal exchange',
        hiddenRoute: 'the second shoreline beyond the refinery wall',
        publicVenue: "the Salvagers' Auction Court",
        publicSignal: 'the red flare cranes above the bay',
        recordMedium: 'the heat-memory salvage ledger',
        privateRefuge: 'a canal-side clinic behind the bottle market',
      },
      premise: {
        requiredSlots: ['city', 'civic', 'guild', 'faction', 'factionMotive'],
        sentences: [
          'In {city}, even a kitchen flame may have been cut from a breach and sold three times before breakfast.',
          'The {civic} promises to trace every spark, while the {guild} rewards squads that close danger without asking who first opened it.',
          'Behind the bargain equipment, {faction} plans to {factionMotive}.',
          'A new trio finds its own licence number stamped inside a monster that should have died before any of them awakened.',
        ],
      },
      campaignQuestion:
        'Who prepared the squad for a disaster that has not happened yet, and what will awaken when the city finally burns?',
    },
  ],
  sceneModules: [
    {
      id: 'operation-1',
      category: 'operation',
      title: 'The Warning That Returned',
      sceneKind: 'breach-return',
      choiceSetId: 'operation-1',
      leadRoles: ['vanguard', 'striker', 'support'],
      initialFactRoles: ['faction', 'city'],
      continuationFactRoles: ['prior-operation', 'city'],
      initial: {
        requiredSlots: [
          'city',
          'enemyOne',
          'enemyTwo',
          'faction',
          'factionMotive',
          'civic',
          'lead',
          'calling',
          'crisisSite',
          'hiddenRoute',
          'publicSignal',
          'recordMedium',
        ],
        sentences: [
          '{publicSignal} fail all at once across {city}; at {crisisSite}, {enemyOne} drives civilians toward the breach while {enemyTwo} hunts above their only clear escape.',
          '{faction}, determined to {factionMotive}, has locked away {recordMedium}, the one account showing how both threats entered through {hiddenRoute}.',
          'The {civic} will release that evidence only if the new squad accepts immediate responsibility, and the people inside the cordon are already losing ground.',
          '{lead} feels {calling} answer the silence, leaving the trio one formation and one chance to reopen the way out.',
        ],
      },
      continuation: {
        requiredSlots: [
          'priorReference',
          'city',
          'enemyOne',
          'priorArtifact',
          'enemyTwo',
          'lead',
          'calling',
          'crisisSite',
          'hiddenRoute',
          'publicSignal',
          'recordMedium',
        ],
        sentences: [
          '{publicSignal} flare above {crisisSite} as the pressure trail from {priorReference} wakes again beneath {city}.',
          "{enemyOne} breaks the evacuation line while {enemyTwo} reads {priorArtifact} through {recordMedium} and marks the squad's last formation.",
          'The enemy has learned from the closure, and fresh movement is already coming through {hiddenRoute}.',
          "{lead} feels {calling} pull toward the front, but the trio must choose its whole formation before that instinct becomes the enemy's trap.",
        ],
      },
    },
    {
      id: 'operation-2',
      category: 'operation',
      title: 'When the Signal Failed',
      sceneKind: 'junction-pressure',
      choiceSetId: 'operation-2',
      leadRoles: ['vanguard', 'striker', 'support'],
      initialFactRoles: ['city', 'faction'],
      continuationFactRoles: ['prior-social', 'city'],
      initial: {
        requiredSlots: [
          'city',
          'enemyOne',
          'enemyTwo',
          'faction',
          'factionMotive',
          'lead',
          'calling',
          'crisisSite',
          'publicSignal',
          'recordMedium',
        ],
        sentences: [
          'At {crisisSite}, {publicSignal} begin issuing two contradictory evacuation orders across {city} while {enemyOne} crosses the crowd and {enemyTwo} repeats familiar voices from somewhere unseen.',
          '{faction} offers an uncorrupted copy of {recordMedium} in exchange for the recovered evidence, another step in its plan to {factionMotive}.',
          "The nearest civilians are already following the false instruction, but trusting the private correction may put the whole rescue inside someone else's design.",
          '{lead} listens to {calling} beneath the noise and must decide which threat the squad will make visible first.',
        ],
      },
      continuation: {
        requiredSlots: [
          'priorReference',
          'priorArtifact',
          'city',
          'enemyOne',
          'enemyTwo',
          'lead',
          'calling',
          'crisisSite',
          'publicSignal',
          'recordMedium',
        ],
        sentences: [
          'The public attention created by {priorReference} draws a crowd to {crisisSite} just as {priorArtifact} begins speaking through {publicSignal}.',
          "{enemyOne} hunts by movement while {enemyTwo} copies the squad's voices into {recordMedium}, turning its own evidence against it across {city}.",
          'Retreat would keep the trio alive but abandon every witness who trusted its last public promise.',
          '{lead} steadies {calling} against the false voices and asks the squad to make one fast, visible answer.',
        ],
      },
    },
    {
      id: 'operation-3',
      category: 'operation',
      title: 'A Promise Split in Two',
      sceneKind: 'split-route',
      choiceSetId: 'operation-3',
      leadRoles: ['vanguard', 'striker', 'support'],
      initialFactRoles: ['city', 'faction'],
      continuationFactRoles: ['prior-operation', 'prior-decision'],
      initial: {
        requiredSlots: [
          'city',
          'enemyOne',
          'enemyTwo',
          'civic',
          'faction',
          'lead',
          'calling',
          'crisisSite',
          'hiddenRoute',
          'recordMedium',
        ],
        sentences: [
          'At {crisisSite}, {hiddenRoute} divides around the breach: {enemyOne} blocks the nearer way while {enemyTwo} erases every safe mark above the farther one.',
          '{faction} supplied {recordMedium}, and the {civic} has sent two crowds toward opposite sides of {city} while insisting both orders were correct.',
          'Whichever group the squad reaches first will be safe, but the other will face the enemy that best counters the abandoned line.',
          '{lead} sees {calling} divide across both paths and has seconds to turn three heroes into a formation that can hold two promises.',
        ],
      },
      continuation: {
        requiredSlots: [
          'priorReference',
          'priorArtifact',
          'enemyOne',
          'enemyTwo',
          'lead',
          'calling',
          'crisisSite',
          'hiddenRoute',
          'recordMedium',
        ],
        sentences: [
          'The people affected by {priorReference} arrive at opposite sides of {crisisSite}, each carrying a different account of {priorArtifact} in {recordMedium}.',
          '{enemyOne} takes the direct approach while {enemyTwo} removes every safe mark along {hiddenRoute}.',
          "Saving either crowd first will make the other believe the squad's earlier choice was only a slogan.",
          '{lead} watches {calling} flicker toward both groups and must give the trio a plan that can survive being divided.',
        ],
      },
    },
    {
      id: 'operation-4',
      category: 'operation',
      title: 'A Victory Under Watch',
      sceneKind: 'observed-closure',
      choiceSetId: 'operation-4',
      leadRoles: ['vanguard', 'striker', 'support'],
      initialFactRoles: ['faction', 'city'],
      continuationFactRoles: ['prior-social', 'faction'],
      initial: {
        requiredSlots: [
          'faction',
          'city',
          'factionMotive',
          'enemyOne',
          'enemyTwo',
          'lead',
          'calling',
          'crisisSite',
          'publicVenue',
          'recordMedium',
        ],
        sentences: [
          '{faction} invites the audience at {publicVenue} to watch a fresh breach at {crisisSite}, claiming {city} deserves a clean closure while it works to {factionMotive}.',
          "{enemyOne} drives witnesses toward the opening while {enemyTwo} turns {recordMedium} against the squad's rear line.",
          'The trio can save the crowd, but one confused moment will let the observers decide whose plan deserves the credit.',
          '{lead} feels {calling} recoil from the watching crowd and steps forward before observation becomes control.',
        ],
      },
      continuation: {
        requiredSlots: [
          'priorReference',
          'priorArtifact',
          'faction',
          'factionMotive',
          'enemyOne',
          'enemyTwo',
          'lead',
          'calling',
          'crisisSite',
          'publicVenue',
          'recordMedium',
        ],
        sentences: [
          '{faction} uses {priorReference} to place observers from {publicVenue} inside the next closure at {crisisSite}.',
          '{enemyOne} herds witnesses toward the breach while {enemyTwo} reflects {recordMedium} toward the rear and presents {priorArtifact} as proof that supervision is necessary.',
          'A clean victory will preserve the truth; a messy one will help the faction {factionMotive}.',
          "{lead} quiets {calling} long enough to choose a formation the audience cannot turn into somebody else's story.",
        ],
      },
    },
    {
      id: 'personal-1',
      category: 'personal',
      title: 'The Name Beneath the Seal',
      sceneKind: 'sealed-record',
      choiceSetId: 'personal-1',
      leadRoles: ['vanguard', 'striker', 'support'],
      continuationFactRoles: ['origin', 'prior-operation'],
      continuation: {
        requiredSlots: [
          'lead',
          'civic',
          'priorReference',
          'leadOrigin',
          'calling',
          'priorArtifact',
          'partner',
          'publicVenue',
          'recordMedium',
        ],
        sentences: [
          'After {priorReference}, the {civic} summons {lead} to a private chamber inside {publicVenue}.',
          'An entry from {leadOrigin} places {calling} at the formative incident before the hero was officially registered, and both {recordMedium} and {priorArtifact} carry the same impossible timestamp.',
          'Releasing the file could restore an erased witness, but it would also make {lead} the subject of the next inquiry.',
          '{partner} waits beside the unopened record while {lead} asks how much truth the squad is willing to survive.',
        ],
      },
    },
    {
      id: 'personal-2',
      category: 'personal',
      title: 'The Promise That Found Us',
      sceneKind: 'old-promise',
      choiceSetId: 'personal-2',
      leadRoles: ['vanguard', 'striker', 'support'],
      continuationFactRoles: ['origin', 'prior-decision'],
      continuation: {
        requiredSlots: [
          'lead',
          'leadOrigin',
          'priorReference',
          'priorArtifact',
          'partner',
          'calling',
          'privateRefuge',
          'recordMedium',
        ],
        sentences: [
          'A courier from {leadOrigin} finds {lead} at {privateRefuge} after {priorReference} and places an old promise between the squad.',
          "Keeping it would divert access from {priorArtifact} to an unlicensed witness; breaking it would leave that witness exposed and let {recordMedium} preserve the institution's lie.",
          '{lead} admits the signature is genuine, but the hand holding the page shakes whenever {calling} draws near.',
          '{partner} asks whether joining a squad means inheriting the promises its members were too frightened to confess.',
        ],
      },
    },
    {
      id: 'personal-3',
      category: 'personal',
      title: 'A Witness With No Record',
      sceneKind: 'missing-witness',
      choiceSetId: 'personal-3',
      leadRoles: ['vanguard', 'striker', 'support'],
      continuationFactRoles: ['origin', 'prior-operation'],
      continuation: {
        requiredSlots: [
          'priorReference',
          'lead',
          'calling',
          'leadOrigin',
          'priorArtifact',
          'partner',
          'privateRefuge',
          'recordMedium',
        ],
        sentences: [
          "The trail from {priorReference} ends at {privateRefuge}, where a witness recognises {lead} by the sound of {calling} before seeing the hero's face.",
          'The witness remembers {leadOrigin} and carries a fragment that connects {recordMedium} to {priorArtifact}.',
          'Publishing the proof could repair the record, but every identifying detail would point the people who erased it toward this refuge.',
          '{partner} bars the door while {lead} chooses between being believed and keeping the only witness alive.',
        ],
      },
    },
    {
      id: 'personal-4',
      category: 'personal',
      title: 'What the Calling Wants',
      sceneKind: 'calling-response',
      choiceSetId: 'personal-4',
      leadRoles: ['vanguard', 'striker', 'support'],
      continuationFactRoles: ['origin', 'prior-operation'],
      continuation: {
        requiredSlots: [
          'priorReference',
          'lead',
          'calling',
          'leadOrigin',
          'priorArtifact',
          'awakening',
          'partner',
          'privateRefuge',
          'recordMedium',
        ],
        sentences: [
          'Residual pressure from {priorReference} follows {lead} into {privateRefuge} and wakes {calling} without permission.',
          'Its pattern matches a suppressed case from {leadOrigin}, while {priorArtifact} pulses in answer through {recordMedium}.',
          'The power stops one step short of asking the hero to {awakening}, offering a safe study or a dangerous shortcut to mastery.',
          '{partner} reaches for the alarm as {lead} decides whether growth is worth letting the hidden observer know the Calling answered.',
        ],
      },
    },
    {
      id: 'discovery-1',
      category: 'discovery',
      title: 'A Voice Below the City',
      sceneKind: 'buried-signal',
      choiceSetId: 'discovery-1',
      leadRoles: ['vanguard', 'striker', 'support'],
      continuationFactRoles: ['origin', 'prior-personal'],
      continuation: {
        requiredSlots: [
          'city',
          'priorReference',
          'lead',
          'leadOrigin',
          'calling',
          'priorArtifact',
          'hiddenRoute',
          'publicSignal',
          'recordMedium',
        ],
        sentences: [
          'Beneath {city}, {publicSignal} repeats a voice first heard during {priorReference}, drawing the squad toward {hiddenRoute}.',
          '{lead} recognises the hidden rhythm from {leadOrigin}, and {calling} answers each repetition with a pulse of its own.',
          'The signal points beyond the licensed line, where {priorArtifact} appears as a new entry inside {recordMedium}.',
          'Following it may reveal who sent the message, but it will also tell the sender exactly which hero heard.',
        ],
      },
    },
    {
      id: 'discovery-2',
      category: 'discovery',
      title: 'The Relic That Chose a Name',
      sceneKind: 'living-relic',
      choiceSetId: 'discovery-2',
      leadRoles: ['vanguard', 'striker', 'support'],
      continuationFactRoles: ['origin', 'prior-personal'],
      continuation: {
        requiredSlots: [
          'priorReference',
          'civic',
          'lead',
          'calling',
          'leadOrigin',
          'priorArtifact',
          'crisisSite',
          'recordMedium',
        ],
        sentences: [
          'A relic recovered from {crisisSite} after {priorReference} stays cold for the {civic} examiners and wakes the instant {lead} enters.',
          'Its inner seal mirrors {calling} and bears a service mark from {leadOrigin}, though every surviving record denies the two ever met.',
          'When an examiner reaches for it, the relic speaks one name through {priorArtifact} and burns that name into {recordMedium}.',
          'The squad can claim responsibility for the bond or leave the relic sleeping where the next official may never ask permission.',
        ],
      },
    },
    {
      id: 'discovery-3',
      category: 'discovery',
      title: 'The Footprint After the Door',
      sceneKind: 'residual-trace',
      choiceSetId: 'discovery-3',
      leadRoles: ['vanguard', 'striker', 'support'],
      continuationFactRoles: ['prior-operation', 'origin'],
      continuation: {
        requiredSlots: [
          'priorReference',
          'priorArtifact',
          'lead',
          'leadOrigin',
          'calling',
          'civic',
          'crisisSite',
          'hiddenRoute',
          'publicSignal',
        ],
        sentences: [
          'At {crisisSite}, a second pressure trail branches away from {priorReference}, too deliberate to be debris and too fresh to belong to the defeated threat.',
          'It curls around {priorArtifact} and toward {hiddenRoute} until {lead} reads the abandoned tracking method learned at {leadOrigin}.',
          '{calling} reveals footsteps moving away from the breach before it opened, and each print fades whenever {publicSignal} warn that a {civic} scanner is near.',
          'Taking a sample will disturb the path, while preserving it means following without proof into whatever walked out first.',
        ],
      },
    },
    {
      id: 'discovery-4',
      category: 'discovery',
      title: 'The Record That Answered',
      sceneKind: 'hidden-archive',
      choiceSetId: 'discovery-4',
      leadRoles: ['vanguard', 'striker', 'support'],
      continuationFactRoles: ['origin', 'prior-personal'],
      continuation: {
        requiredSlots: [
          'priorArtifact',
          'city',
          'lead',
          'leadOrigin',
          'calling',
          'priorReference',
          'hiddenRoute',
          'publicSignal',
          'recordMedium',
        ],
        sentences: [
          '{priorArtifact} opens no lock, but beside {hiddenRoute} it makes {recordMedium} reveal a list of names hidden beneath its public account.',
          '{lead} recognises the pattern from {leadOrigin}, and one missing entry carries the same identifier as {calling}.',
          'The record claims that {priorReference} was predicted years before the squad formed, then makes {publicSignal} offer to identify who signed the prediction.',
          'Opening the entry may answer the question, but whatever listens beneath {city} already knows the hero is there.',
        ],
      },
    },
    {
      id: 'rival-1',
      category: 'rival',
      title: 'The Technique They Say Is Theirs',
      sceneKind: 'illegal-technique-claim',
      choiceSetId: 'rival-1',
      leadRoles: ['vanguard', 'striker', 'support'],
      continuationFactRoles: ['prior-operation', 'prior-discovery'],
      continuation: {
        requiredSlots: [
          'rank',
          'priorReference',
          'priorArtifact',
          'lead',
          'partner',
          'guild',
          'calling',
          'publicVenue',
          'recordMedium',
        ],
        sentences: [
          'Before the audience at {publicVenue}, a {rank} rival squad challenges the result of {priorReference} and claims the decisive movement belongs to its private school.',
          'Its version of {recordMedium} names {priorArtifact} as proof that the trio concealed the true source, then demands {lead} repeat the technique live.',
          '{partner} notices the rival diagram contains a mistake only someone studying {calling} from a distance would make.',
          'The {guild} offers two answers: perform inside the trap or force the accusation onto evidence the rivals cannot choreograph.',
        ],
      },
    },
    {
      id: 'rival-2',
      category: 'rival',
      title: 'The Missing Second of Victory',
      sceneKind: 'edited-record',
      choiceSetId: 'rival-2',
      leadRoles: ['vanguard', 'striker', 'support'],
      continuationFactRoles: ['prior-operation', 'prior-personal'],
      continuation: {
        requiredSlots: [
          'priorReference',
          'priorArtifact',
          'lead',
          'partner',
          'calling',
          'rank',
          'publicVenue',
          'recordMedium',
        ],
        sentences: [
          'At {publicVenue}, a rival squad presents {priorReference} with one moment missing, and inside that gap its leader appears to create the opening that won the fight.',
          'The edit removes {priorArtifact} from {recordMedium}, making the lie clean enough to survive anyone who was not there.',
          '{lead} can reproduce the moment with {calling}, but {partner} warns that a perfect performance may prove ownership without proving truth.',
          "With the squad's {rank} standing under public judgment, the trio must choose between a spectacle and the slower danger of complete evidence.",
        ],
      },
    },
    {
      id: 'rival-3',
      category: 'rival',
      title: 'A Challenge Built to Break Us',
      sceneKind: 'public-challenge',
      choiceSetId: 'rival-3',
      leadRoles: ['vanguard', 'striker', 'support'],
      continuationFactRoles: ['prior-operation', 'prior-discovery'],
      continuation: {
        requiredSlots: [
          'guild',
          'priorReference',
          'priorArtifact',
          'lead',
          'calling',
          'partner',
          'rank',
          'publicVenue',
          'recordMedium',
        ],
        sentences: [
          'The {guild} turns the dispute around {priorReference} into a challenge at {publicVenue} and gives the rival squad every favourable starting position.',
          'Organisers remove {priorArtifact} from {recordMedium}, taking away the one piece of context that makes the field honest.',
          '{lead} feels {calling} lean toward the contest, while {partner} sees how neatly the conditions turn courage into evidence for the accusation.',
          "Winning could strengthen the trio's {rank} standing, but refusing may be the only way to stop a rigged test from becoming law.",
        ],
      },
    },
    {
      id: 'rival-4',
      category: 'rival',
      title: 'Who Gets to Say We Won',
      sceneKind: 'closure-credit',
      choiceSetId: 'rival-4',
      leadRoles: ['vanguard', 'striker', 'support'],
      continuationFactRoles: ['prior-operation', 'prior-decision'],
      continuation: {
        requiredSlots: [
          'priorReference',
          'priorArtifact',
          'lead',
          'partner',
          'guild',
          'calling',
          'rank',
          'publicVenue',
          'recordMedium',
        ],
        sentences: [
          'At {publicVenue}, another squad claims the reward for {priorReference}, arguing that its abandoned survey made the closure possible.',
          'It rewrites {priorArtifact} inside {recordMedium} as a separate mistake rather than the reason the trio understood the threat in time.',
          '{lead} wants to answer with {calling} in the public test, but {partner} finds a paper trail that could expose the whole arrangement at a slower, more personal cost.',
          'The {guild} will accept only one case before assigning the reward and recording what a {rank} victory is supposed to mean.',
        ],
      },
    },
    {
      id: 'social-1',
      category: 'social',
      title: 'The People in the Back Row',
      sceneKind: 'district-testimony',
      choiceSetId: 'social-1',
      leadRoles: ['vanguard', 'striker', 'support'],
      continuationFactRoles: ['prior-rival', 'prior-discovery'],
      continuation: {
        requiredSlots: [
          'lead',
          'partner',
          'priorReference',
          'priorArtifact',
          'civic',
          'rank',
          'publicVenue',
          'recordMedium',
        ],
        sentences: [
          'The people harmed by {priorReference} fill the back of {publicVenue} and ask {lead} and {partner} to tell the part no official account includes.',
          'Their testimony depends on {priorArtifact}, which the {civic} wants removed from {recordMedium} until its private inquiry is complete.',
          'Speaking now may close routes reserved for a {rank} squad, while silence will teach the witnesses exactly how little their rescue changed.',
          "When the clerk calls the trio's name, the room becomes quiet enough to hear who is breathing in fear.",
        ],
      },
    },
    {
      id: 'social-2',
      category: 'social',
      title: 'The Price of Keeping Our Own Story',
      sceneKind: 'licence-hearing',
      choiceSetId: 'social-2',
      leadRoles: ['vanguard', 'striker', 'support'],
      continuationFactRoles: ['prior-rival', 'faction'],
      continuation: {
        requiredSlots: [
          'civic',
          'lead',
          'partner',
          'priorReference',
          'faction',
          'factionMotive',
          'priorArtifact',
          'rank',
          'publicVenue',
          'recordMedium',
        ],
        sentences: [
          'The {civic} summons {lead} and {partner} to {publicVenue} after {priorReference} and places {recordMedium} beneath a lock.',
          '{faction}, still trying to {factionMotive}, argues that independent squads should surrender every future record before leaving a breach site.',
          "Accepting would protect the current {rank} licence; refusing would keep {priorArtifact} in the squad's hands and close doors it has only just earned.",
          'The hearing calls this a question of procedure, but everyone in the room is watching to see who owns the truth after heroes risk their lives for it.',
        ],
      },
    },
    {
      id: 'social-3',
      category: 'social',
      title: 'The Favour With Teeth',
      sceneKind: 'called-favour',
      choiceSetId: 'social-3',
      leadRoles: ['vanguard', 'striker', 'support'],
      continuationFactRoles: ['prior-social', 'prior-discovery'],
      continuation: {
        requiredSlots: [
          'lead',
          'partner',
          'priorReference',
          'priorArtifact',
          'civic',
          'calling',
          'privateRefuge',
          'recordMedium',
        ],
        sentences: [
          'An official who benefited from {priorReference} finds {lead} and {partner} at {privateRefuge} and asks for one line to disappear from the next report.',
          'The line connects {priorArtifact} to {recordMedium}; removing it will protect a frightened clerk today and weaken every future challenge to the {civic}.',
          'The request sounds merciful until {calling} reacts to someone listening just beyond the refuge.',
          'The squad must answer before dessert, knowing that a favour offered in private may become a chain worn in public.',
        ],
      },
    },
    {
      id: 'social-4',
      category: 'social',
      title: 'The Story After the Battle',
      sceneKind: 'report-ownership',
      choiceSetId: 'social-4',
      leadRoles: ['vanguard', 'striker', 'support'],
      continuationFactRoles: ['prior-operation', 'prior-rival'],
      continuation: {
        requiredSlots: [
          'lead',
          'partner',
          'priorReference',
          'civic',
          'guild',
          'priorArtifact',
          'rank',
          'publicVenue',
          'recordMedium',
        ],
        sentences: [
          'After {priorReference}, {lead} and {partner} meet three claimants at {publicVenue}: one from the {civic}, one from the {guild}, and one from the witnesses who survived.',
          'Each wants control of {priorArtifact} inside {recordMedium}, and each account turns the same act into proof, misconduct, or a detail too dangerous to preserve.',
          "The squad's {rank} standing gives it the right to choose, but not the power to control what happens after the story leaves its hands.",
          'By midnight, one account will become the truth strangers inherit from the battle.',
        ],
      },
    },
  ],
  characterKits: [
    {
      id: 'iron-echo',
      role: 'vanguard',
      ageBand: 'adult',
      origin: 'a floodwall district response unit that was dissolved after a disputed closure',
      formativeEvent:
        'When command withdrew from a failing station, the future hero held the evacuation gate until every trapped passenger crossed.',
      drive: 'Build a squad promise that no office can quietly withdraw.',
      fear: 'That protecting everyone will once again mean being abandoned by the people who gave the order.',
      contradiction:
        'Distrusts authority, yet reaches for its procedures whenever frightened people need certainty.',
      temperament: 'Measured in public, fiercely attentive, and almost incapable of leaving first.',
      interiorVoice:
        'Counts exits, breathing patterns, and promises; anger arrives only after everyone else is safe.',
      personalHooks: [
        'The passenger list from the abandoned station contains one name in fresh ink.',
        'A former commander still carries the order that never reached the rescue team.',
      ],
      awakeningCondition: 'take a lethal attack meant for an ally while already Strained',
      portrait: {
        requiredSlots: ['lead', 'leadOrigin', 'calling', 'awakening'],
        sentences: [
          '{lead} comes from {leadOrigin}, where a cancelled order once left an evacuation gate without defenders.',
          'Staying behind saved the crowd and taught {lead} to hear danger as a pressure in the bones.',
          'That instinct became {calling}, an iron resonance that turns a promise to protect into something enemies must physically cross.',
          'To awaken it fully, {lead} must choose to {awakening}, the same kind of choice that once left the hero alone.',
        ],
      },
      calling: {
        id: 'iron-echo',
        name: 'Iron Echo',
        manifestation:
          "A low bell-note rolls from the bearer's ribs and hardens into dark metal crescents wherever an ally is threatened.",
        stats: { vitality: 12, power: 7, guard: 12, speed: 6, focus: 8 },
        signatureRuleId: 'rear-intercept',
        signature: {
          story:
            "The first strike that slips toward the rear rings through the bearer's body instead, pulling the protector across the formation in a flash of iron sound.",
          mechanic:
            'Once each round, intercept the first enemy attack that targets a different hero in the rear position.',
        },
        reactionRuleId: 'intercept-brace',
        reaction: {
          story:
            'The intercepted force settles over the bearer like overlapping plates instead of disappearing.',
          mechanic: 'After an interception, gain a 3-point Ward for 1 round.',
        },
        limitationRuleId: 'measured-strikes',
        limitation: {
          story:
            'Iron Echo bends every attack toward shelter, making even its sharpest blows heavier and less direct.',
          mechanic: 'Direct attacks deal 1 less damage.',
        },
        techniques: [
          {
            id: 'aegis-break',
            name: 'Aegis Break',
            visibleAction:
              "The bearer catches the enemy's force on a crescent shield, twists, and shatters its balance with a tolling impact.",
            tacticalPurpose:
              "Use it to open a defended target so the squad's next attacks can reach something vital.",
            mechanicRule:
              'Spend 2 Resource to make an attack with 3 bonus power and apply Exposed for 2 rounds.',
            resourceCost: 2,
            cooldownRounds: 2,
            condition: 'Requires an active target and at least 2 Resource.',
          },
          {
            id: 'hold-the-line',
            name: 'Hold the Line',
            visibleAction:
              'The bearer stamps an iron note into the ground, raising a curved wall between the front hero and the hunting line behind them.',
            tacticalPurpose:
              'Use it when the squad has committed to Protect Rear and the front hero needs to absorb the next exchange.',
            mechanicRule: 'Spend 1 Resource to grant the front hero a 3-point Ward for 2 rounds.',
            resourceCost: 1,
            cooldownRounds: 2,
            condition: 'Requires Protect Rear priority and at least 1 Resource.',
          },
        ],
        coverageTags: ['defence', 'control'],
      },
    },
    {
      id: 'anchor-saint',
      role: 'vanguard',
      ageBand: 'veteran',
      origin:
        'a memorial ferry that carried breach victims whose names were never officially recorded',
      formativeEvent:
        'During a river breach, the future hero tied the ferry to a collapsing bridge and became the human anchor for forty passengers.',
      drive: 'Give the unrecorded dead enough weight that the city must answer for them.',
      fear: 'That every rescued life will be used to excuse the lives institutions chose not to count.',
      contradiction:
        'Speaks gently about the dead but becomes immovable when the living ask for compromise.',
      temperament: 'Patient, grave, and unexpectedly warm around anyone who feels forgotten.',
      interiorVoice:
        'Remembers people by the weight of their hands and measures every decision against the names no ledger kept.',
      personalHooks: [
        'One spectral anchor bears the name of a passenger who is still alive.',
        'The ferry captain receives a docking fee from a pier demolished years ago.',
      ],
      awakeningCondition: 'keep the formation intact through three consecutive enemy techniques',
      portrait: {
        requiredSlots: ['lead', 'leadOrigin', 'calling', 'awakening'],
        sentences: [
          '{lead} comes from {leadOrigin}, carrying a memory for every passenger the official count forgot.',
          'The night the bridge failed, {lead} tied the ferry in place and refused to release the rope until forty strangers reached shore.',
          'Their desperate grip became {calling}, a constellation of spectral anchors that makes protection feel as solid as grief.',
          'Its deeper power waits for {lead} to {awakening}, proving that no one in this formation can be quietly cut loose.',
        ],
      },
      calling: {
        id: 'anchor-saint',
        name: 'Anchor Saint',
        manifestation:
          'Pale anchor-lines descend through floor and sky, each one humming with a remembered name.',
        stats: { vitality: 11, power: 8, guard: 13, speed: 5, focus: 8 },
        signatureRuleId: 'rear-intercept',
        signature: {
          story:
            'A spectral line catches the first attack bound for the rear and reels the bearer into its path.',
          mechanic:
            'Once each round, intercept the first enemy attack that targets a different hero in the rear position.',
        },
        reactionRuleId: 'intercept-brace',
        reaction: {
          story: 'The anchor keeps part of the intercepted force, wrapping it around the bearer.',
          mechanic: 'After an interception, gain a 3-point Ward for 1 round.',
        },
        limitationRuleId: 'measured-strikes',
        limitation: {
          story:
            'Every blow drags against an unseen web of lives the bearer has sworn not to endanger.',
          mechanic: 'Direct attacks deal 1 less damage.',
        },
        techniques: [
          {
            id: 'aegis-break',
            name: 'Anchor Fracture',
            visibleAction:
              'A spectral anchor drops behind the target and jerks backward, cracking its stance open from the inside.',
            tacticalPurpose:
              'Use it to strip certainty from a durable target before the squad commits its damage.',
            mechanicRule:
              'Spend 2 Resource to make an attack with 3 bonus power and apply Exposed for 2 rounds.',
            resourceCost: 2,
            cooldownRounds: 2,
            condition: 'Requires an active target and at least 2 Resource.',
          },
          {
            id: 'hold-the-line',
            name: 'Fixed Horizon',
            visibleAction:
              'The bearer sets both hands on an invisible line and pulls until the front of the formation locks against it.',
            tacticalPurpose:
              'Use it under Protect Rear to give the foremost hero a safe point that will not move.',
            mechanicRule: 'Spend 1 Resource to grant the front hero a 3-point Ward for 2 rounds.',
            resourceCost: 1,
            cooldownRounds: 2,
            condition: 'Requires Protect Rear priority and at least 1 Resource.',
          },
        ],
        coverageTags: ['defence', 'control'],
      },
    },
    {
      id: 'storm-bastion',
      role: 'vanguard',
      ageBand: 'young-adult',
      origin:
        'an outer-ward courier route that stayed open after the city cancelled its protection',
      formativeEvent:
        'The future hero ran medicine through a breach storm and learned that lightning would follow any path drawn with enough conviction.',
      drive: 'Make distance stop being the reason someone is left undefended.',
      fear: 'That one day there will be two people in danger and only enough speed to reach one.',
      contradiction:
        'Lives in constant motion but clings stubbornly to every promise made along the route.',
      temperament: 'Restless, candid, quick to laugh, and incapable of ignoring a call for help.',
      interiorVoice:
        'Thinks in routes and split seconds; tenderness appears as practical questions asked at impossible speed.',
      personalHooks: [
        'An unopened medicine case still sparks whenever the old route is mentioned.',
        'A child from the final delivery now wears the uniform of the office that cancelled it.',
      ],
      awakeningCondition: 'intercept an attack for every other squad member in one operation',
      portrait: {
        requiredSlots: ['lead', 'leadOrigin', 'calling', 'awakening'],
        sentences: [
          '{lead} comes from {leadOrigin}, a road remembered by the people who survived it and denied by everyone who gave up on them.',
          'Carrying medicine through a breach storm taught {lead} that lightning can be persuaded to protect instead of burn.',
          'That lesson became {calling}, a moving fortress that arrives as thunder a heartbeat before harm.',
          'To master it, {lead} must {awakening}, turning impossible distance into a promise kept three times.',
        ],
      },
      calling: {
        id: 'storm-bastion',
        name: 'Storm Bastion',
        manifestation:
          "Blue-white current races across the bearer's skin and leaves shield-shaped afterimages at every sudden stop.",
        stats: { vitality: 10, power: 9, guard: 11, speed: 8, focus: 7 },
        signatureRuleId: 'rear-intercept',
        signature: {
          story:
            'The first attack aimed behind the line draws a lightning road, and the bearer crosses it before the blow lands.',
          mechanic:
            'Once each round, intercept the first enemy attack that targets a different hero in the rear position.',
        },
        reactionRuleId: 'intercept-brace',
        reaction: {
          story: 'The arrival flash clings to the bearer as a shield of charged air.',
          mechanic: 'After an interception, gain a 3-point Ward for 1 round.',
        },
        limitationRuleId: 'measured-strikes',
        limitation: {
          story:
            'Charge spent on destruction alone scatters before the impact, as if the storm refuses to forget its purpose.',
          mechanic: 'Direct attacks deal 1 less damage.',
        },
        techniques: [
          {
            id: 'aegis-break',
            name: 'Thunder Brace',
            visibleAction:
              'The bearer catches the target between two shield-shaped flashes and snaps the charged air shut.',
            tacticalPurpose:
              "Use it to break a target's footing and prepare a clean route for the squad's attack.",
            mechanicRule:
              'Spend 2 Resource to make an attack with 3 bonus power and apply Exposed for 2 rounds.',
            resourceCost: 2,
            cooldownRounds: 2,
            condition: 'Requires an active target and at least 2 Resource.',
          },
          {
            id: 'hold-the-line',
            name: 'Stormwall',
            visibleAction:
              'The bearer runs a tight circle around the front hero until the trail closes into a wall of revolving lightning.',
            tacticalPurpose:
              'Use it under Protect Rear to harden the front while the rest of the formation works safely behind it.',
            mechanicRule: 'Spend 1 Resource to grant the front hero a 3-point Ward for 2 rounds.',
            resourceCost: 1,
            cooldownRounds: 2,
            condition: 'Requires Protect Rear priority and at least 1 Resource.',
          },
        ],
        coverageTags: ['defence', 'control'],
      },
    },
    {
      id: 'quiet-lattice',
      role: 'support',
      ageBand: 'adult',
      origin:
        'an academy field laboratory that catalogued failed Callings and quietly erased their bearers',
      formativeEvent:
        'The future hero stabilised a frightened living relic during a campus breach, then hid the bond when the academy ordered the relic destroyed.',
      drive: 'Make forbidden powers understandable before fear turns them into property or ash.',
      fear: 'That the hidden relic trusted the wrong person and will suffer for that trust.',
      contradiction:
        'Demands complete evidence from everyone else while concealing the discovery that defines the work.',
      temperament:
        'Observant, dryly compassionate, and gentler with frightened monsters than confident officials.',
      interiorVoice:
        'Notices patterns before faces, then remembers the small human detail everyone else forgot to record.',
      personalHooks: [
        'The hidden relic has begun drawing a map of a room sealed beneath the academy.',
        "An expulsion notice contains a second signature written in the hero's own hand.",
      ],
      awakeningCondition: 'ward an ally against a hit that would otherwise defeat them',
      portrait: {
        requiredSlots: ['lead', 'leadOrigin', 'calling', 'awakening'],
        sentences: [
          '{lead} comes from {leadOrigin}, carrying the dangerous belief that a failed power may simply be a frightened one.',
          'During a campus breach, {lead} saved a living relic by hiding the bond that the academy wanted burned from its records.',
          'That secret became {calling}, a geometry of light that joins broken bodies to the strength they have not lost.',
          'Its deepest pattern will appear only when {lead} can {awakening}, making understanding arrive at the final possible moment.',
        ],
      },
      calling: {
        id: 'quiet-lattice',
        name: 'Quiet Lattice',
        manifestation:
          "Fine violet lines unfold from the bearer's fingertips, joining wounds, allies, and hostile motion into one trembling diagram.",
        stats: { vitality: 9, power: 7, guard: 8, speed: 9, focus: 13 },
        signatureRuleId: 'mending-ward',
        signature: {
          story:
            'Every restored line remains visible for a moment, weaving recovered strength into a shield.',
          mechanic: 'Every recovery technique also grants the target a 3-point Ward.',
        },
        reactionRuleId: 'recovery-loop',
        reaction: {
          story:
            "When the repair closes cleanly, one bright strand curls back into the bearer's hand for later use.",
          mechanic: 'After completing a recovery technique, refund 1 Resource.',
        },
        limitationRuleId: 'low-direct-output',
        limitation: {
          story:
            'The lattice resists lines drawn only to wound, blunting every direct attack passed through it.',
          mechanic: 'Direct attacks deal 2 less damage.',
        },
        techniques: [
          {
            id: 'restorative-sigil',
            name: 'Restorative Sigil',
            visibleAction:
              'The bearer closes a violet pattern around the most wounded ally, pulling torn light back into the shape of a whole body.',
            tacticalPurpose:
              "Use it when an ally falls below the stance's recovery threshold and needs both healing and protection.",
            mechanicRule:
              "Spend 2 Resource to heal the ally for an amount equal to the bearer's Focus plus 5 HP, grant Inspired for 2 rounds, and grant a Ward for 2 rounds.",
            resourceCost: 2,
            cooldownRounds: 2,
            condition:
              'Requires an ally below 90% HP in Supportive stance or below 70% HP otherwise, plus at least 2 Resource.',
          },
          {
            id: 'binding-shot',
            name: 'Binding Shot',
            visibleAction:
              'The bearer pinches two hostile lines together and fires the knot into the target, tangling its next movement.',
            tacticalPurpose:
              'Use it from Tactical stance to slow a dangerous enemy while still contributing damage.',
            mechanicRule:
              'Spend 2 Resource to make an attack with 2 bonus power and apply Staggered for 2 rounds.',
            resourceCost: 2,
            cooldownRounds: 2,
            condition: 'Requires Tactical stance and at least 2 Resource.',
          },
        ],
        coverageTags: ['sustain', 'control'],
      },
    },
    {
      id: 'mercy-engine',
      role: 'support',
      ageBand: 'veteran',
      origin:
        'a family clinic that kept unsponsored Calling-bearers alive with machines built from discarded relic parts',
      formativeEvent:
        'When a corporate seizure team arrived, the future hero connected every patient to one unfinished machine and kept all of their hearts beating.',
      drive: 'Build care that cannot be priced, licensed, or switched off by an owner.',
      fear: 'That the machine saved its patients by taking something from them nobody has learned to measure.',
      contradiction:
        'Offers mercy without hesitation but treats personal exhaustion as a debt to be hidden.',
      temperament:
        'Practical, patient, warm without sentimentality, and terrifying when care is treated as leverage.',
      interiorVoice:
        'Hears bodies as imperfect engines and institutions as machines whose cruelest parts were still designed by people.',
      personalHooks: [
        "One former patient now dreams in the machine's mechanical rhythm.",
        'A sealed purchase order lists the clinic itself as a prototype component.',
      ],
      awakeningCondition: 'restore every squad member during the same round',
      portrait: {
        requiredSlots: ['lead', 'leadOrigin', 'calling', 'awakening'],
        sentences: [
          '{lead} comes from {leadOrigin}, where keeping someone alive mattered more than whether the method was approved.',
          'The night the clinic was seized, {lead} joined every failing heartbeat to one unfinished device and dared it to choose mercy.',
          "The answer became {calling}, a warm brass engine that turns one person's recovery into strength shared by the whole line.",
          'Its hidden chamber will open when {lead} can {awakening}, proving that care can become abundance instead of sacrifice.',
        ],
      },
      calling: {
        id: 'mercy-engine',
        name: 'Mercy Engine',
        manifestation:
          "A palm-sized brass engine turns behind the bearer's heart, sending amber pulse-lines toward injured allies.",
        stats: { vitality: 10, power: 6, guard: 9, speed: 8, focus: 14 },
        signatureRuleId: 'mending-ward',
        signature: {
          story:
            'Recovery the body cannot hold is caught by the engine and returned as a warm shell of force.',
          mechanic: 'Every recovery technique also grants the target a 3-point Ward.',
        },
        reactionRuleId: 'recovery-loop',
        reaction: {
          story: 'A completed cycle spins the engine forward, returning part of its spent charge.',
          mechanic: 'After completing a recovery technique, refund 1 Resource.',
        },
        limitationRuleId: 'low-direct-output',
        limitation: {
          story:
            'The engine diverts power from anything that resembles harm toward its next act of care.',
          mechanic: 'Direct attacks deal 2 less damage.',
        },
        techniques: [
          {
            id: 'restorative-sigil',
            name: 'Mercy Cycle',
            visibleAction:
              'The engine opens like a brass flower and sends an amber heartbeat through the most wounded ally.',
            tacticalPurpose:
              'Use it when an ally crosses the recovery threshold and needs enough protection to remain in the fight.',
            mechanicRule:
              "Spend 2 Resource to heal the ally for an amount equal to the bearer's Focus plus 5 HP, grant Inspired for 2 rounds, and grant a Ward for 2 rounds.",
            resourceCost: 2,
            cooldownRounds: 2,
            condition:
              'Requires an ally below 90% HP in Supportive stance or below 70% HP otherwise, plus at least 2 Resource.',
          },
          {
            id: 'binding-shot',
            name: 'Arresting Pulse',
            visibleAction:
              "The bearer reverses one engine stroke and hurls the stolen beat into the target's limbs.",
            tacticalPurpose:
              'Use it from Tactical stance to interrupt hostile momentum with a controlled pulse.',
            mechanicRule:
              'Spend 2 Resource to make an attack with 2 bonus power and apply Staggered for 2 rounds.',
            resourceCost: 2,
            cooldownRounds: 2,
            condition: 'Requires Tactical stance and at least 2 Resource.',
          },
        ],
        coverageTags: ['sustain', 'control'],
      },
    },
    {
      id: 'spirit-switchboard',
      role: 'support',
      ageBand: 'adult',
      origin:
        'a rural licence exchange where unusual Callings were classified as hauntings and quietly refused service',
      formativeEvent:
        "The future hero answered a dead operator's ringing switchboard during a breach and routed every trapped voice toward rescue.",
      drive: 'Give impossible voices a line into the world before someone labels them noise.',
      fear: 'That one beloved voice on the switchboard is not a spirit at all, but bait from beyond the breach.',
      contradiction:
        'Believes every voice deserves an answer, yet keeps one channel secret from the squad.',
      temperament:
        'Curious, softly irreverent, sociable with ghosts, and cautious with the living.',
      interiorVoice:
        'Experiences silence as a crowded room and judges trust by which questions a person is willing to hear.',
      personalHooks: [
        "A caller using the hero's childhood nickname predicts closures one day before they open.",
        "The dead operator's personnel file shows no face in any surviving photograph.",
      ],
      awakeningCondition: 'keep a spirit link active while every ally is Strained',
      portrait: {
        requiredSlots: ['lead', 'leadOrigin', 'calling', 'awakening'],
        sentences: [
          '{lead} comes from {leadOrigin}, where unanswered power was easier to call a haunting than a responsibility.',
          'During a breach, {lead} lifted the receiver of a dead switchboard operator and guided a station full of trapped voices home.',
          'The ringing never stopped; it became {calling}, a web of luminous cords connecting the wounded to spirits willing to help.',
          'To hear its truest voice, {lead} must {awakening}, holding every desperate line without losing the self between them.',
        ],
      },
      calling: {
        id: 'spirit-switchboard',
        name: 'Spirit Switchboard',
        manifestation:
          'Ivory receiver cords curl through the air, each carrying a different voice and a small light like a distant room.',
        stats: { vitality: 8, power: 8, guard: 7, speed: 10, focus: 13 },
        signatureRuleId: 'mending-ward',
        signature: {
          story:
            'A helpful spirit lingers after carrying recovery through the line and stands watch around the healed ally.',
          mechanic: 'Every recovery technique also grants the target a 3-point Ward.',
        },
        reactionRuleId: 'recovery-loop',
        reaction: {
          story:
            'When a spirit completes its errand, it returns a bright coin of energy through the receiver.',
          mechanic: 'After completing a recovery technique, refund 1 Resource.',
        },
        limitationRuleId: 'low-direct-output',
        limitation: {
          story:
            'The spirits muffle commands meant only to hurt, making every direct attack pass through reluctant hands.',
          mechanic: 'Direct attacks deal 2 less damage.',
        },
        techniques: [
          {
            id: 'restorative-sigil',
            name: 'Kindred Circuit',
            visibleAction:
              'The bearer connects the most wounded ally to a warm chorus of spirits who remember how that body should feel.',
            tacticalPurpose:
              'Use it below the recovery threshold to restore an ally and leave a spirit guarding the line.',
            mechanicRule:
              "Spend 2 Resource to heal the ally for an amount equal to the bearer's Focus plus 5 HP, grant Inspired for 2 rounds, and grant a Ward for 2 rounds.",
            resourceCost: 2,
            cooldownRounds: 2,
            condition:
              'Requires an ally below 90% HP in Supportive stance or below 70% HP otherwise, plus at least 2 Resource.',
          },
          {
            id: 'binding-shot',
            name: 'Signal Snare',
            visibleAction:
              "Three spirit cords loop around the target's shadow and yank its movement out of rhythm.",
            tacticalPurpose:
              'Use it from Tactical stance to slow an enemy while keeping the support line at distance.',
            mechanicRule:
              'Spend 2 Resource to make an attack with 2 bonus power and apply Staggered for 2 rounds.',
            resourceCost: 2,
            cooldownRounds: 2,
            condition: 'Requires Tactical stance and at least 2 Resource.',
          },
        ],
        coverageTags: ['sustain', 'control'],
      },
    },
    {
      id: 'vector-edge',
      role: 'striker',
      ageBand: 'young-adult',
      origin: 'an unsponsored assessment circuit staged in warehouses beneath the public arenas',
      formativeEvent:
        'The future hero won a licensed trial with a movement no examiner could name, then watched the score vanish before reaching the board.',
      drive: 'Force the ranking system to recognise a style it did not create.',
      fear: 'That recognition will arrive only after someone richer learns how to claim the technique.',
      contradiction:
        'Craves an honest teacher but treats every offered lesson as an attempt to take ownership.',
      temperament: 'Direct, competitive, sharply funny, and most generous when nobody is watching.',
      interiorVoice:
        'Reads rooms as angles and people as possible commitments; hope sounds suspiciously like a challenge.',
      personalHooks: [
        'The missing score resurfaces under the licence number of a celebrated rival.',
        'An examiner who denied seeing the technique sends a diagram only its creator could understand.',
      ],
      awakeningCondition: 'finish an Exposed threat while below half Vitality',
      portrait: {
        requiredSlots: ['lead', 'leadOrigin', 'calling', 'awakening'],
        sentences: [
          '{lead} comes from {leadOrigin}, where talent was welcome only if a sponsor could put a name on it.',
          'Winning with an impossible step should have opened every door; instead, the score disappeared and another fighter received the applause.',
          'The stolen geometry lives on as {calling}, bright lines that reveal the shortest path through any defence.',
          'Its full edge waits for {lead} to {awakening}, when victory and vulnerability become the same narrow opening.',
        ],
      },
      calling: {
        id: 'vector-edge',
        name: 'Vector Edge',
        manifestation:
          "Fine gold lines sketch possible cuts through the air, converging wherever an enemy's guard is about to fail.",
        stats: { vitality: 8, power: 13, guard: 6, speed: 12, focus: 9 },
        signatureRuleId: 'exploit-exposed',
        signature: {
          story:
            'An Exposed target fills with converging lines, and the bearer follows the one that ends the fight fastest.',
          mechanic: 'Direct attacks deal 3 additional damage to Exposed targets.',
        },
        reactionRuleId: 'finisher-surge',
        reaction: {
          story:
            'The moment the bearer commits to a finishing line, every unused possibility pours into that one attack.',
          mechanic: 'Before a conditional finisher resolves, gain Inspired for 2 rounds.',
        },
        limitationRuleId: 'open-guard',
        limitation: {
          story: 'Following the fastest line means leaving no line at all for retreat.',
          mechanic: 'While in Aggressive stance, effective Guard is reduced by 3.',
        },
        techniques: [
          {
            id: 'arc-finish',
            name: 'Arc Finish',
            visibleAction:
              "The bearer gathers every visible line into one white arc and cuts through the target's weakest point.",
            tacticalPurpose:
              'Use it from Aggressive stance or against a wounded target when the extra force can turn pressure into a defeat.',
            mechanicRule: 'Spend 2 Resource to make a high-damage attack with 8 bonus power.',
            resourceCost: 2,
            cooldownRounds: 2,
            condition:
              'Requires Aggressive stance or a target at 65% HP or lower, plus at least 2 Resource.',
          },
          {
            id: 'cross-step',
            name: 'Cross Step',
            visibleAction:
              "The bearer steps onto a gold line that should not hold weight and emerges through the target's blind side.",
            tacticalPurpose:
              'Use it from the rear or Tactical stance to turn careful positioning into a sudden attack.',
            mechanicRule: 'Spend 1 Resource to make an attack with 4 bonus power.',
            resourceCost: 1,
            cooldownRounds: 1,
            condition: 'Requires rear position or Tactical stance, plus at least 1 Resource.',
          },
        ],
        coverageTags: ['damage'],
      },
    },
    {
      id: 'red-interval',
      role: 'striker',
      ageBand: 'adult',
      origin:
        'a sponsor-owned training house where every heartbeat was measured and sold as performance data',
      formativeEvent:
        'The future hero broke the house record, discovered it had been built from injured trainees, and carried the evidence out during the award ceremony.',
      drive:
        'Prove that excellence can belong to the person who earns it rather than the system that measured it.',
      fear: 'That without the cruel training house, there may be nothing exceptional underneath the numbers.',
      contradiction:
        'Hates being measured but secretly records every failure with merciless precision.',
      temperament: 'Controlled, exacting, formal under pressure, and disarmed by sincere praise.',
      interiorVoice:
        'Hears time in counted beats and mistrusts any happiness that cannot survive inspection.',
      personalHooks: [
        'A former trainee asks for the evidence back before the next rank hearing.',
        "The training house publishes a perfect copy of the hero's heartbeat signature.",
      ],
      awakeningCondition: 'use two finishers before receiving any recovery',
      portrait: {
        requiredSlots: ['lead', 'leadOrigin', 'calling', 'awakening'],
        sentences: [
          '{lead} comes from {leadOrigin}, where even rest had a score and pain became proof of commitment.',
          'A record-breaking run revealed the cost hidden inside those numbers, and {lead} chose the evidence over the victory ceremony.',
          'The stolen timing became {calling}, a red gap between heartbeats where one perfect action can outrun consequence.',
          'Mastery demands that {lead} {awakening}, trusting precision to survive after the body begins asking for mercy.',
        ],
      },
      calling: {
        id: 'red-interval',
        name: 'Red Interval',
        manifestation:
          'The world loses colour between heartbeats, except for a red path marking what can be changed before time catches up.',
        stats: { vitality: 9, power: 12, guard: 7, speed: 11, focus: 10 },
        signatureRuleId: 'exploit-exposed',
        signature: {
          story:
            'An Exposed defence lingers for one stolen heartbeat longer, and the bearer uses every fraction of it.',
          mechanic: 'Direct attacks deal 3 additional damage to Exposed targets.',
        },
        reactionRuleId: 'finisher-surge',
        reaction: {
          story: 'Committing to the last beat floods the bearer with fierce, clarifying momentum.',
          mechanic: 'Before a conditional finisher resolves, gain Inspired for 2 rounds.',
        },
        limitationRuleId: 'open-guard',
        limitation: {
          story:
            'Nothing can defend the instant the bearer has already spent on reaching the enemy.',
          mechanic: 'While in Aggressive stance, effective Guard is reduced by 3.',
        },
        techniques: [
          {
            id: 'arc-finish',
            name: 'Interval End',
            visibleAction:
              'The bearer steps between two heartbeats and returns with a red cut already closing across the target.',
            tacticalPurpose:
              'Use it when aggression or a weakened target makes one decisive interval worth the danger.',
            mechanicRule: 'Spend 2 Resource to make a high-damage attack with 8 bonus power.',
            resourceCost: 2,
            cooldownRounds: 2,
            condition:
              'Requires Aggressive stance or a target at 65% HP or lower, plus at least 2 Resource.',
          },
          {
            id: 'cross-step',
            name: 'Red Transit',
            visibleAction:
              "A red doorway flickers beside the bearer, delivering them from the safe line to the enemy's unfinished movement.",
            tacticalPurpose:
              'Use it from the rear or Tactical stance to punish a target before it can complete its action.',
            mechanicRule: 'Spend 1 Resource to make an attack with 4 bonus power.',
            resourceCost: 1,
            cooldownRounds: 1,
            condition: 'Requires rear position or Tactical stance, plus at least 1 Resource.',
          },
        ],
        coverageTags: ['damage'],
      },
    },
    {
      id: 'comet-thread',
      role: 'striker',
      ageBand: 'young-adult',
      origin:
        'a rooftop duelling club where two friends invented techniques beneath passing breach-comets',
      formativeEvent:
        "The future hero arrived at their first public trial to find the shared style entered under the partner's name alone.",
      drive: 'Create one victory nobody else can sign, inherit, or explain away.',
      fear: 'That reclaiming the style will destroy the friendship that made it possible.',
      contradiction:
        'Treats every rival as an enemy except the one rival who caused the deepest wound.',
      temperament: 'Bright, impatient, theatrical in battle, and painfully earnest in private.',
      interiorVoice:
        'Turns hurt into dares and imagines every difficult conversation as a duel that might still end in laughter.',
      personalHooks: [
        'The former partner has stopped using the stolen technique and refuses to explain why.',
        'A comet diagram hides a final movement neither inventor remembers drawing.',
      ],
      awakeningCondition: 'defeat a marked rival with exactly enough damage to finish the fight',
      portrait: {
        requiredSlots: ['lead', 'leadOrigin', 'calling', 'awakening'],
        sentences: [
          '{lead} comes from {leadOrigin}, where friendship and competition once felt like the same beautiful thing.',
          "The style they made together reached the public board under one name, and it was not {lead}'s.",
          'What remained answered as {calling}, a silver thread that turns every moving target into a falling star.',
          'Its final secret asks {lead} to {awakening}, ending a rivalry with perfect force instead of anger.',
        ],
      },
      calling: {
        id: 'comet-thread',
        name: 'Comet Thread',
        manifestation:
          "A silver filament runs from the bearer's hand to every moving threat, brightening as danger and distance grow.",
        stats: { vitality: 7, power: 14, guard: 5, speed: 13, focus: 9 },
        signatureRuleId: 'exploit-exposed',
        signature: {
          story:
            "Cracks in an Exposed defence catch the silver thread and pull the bearer's strike deeper.",
          mechanic: 'Direct attacks deal 3 additional damage to Exposed targets.',
        },
        reactionRuleId: 'finisher-surge',
        reaction: {
          story:
            'A committed finishing line burns like a comet tail, inspiring the bearer before impact.',
          mechanic: 'Before a conditional finisher resolves, gain Inspired for 2 rounds.',
        },
        limitationRuleId: 'open-guard',
        limitation: {
          story:
            'The thread pulls forward with no kindness for the body left undefended behind it.',
          mechanic: 'While in Aggressive stance, effective Guard is reduced by 3.',
        },
        techniques: [
          {
            id: 'arc-finish',
            name: 'Comet Fall',
            visibleAction:
              'The bearer vaults along a silver thread and falls through the target in a burst of cold starlight.',
            tacticalPurpose:
              'Use it aggressively or against a wounded enemy when the fall can become a true finish.',
            mechanicRule: 'Spend 2 Resource to make a high-damage attack with 8 bonus power.',
            resourceCost: 2,
            cooldownRounds: 2,
            condition:
              'Requires Aggressive stance or a target at 65% HP or lower, plus at least 2 Resource.',
          },
          {
            id: 'cross-step',
            name: 'Trailing Step',
            visibleAction:
              "The bearer hooks a thread around the target's movement and swings through the space it forgot to guard.",
            tacticalPurpose:
              'Use it from the rear or Tactical stance to convert safe distance into an unexpected angle.',
            mechanicRule: 'Spend 1 Resource to make an attack with 4 bonus power.',
            resourceCost: 1,
            cooldownRounds: 1,
            condition: 'Requires rear position or Tactical stance, plus at least 1 Resource.',
          },
        ],
        coverageTags: ['damage'],
      },
    },
  ],
} satisfies StoryAuthoringSource;
