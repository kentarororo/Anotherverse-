import type { ScenarioCategory } from '../../engine/model/scenario';

export type SceneFactRole =
  | 'city'
  | 'faction'
  | 'origin'
  | 'prior-operation'
  | 'prior-personal'
  | 'prior-discovery'
  | 'prior-rival'
  | 'prior-social'
  | 'prior-decision';

export interface ScenarioModule {
  id: string;
  category: ScenarioCategory;
  title: string;
  initialFactRoles?: readonly [SceneFactRole, SceneFactRole];
  continuationFactRoles: readonly [SceneFactRole, SceneFactRole];
  choiceSetId: string;
  sceneKind:
    | 'breach-return'
    | 'junction-pressure'
    | 'split-route'
    | 'observed-closure'
    | 'sealed-record'
    | 'old-promise'
    | 'missing-witness'
    | 'calling-response'
    | 'buried-signal'
    | 'living-relic'
    | 'residual-trace'
    | 'hidden-archive'
    | 'illegal-technique-claim'
    | 'edited-record'
    | 'public-challenge'
    | 'closure-credit'
    | 'district-testimony'
    | 'licence-hearing'
    | 'called-favour'
    | 'report-ownership';
}

export interface ScenarioChoiceModule {
  id: string;
  label: string;
  consequence: string;
}

export const SCENARIO_MODULES: Readonly<Record<ScenarioCategory, readonly ScenarioModule[]>> = {
  operation: [
    {
      id: 'operation-1',
      category: 'operation',
      title: 'Glassline Breach',
      sceneKind: 'breach-return',
      initialFactRoles: ['faction', 'city'],
      continuationFactRoles: ['prior-operation', 'city'],
      choiceSetId: 'operation-1',
    },
    {
      id: 'operation-2',
      category: 'operation',
      title: 'Pressure at East Junction',
      sceneKind: 'junction-pressure',
      initialFactRoles: ['city', 'faction'],
      continuationFactRoles: ['prior-social', 'city'],
      choiceSetId: 'operation-2',
    },
    {
      id: 'operation-3',
      category: 'operation',
      title: 'The Split Concourse',
      sceneKind: 'split-route',
      initialFactRoles: ['city', 'faction'],
      continuationFactRoles: ['prior-operation', 'prior-decision'],
      choiceSetId: 'operation-3',
    },
    {
      id: 'operation-4',
      category: 'operation',
      title: 'Closure Under Watch',
      sceneKind: 'observed-closure',
      initialFactRoles: ['faction', 'city'],
      continuationFactRoles: ['prior-social', 'faction'],
      choiceSetId: 'operation-4',
    },
  ],
  personal: [
    {
      id: 'personal-1',
      category: 'personal',
      title: 'A Record Left Sealed',
      sceneKind: 'sealed-record',
      continuationFactRoles: ['origin', 'prior-operation'],
      choiceSetId: 'personal-1',
    },
    {
      id: 'personal-2',
      category: 'personal',
      title: 'Terms of the Old Promise',
      sceneKind: 'old-promise',
      continuationFactRoles: ['origin', 'prior-decision'],
      choiceSetId: 'personal-2',
    },
    {
      id: 'personal-3',
      category: 'personal',
      title: 'The Missing Name',
      sceneKind: 'missing-witness',
      continuationFactRoles: ['origin', 'prior-operation'],
      choiceSetId: 'personal-3',
    },
    {
      id: 'personal-4',
      category: 'personal',
      title: 'Condition of Awakening',
      sceneKind: 'calling-response',
      continuationFactRoles: ['origin', 'prior-operation'],
      choiceSetId: 'personal-4',
    },
  ],
  discovery: [
    {
      id: 'discovery-1',
      category: 'discovery',
      title: 'Signal Beneath the Platform',
      sceneKind: 'buried-signal',
      continuationFactRoles: ['origin', 'prior-personal'],
      choiceSetId: 'discovery-1',
    },
    {
      id: 'discovery-2',
      category: 'discovery',
      title: 'An Unlicensed Relic',
      sceneKind: 'living-relic',
      continuationFactRoles: ['origin', 'prior-personal'],
      choiceSetId: 'discovery-2',
    },
    {
      id: 'discovery-3',
      category: 'discovery',
      title: 'The Second Pressure Trace',
      sceneKind: 'residual-trace',
      continuationFactRoles: ['prior-operation', 'origin'],
      choiceSetId: 'discovery-3',
    },
    {
      id: 'discovery-4',
      category: 'discovery',
      title: 'Archive Without a Door',
      sceneKind: 'hidden-archive',
      continuationFactRoles: ['origin', 'prior-personal'],
      choiceSetId: 'discovery-4',
    },
  ],
  rival: [
    {
      id: 'rival-1',
      category: 'rival',
      title: 'A Squad Files Objection',
      sceneKind: 'illegal-technique-claim',
      continuationFactRoles: ['prior-operation', 'prior-discovery'],
      choiceSetId: 'rival-1',
    },
    {
      id: 'rival-2',
      category: 'rival',
      title: 'Proof Before Rank',
      sceneKind: 'edited-record',
      continuationFactRoles: ['prior-operation', 'prior-personal'],
      choiceSetId: 'rival-2',
    },
    {
      id: 'rival-3',
      category: 'rival',
      title: 'The Public Challenge',
      sceneKind: 'public-challenge',
      continuationFactRoles: ['prior-operation', 'prior-discovery'],
      choiceSetId: 'rival-3',
    },
    {
      id: 'rival-4',
      category: 'rival',
      title: 'Credit for the Closure',
      sceneKind: 'closure-credit',
      continuationFactRoles: ['prior-operation', 'prior-decision'],
      choiceSetId: 'rival-4',
    },
  ],
  social: [
    {
      id: 'social-1',
      category: 'social',
      title: 'District Testimony',
      sceneKind: 'district-testimony',
      continuationFactRoles: ['prior-rival', 'prior-discovery'],
      choiceSetId: 'social-1',
    },
    {
      id: 'social-2',
      category: 'social',
      title: 'The Licence Hearing',
      sceneKind: 'licence-hearing',
      continuationFactRoles: ['prior-rival', 'faction'],
      choiceSetId: 'social-2',
    },
    {
      id: 'social-3',
      category: 'social',
      title: 'A Favour Called In',
      sceneKind: 'called-favour',
      continuationFactRoles: ['prior-social', 'prior-discovery'],
      choiceSetId: 'social-3',
    },
    {
      id: 'social-4',
      category: 'social',
      title: 'Who Owns the Report',
      sceneKind: 'report-ownership',
      continuationFactRoles: ['prior-operation', 'prior-rival'],
      choiceSetId: 'social-4',
    },
  ],
};

