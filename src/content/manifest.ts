import { z } from 'zod';

export const ContentPackReferenceSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  moduleIds: z.array(z.string().min(1)),
});

export const ContentManifestSchema = z.object({
  schemaVersion: z.literal(1),
  milestone: z.literal('M1'),
  packs: z.object({
    campaign: ContentPackReferenceSchema,
    characters: ContentPackReferenceSchema,
    scenarios: ContentPackReferenceSchema,
    enemies: ContentPackReferenceSchema,
    techniques: ContentPackReferenceSchema,
    equipment: ContentPackReferenceSchema,
    combatLanguage: ContentPackReferenceSchema,
  }),
});

const pack = (id: string, moduleIds: string[] = []) => ({ id, version: 1, moduleIds });

export const contentManifest = ContentManifestSchema.parse({
  schemaVersion: 1,
  milestone: 'M1',
  packs: {
    campaign: pack('campaign-foundation', ['foundation-city']),
    characters: pack('characters-m1', ['mira-vale', 'dax-ren', 'sorrel-voss']),
    scenarios: pack('scenarios-m1', ['m1-glassline-breach']),
    enemies: pack('enemies-m1', ['rift-hound', 'glass-weaver']),
    techniques: pack('techniques-m1', [
      'aegis-break',
      'hold-the-line',
      'arc-finish',
      'cross-step',
      'restorative-sigil',
      'binding-shot',
    ]),
    equipment: pack('equipment-foundation'),
    combatLanguage: pack('combat-language-m1', ['attack', 'heal', 'defeat', 'status']),
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
