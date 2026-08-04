import { describe, expect, it } from 'vitest';
import { STORY_AUTHORING } from '../content/story';
import {
  extractStoryTemplateSlots,
  StoryAuthoringSchema,
  validateStoryAuthoring,
} from '../engine/model/story-authoring';
import { EXECUTABLE_TECHNIQUES } from '../engine/model/executable-technique';
import { VALIDATED_STORY_AUTHORING } from '../narrative/authoring/validated-story';
import { SCENARIO_CHOICE_MODULES } from '../narrative/corpus/scenario-modules';
import { realiseTechniqueStory } from '../narrative/realiser/story-authoring';

describe('single-source story authoring', () => {
  it('validates the complete production source and all declared template slots', () => {
    expect(validateStoryAuthoring(STORY_AUTHORING)).toEqual(VALIDATED_STORY_AUTHORING);
    expect(VALIDATED_STORY_AUTHORING.worlds).toHaveLength(4);
    expect(VALIDATED_STORY_AUTHORING.characterKits).toHaveLength(9);
    expect(VALIDATED_STORY_AUTHORING.sceneModules).toHaveLength(20);

    const beats = [
      ...VALIDATED_STORY_AUTHORING.worlds.map((world) => world.premise),
      ...VALIDATED_STORY_AUTHORING.characterKits.map((kit) => kit.portrait),
      ...VALIDATED_STORY_AUTHORING.sceneModules.flatMap((scene) => [
        ...(scene.initial === undefined ? [] : [scene.initial]),
        scene.continuation,
      ]),
    ];
    for (const beat of beats) {
      expect(extractStoryTemplateSlots(beat.sentences)).toEqual([...beat.requiredSlots].sort());
      expect(beat.sentences).toHaveLength(4);
    }
    const worldIdentitySlots = new Set([
      'crisisSite',
      'hiddenRoute',
      'publicVenue',
      'publicSignal',
      'recordMedium',
      'privateRefuge',
    ]);
    for (const scene of VALIDATED_STORY_AUTHORING.sceneModules) {
      const sceneBeats = [
        ...(scene.initial === undefined ? [] : [scene.initial]),
        scene.continuation,
      ];
      sceneBeats.forEach((beat) =>
        expect(beat.requiredSlots.some((slot) => worldIdentitySlots.has(slot))).toBe(true),
      );
    }
    expect(JSON.stringify(VALIDATED_STORY_AUTHORING)).not.toMatch(
      /the prior event|two recorded facts|something happened|the situation unfolds|TBD|TODO|lorem ipsum/i,
    );
  });

  it('rejects undeclared slots, incompatible mechanics, and exact numeric rules in prose', () => {
    const badSlots = structuredClone(STORY_AUTHORING) as any;
    badSlots.worlds[0].premise.requiredSlots.push('lead');
    expect(StoryAuthoringSchema.safeParse(badSlots).success).toBe(false);

    const badTechnique = structuredClone(STORY_AUTHORING) as any;
    badTechnique.characterKits[0].calling.techniques[0].id = 'unknown-technique';
    expect(StoryAuthoringSchema.safeParse(badTechnique).success).toBe(false);

    const mechanicLeak = structuredClone(STORY_AUTHORING) as any;
    mechanicLeak.characterKits[0].calling.signature.story =
      'The shield becomes an exact rule and grants 3 Ward whenever the bearer intercepts.';
    expect(StoryAuthoringSchema.safeParse(mechanicLeak).success).toBe(false);

    const worldNeutralScene = structuredClone(STORY_AUTHORING) as any;
    const continuation = worldNeutralScene.sceneModules[0].continuation;
    const identitySlots = [
      'crisisSite',
      'hiddenRoute',
      'publicVenue',
      'publicSignal',
      'recordMedium',
      'privateRefuge',
    ];
    continuation.sentences = continuation.sentences.map((sentence: string) =>
      identitySlots.reduce(
        (result, slot) => result.replaceAll(`{${slot}}`, 'the district'),
        sentence,
      ),
    );
    continuation.requiredSlots = extractStoryTemplateSlots(continuation.sentences);
    expect(StoryAuthoringSchema.safeParse(worldNeutralScene).success).toBe(false);
  });

  it('realises all 18 Calling techniques with natural live personalization', () => {
    const descriptions = VALIDATED_STORY_AUTHORING.characterKits.flatMap((kit) =>
      kit.calling.techniques.map((technique) => ({
        kit,
        description: realiseTechniqueStory(technique, 'Test Hero', kit.calling.name),
      })),
    );
    expect(descriptions).toHaveLength(18);
    for (const { kit, description } of descriptions) {
      expect(description).toContain('Test Hero');
      expect(description).toContain(kit.calling.name);
      expect(description).not.toMatch(/turns that motion toward|\bUse it\b/i);
      expect(description.split(/(?<=[.!?])\s+/)).toHaveLength(2);
    }
  });

  it('matches every authored mechanic to the canonical executable contract', () => {
    for (const kit of VALIDATED_STORY_AUTHORING.characterKits) {
      for (const contract of EXECUTABLE_TECHNIQUES[kit.role]) {
        const technique = kit.calling.techniques.find((candidate) => candidate.id === contract.id);
        expect(technique).toEqual(
          expect.objectContaining({
            id: contract.id,
            mechanicRule: contract.mechanicRule,
            resourceCost: contract.resourceCost,
            cooldownRounds: contract.cooldownRounds,
            condition: contract.condition,
          }),
        );
      }
    }
  });

  it('keeps shared scene prose and recorded choices free of one-world transit residue', () => {
    const sceneProse = VALIDATED_STORY_AUTHORING.sceneModules.flatMap((scene) => [
      ...(scene.initial?.sentences ?? []),
      ...scene.continuation.sentences,
    ]);
    expect(sceneProse.join(' ')).not.toMatch(/\{publicSignal\}\s+(?:begins|warns)\b/i);

    const recordedChoiceText = Object.values(SCENARIO_CHOICE_MODULES)
      .flat()
      .flatMap((choice) => [choice.label, choice.consequence])
      .join(' ');
    expect(recordedChoiceText).not.toMatch(/Glassline|East Junction|\btram\b/i);
  });
});
