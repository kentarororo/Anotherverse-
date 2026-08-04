import type { ScenarioCategory } from '../../engine/model/scenario';
import { VALIDATED_STORY_AUTHORING } from '../authoring/validated-story';
import type { ValidatedBeat } from '../realiser/story-authoring';

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
  initialFactRoles?: readonly [SceneFactRole, SceneFactRole] | undefined;
  continuationFactRoles: readonly [SceneFactRole, SceneFactRole];
  choiceSetId: string;
  sceneKind: string;
  initial?: ValidatedBeat | undefined;
  continuation?: ValidatedBeat;
}

export interface ScenarioChoiceModule {
  id: string;
  label: string;
  consequence: string;
}

const authoredModules = VALIDATED_STORY_AUTHORING.sceneModules;

/** Story metadata is derived from the single user-editable source in content/story/authoring.ts. */
export const SCENARIO_MODULES: Readonly<Record<ScenarioCategory, readonly ScenarioModule[]>> = {
  operation: authoredModules.filter((module) => module.category === 'operation'),
  personal: authoredModules.filter((module) => module.category === 'personal'),
  discovery: authoredModules.filter((module) => module.category === 'discovery'),
  rival: authoredModules.filter((module) => module.category === 'rival'),
  social: authoredModules.filter((module) => module.category === 'social'),
};

export const SCENARIO_CHOICE_MODULES: Readonly<Record<string, readonly ScenarioChoiceModule[]>> = {
  'operation-1': [
    {
      id: 'close-glassline',
      label: 'Take action at the breach return',
      consequence: 'The locked formation engages both threats and reopens the escape route.',
    },
  ],
  'operation-2': [
    {
      id: 'secure-east-junction',
      label: 'Take action in the blackout',
      consequence:
        'The locked plan contests both threat lanes and the compromised signal together.',
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
