import type { RngStreamsState } from '../rng/streams';
import { drawFromStream } from '../rng/streams';
import type {
  EquipmentDefinition,
  FusionCandidate,
  MaterialAffinity,
  MaterialDefinition,
} from '../model/progression';

export type FusionMaterialIds = [string, string, string];

export interface FusionPreview {
  materialIds: FusionMaterialIds;
  slot: EquipmentDefinition['slot'];
  affinity: MaterialAffinity;
  likelyBonuses: Pick<EquipmentDefinition, 'powerBonus' | 'guardBonus'>;
  description: string;
  candidates: FusionCandidate[];
}

export interface FusionResolution {
  item: EquipmentDefinition;
  preview: FusionPreview;
  selectedCandidate: FusionCandidate;
  roll: number;
  streams: RngStreamsState;
}

interface FusionTotals {
  power: number;
  guard: number;
  weapon: number;
  support: number;
  charger: number;
  hexer: number;
}

const SLOTS = ['weapon', 'support'] as const;
const AFFINITIES = ['charger', 'hexer'] as const;

function selectedMaterials(
  materialIds: FusionMaterialIds,
  materialDefinitions: Record<string, MaterialDefinition>,
) {
  return materialIds.map((materialId) => {
    const material = materialDefinitions[materialId];
    if (material === undefined) throw new Error(`Unknown forge material: ${materialId}.`);
    return material;
  });
}

function fusionTotals(materials: MaterialDefinition[]): FusionTotals {
  return materials.reduce<FusionTotals>(
    (totals, material) => ({
      power: totals.power + material.weights.power,
      guard: totals.guard + material.weights.guard,
      weapon: totals.weapon + material.weights.weapon,
      support: totals.support + material.weights.support,
      charger: totals.charger + material.weights.charger,
      hexer: totals.hexer + material.weights.hexer,
    }),
    { power: 0, guard: 0, weapon: 0, support: 0, charger: 0, hexer: 0 },
  );
}

function bonusesFor(totals: FusionTotals, slot: EquipmentDefinition['slot']) {
  return slot === 'weapon'
    ? {
        powerBonus: Math.max(1, Math.min(4, Math.round(totals.power / 4))),
        guardBonus: Math.min(2, Math.floor(totals.guard / 7)),
      }
    : {
        powerBonus: Math.min(2, Math.floor(totals.power / 7)),
        guardBonus: Math.max(1, Math.min(4, Math.round(totals.guard / 4))),
      };
}

function buildCandidates(totals: FusionTotals): FusionCandidate[] {
  const raw = SLOTS.flatMap((slot) =>
    AFFINITIES.map((affinity) => ({
      slot,
      affinity,
      weight: totals[slot] * totals[affinity],
    })),
  );
  const totalWeight = raw.reduce((sum, candidate) => sum + candidate.weight, 0);
  return raw.map((candidate) => ({ ...candidate, chance: candidate.weight / totalWeight }));
}

function strongestCandidate(candidates: FusionCandidate[]) {
  return [...candidates].sort(
    (left, right) =>
      right.weight - left.weight ||
      left.slot.localeCompare(right.slot) ||
      left.affinity.localeCompare(right.affinity),
  )[0]!;
}

function dominantMaterial(
  materials: MaterialDefinition[],
  candidate: Pick<FusionCandidate, 'slot' | 'affinity'>,
) {
  return [...materials].sort(
    (left, right) =>
      right.weights[candidate.slot] +
        right.weights[candidate.affinity] -
        (left.weights[candidate.slot] + left.weights[candidate.affinity]) ||
      left.id.localeCompare(right.id),
  )[0]!;
}

function itemForCandidate(
  materialIds: FusionMaterialIds,
  materials: MaterialDefinition[],
  totals: FusionTotals,
  candidate: FusionCandidate,
): EquipmentDefinition {
  const primary = dominantMaterial(materials, candidate);
  const bonuses = bonusesFor(totals, candidate.slot);
  const suffix = candidate.slot === 'weapon' ? 'Relicblade' : 'Ward';
  const recipeId = [...materialIds].sort().join('--');
  const ingredientNames = materials.map((material) => material.name).join(', ');
  return {
    id: `forged-${recipeId}-${candidate.slot}-${candidate.affinity}`,
    name: `${primary.forgeName} ${suffix}`,
    slot: candidate.slot,
    description: `Forged from ${ingredientNames}. +${bonuses.powerBonus} Power, +${bonuses.guardBonus} Guard, and protection against ${candidate.affinity} attacks.`,
    ...bonuses,
    counterTag: candidate.affinity,
  };
}

export function previewMaterialFusion(
  materialIds: FusionMaterialIds,
  materialDefinitions: Record<string, MaterialDefinition>,
): FusionPreview {
  const materials = selectedMaterials(materialIds, materialDefinitions);
  const totals = fusionTotals(materials);
  const candidates = buildCandidates(totals);
  const likely = strongestCandidate(candidates);
  const likelyBonuses = bonusesFor(totals, likely.slot);
  return {
    materialIds: [...materialIds],
    slot: likely.slot,
    affinity: likely.affinity,
    likelyBonuses,
    description: `${likely.slot === 'weapon' ? 'Weapon' : 'Support relic'} is most likely. The selected materials favour ${likely.affinity} counterplay.`,
    candidates,
  };
}

export function resolveMaterialFusion(
  materialIds: FusionMaterialIds,
  materialDefinitions: Record<string, MaterialDefinition>,
  initialStreams: RngStreamsState,
): FusionResolution {
  const materials = selectedMaterials(materialIds, materialDefinitions);
  const totals = fusionTotals(materials);
  const preview = previewMaterialFusion(materialIds, materialDefinitions);
  const draw = drawFromStream(initialStreams, 'rewards');
  const totalWeight = preview.candidates.reduce((sum, candidate) => sum + candidate.weight, 0);
  const threshold = draw.value * totalWeight;
  let cumulativeWeight = 0;
  let selectedCandidate = preview.candidates.at(-1)!;
  for (const candidate of preview.candidates) {
    cumulativeWeight += candidate.weight;
    if (threshold < cumulativeWeight) {
      selectedCandidate = candidate;
      break;
    }
  }
  return {
    item: itemForCandidate(materialIds, materials, totals, selectedCandidate),
    preview,
    selectedCandidate,
    roll: draw.value,
    streams: draw.streams,
  };
}
