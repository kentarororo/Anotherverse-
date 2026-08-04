import { z } from 'zod';
import { PATH_CLASS_IDS } from './path-classes';
import { QUEST_ARCS, QUEST_CHAPTER_VARIANTS } from './quest-arcs';

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
    scenarios: pack('world-quest-arcs-v2', [
      ...Object.values(QUEST_ARCS).flatMap((arc) =>
        arc.chapters.map((chapter) => `${arc.id}-turn-${chapter.turn}`),
      ),
      ...Object.entries(QUEST_CHAPTER_VARIANTS).flatMap(([worldId, chapters]) =>
        Object.entries(chapters).flatMap(([turn, variants]) =>
          (variants ?? []).map((_, index) => `${worldId}-turn-${turn}-variant-${index + 1}`),
        ),
      ),
    ]),
    enemies: pack('enemies-mythic-v2', [
      'rift-hound',
      'glass-weaver',
      'storm-jackal',
      'signal-leech',
      'ironback-mauler',
      'veil-scribe',
      'survey-beast',
      'mirror-oracle',
      'drowned-lancer',
      'bell-wraith',
    ]),
    techniques: pack('techniques-m1', [
      'aegis-break',
      'hold-the-line',
      'arc-finish',
      'cross-step',
      'restorative-sigil',
      'binding-shot',
    ]),
    equipment: pack('equipment-mythic-v3', [
      'houndglass-edge',
      'weaver-ward',
      'stormhook-sabre',
      'echo-shell',
      'ironback-plate',
      'true-name-knife',
      'crownchain-blade',
      'mirror-shard-charm',
      'tidebone-spear',
      'funeral-bell',
    ]),
    combatLanguage: pack(
      'combat-language-m4',
      ['attack', 'heal', 'guard', 'status', 'interrupt', 'defeat', 'resource'].map(
        (eventType) => `${eventType}-frame-1`,
      ),
    ),
    story: pack('story-authoring-mythic-v4', [
      'mythic-opening-turns-1-3',
      'causal-scene-beats',
      'truthful-choice-effects',
      'authored-scene-variants',
      ...Object.values(QUEST_ARCS).map((arc) => arc.id),
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