export const SCENARIO_CHOICE_MODULES: Readonly<Record<string, readonly ScenarioChoiceModule[]>> = {
  'operation-1': [
    {
      id: 'close-glassline',
      label: 'Take action at Glassline',
      consequence: 'The locked formation engages both threats and reopens the evacuation lane.',
    },
  ],
  'operation-2': [
    {
      id: 'secure-east-junction',
      label: 'Take action at East Junction',
      consequence: 'The locked plan contests the tram lanes and the compromised signal together.',
    },
  ],
  'operation-3': [
    {
      id: 'hold-both-routes',
      label: 'Take action on both routes',
      consequence: 'The formation attempts to hold the narrow route without losing the rear path.',
    },
  ],
  'operation-4': [
    {
      id: 'close-under-observation',
      label: 'Take action under observation',
      consequence: 'The squad resolves the breach while its formation and telemetry remain public.',
    },
  ],
  'personal-1': [
    {
      id: 'release-sealed-file',
      label: 'Release the sealed file',
      consequence:
        'The omitted witness gains public support, while the hero enters licence review.',
    },
    {
      id: 'limit-sealed-file',
      label: 'Limit access to the file',
      consequence: 'The witness stays protected, while the timestamp remains privately unresolved.',
    },
  ],
  'personal-2': [
    {
      id: 'honour-old-promise',
      label: 'Honour the old promise',
      consequence: 'Squad access is diverted toward the unlicensed witness named in the agreement.',
    },
    {
      id: 'refuse-old-promise',
      label: 'Refuse the old promise',
      consequence:
        'The squad preserves its current access, while the witness loses that protection.',
    },
  ],
  'personal-3': [
    {
      id: 'publish-witness-proof',
      label: 'Publish the witness proof',
      consequence:
        'The testimony can correct the hero’s record, but exposes the witness’s location.',
    },
    {
      id: 'protect-witness-location',
      label: 'Protect the witness',
      consequence:
        'The witness remains hidden, while the public record keeps its missing interval.',
    },
  ],
  'personal-4': [
    {
      id: 'study-calling-safely',
      label: 'Study the response safely',
      consequence: 'The squad records the Calling pattern without forcing the awakening condition.',
    },
    {
      id: 'push-calling-response',
      label: 'Push the Calling response',
      consequence:
        'The hero gains faster insight while increasing institutional scrutiny and risk.',
    },
  ],
  'discovery-1': [
    {
      id: 'follow-buried-signal',
      label: 'Follow the buried signal',
      consequence:
        'The squad crosses the licensed line to locate the transmitter and its operator.',
    },
    {
      id: 'mark-signal-route',
      label: 'Mark the signal route',
      consequence: 'The route remains observable for a later operation without crossing today.',
    },
  ],
  'discovery-2': [
    {
      id: 'secure-living-relic',
      label: 'Secure the living relic',
      consequence: 'The squad controls the evidence while accepting responsibility for its bond.',
    },
    {
      id: 'leave-relic-dormant',
      label: 'Leave the relic dormant',
      consequence: 'The bond stays quiet at the site, beyond immediate institutional control.',
    },
  ],
  'discovery-3': [
    {
      id: 'take-trace-sample',
      label: 'Take a pressure sample',
      consequence: 'The squad gains testable evidence while partially disturbing the hidden route.',
    },
    {
      id: 'preserve-hidden-route',
      label: 'Preserve the hidden route',
      consequence: 'The route remains intact, but the squad leaves without a physical sample.',
    },
  ],
  'discovery-4': [
    {
      id: 'open-hidden-entry',
      label: 'Open the hidden entry',
      consequence: 'The archive may explain the Calling link and notify whoever concealed it.',
    },
    {
      id: 'leave-archive-closed',
      label: 'Leave the archive closed',
      consequence: 'The squad avoids detection while postponing the answer in the missing entry.',
    },
  ],
  'rival-1': [
    {
      id: 'accept-monitored-demonstration',
      label: 'Accept the monitored demonstration',
      consequence:
        'The squad proves its technique under observation and risks validating the claim.',
    },
    {
      id: 'file-formal-challenge',
      label: 'File a formal evidence challenge',
      consequence: 'The licence review turns on telemetry instead of a staged demonstration.',
    },
  ],
  'rival-2': [
    {
      id: 'reproduce-disputed-technique',
      label: 'Reproduce the disputed technique',
      consequence:
        'A controlled demonstration can expose the edit, at the cost of public scrutiny.',
    },
    {
      id: 'demand-complete-telemetry',
      label: 'Demand the complete telemetry',
      consequence: 'The dispute moves from performance to the missing interval in the public feed.',
    },
  ],
  'rival-3': [
    {
      id: 'accept-public-challenge',
      label: 'Accept the public challenge',
      consequence: 'The squad risks the poor starting conditions for a chance to strengthen rank.',
    },
    {
      id: 'refuse-public-challenge',
      label: 'Refuse the staged challenge',
      consequence: 'The squad avoids a rigged test while leaving the rival version uncontested.',
    },
  ],
  'rival-4': [
    {
      id: 'take-credit-test',
      label: 'Take the public credit test',
      consequence: 'A public test can settle the reward while exposing the squad’s methods.',
    },
    {
      id: 'submit-closure-evidence',
      label: 'Submit the linked closure evidence',
      consequence: 'The guild judges the causal record instead of a public performance.',
    },
  ],
  'social-1': [
    {
      id: 'support-witness-testimony',
      label: 'Support the witness testimony',
      consequence: 'The district gains a public explanation while official access tightens.',
    },
    {
      id: 'support-office-inquiry',
      label: 'Support the closed inquiry',
      consequence: 'Licence access remains stable while witnesses lose the squad’s public support.',
    },
  ],
  'social-2': [
    {
      id: 'defend-independent-records',
      label: 'Defend independent records',
      consequence: 'Squads retain their telemetry while the active faction contests the licence.',
    },
    {
      id: 'accept-telemetry-control',
      label: 'Accept official telemetry control',
      consequence: 'The hearing closes cleanly while future squad evidence belongs to the office.',
    },
  ],
  'social-3': [
    {
      id: 'refuse-suppression',
      label: 'Refuse to suppress the detail',
      consequence: 'The report stays complete and the district official withdraws the favour.',
    },
    {
      id: 'withhold-sensitive-detail',
      label: 'Withhold the sensitive detail',
      consequence: 'The official relationship holds while later evidence challenges become weaker.',
    },
  ],
  'social-4': [
    {
      id: 'publish-district-record',
      label: 'Publish with district witnesses',
      consequence: 'The complete account becomes public outside institutional control.',
    },
    {
      id: 'file-official-record',
      label: 'File through the licence office',
      consequence:
        'The official account protects access while narrowing what witnesses can publish.',
    },
  ],
};
