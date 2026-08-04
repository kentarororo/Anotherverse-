import { z } from 'zod';
import { PATH_CLASS_IDS } from './path-classes';

export const ContentPackReferenceSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  moduleIds: z.array(z.string().min(1)),
});

export const ContentManifestSchema = z.object({
  schemaVersion: z.literal(1),
  milestone: z.literal('M4'),
  packs: z.object({
    campaign: ContentPackReferenceSchema,
    characters: ContentPackReferenceSchema,
    scenarios: ContentPackReferenceSchema,
    enemies: ContentPackReferenceSchema,
    techniques: ContentPackReferenceSchema,
    equipment: ContentPackReferenceSchema,
    combatLanguage: ContentPackReferenceSchema,
    story: ContentPackReferenceSchema,
  }),
});

const pack = (id: string, moduleIds: string[] = []) => ({ id, version: 1, moduleIds });

export const contentManifest = ContentManifestSchema.parse({
  schemaVersion: 1,
  milestone: 'M4',
  packs: {
    campaign: pack('campaign-mythic-v2', ['fallen-heavens', 'underworld-tide']),
    characters: pack('characters-mythic-v2', [
      ...PATH_CLASS_IDS,
      'lyra-vale',
      'doran-vey',
      'mira-rook',
      'ren-ash',
      'sena-quill',
      'tarin-sol',
    ]),
    scenarios: pack(
      'scenarios-m3',
      ['operation', 'personal', 'discovery', 'rival', 'social'].flatMap((category) =>
        [1, 2, 3, 4].map((index) => `${category}-${index}`),
      ),
    ),
    enemies: pack('enemies-mythic-v2', [
      'rift-hound',
      'glass-weaver',
      'storm-jackal',
      'signal-leech',
      'ironback-mauler',
      'veil-scribe',
      'survey-beast',
      'mirror-oracle',
    ]),
    techniques: pack('techniques-m1', [
      'aegis-break',
      'hold-the-line',
      'arc-finish',
      'cross-step',
      'restorative-sigil',
      'binding-shot',
    ]),
    equipment: pack('equipment-mythic-v2', ['houndglass-edge', 'weaver-ward']),
    combatLanguage: pack(
      'combat-language-m4',
      ['attack', 'heal', 'guard', 'status', 'interrupt', 'defeat', 'resource'].flatMap(
        (eventType) => [1, 2, 3, 4].map((index) => `${eventType}-frame-${index}`),
      ),
    ),
    story: pack('story-authoring-mythic-v3', [
      'mythic-opening-turns-1-3',
      'causal-scene-beats',
      'truthful-choice-effects',
      ...['operation', 'personal', 'discovery', 'rival', 'social'].flatMap((category) =>
        [1, 2, 3, 4].map((index) => `${category}-${index}`),
      ),
    ]),
  },
});

function hashManifest(serialisedManifest: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < serialisedManifest.length; index += 1) {
    hash ^= serialisedManifest.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export const CONTENT_MANIFEST_HASH = hashManifest(JSON.stringify(contentManifest));
