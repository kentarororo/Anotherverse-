/**
 * Approved player-facing vocabulary. Internal schema names such as `callingId` remain stable, but
 * normal UI and story copy should use one term for each concept.
 */
export const PLAYER_LANGUAGE = {
  heroPower: 'Mythic Awakening',
  heroPowerPlural: 'Mythic Awakenings',
  heroPowerShort: 'Awakening',
  nextFormCondition: 'Awakening Trial',
  class: 'Hunter Class',
  rank: 'Hunter Rank',
  actionResource: 'AP',
  party: 'trio',
  readiness: 'Ready',
  provisions: 'Rations',
  reputation: 'Renown',
  threat: 'Danger',
  currency: 'Coin',
  craftingMaterial: 'Relic Dust',
} as const;

export const REJECTED_PLAYER_POWER_TERMS = [
  'Calling',
  'Mythic Path',
  'Path Rank',
  'Path development',
  'Calling mastery',
  'Path Power',
] as const;
