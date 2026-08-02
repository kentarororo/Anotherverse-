export function createCampaignSeed(): string {
  const values = new Uint32Array(2);
  globalThis.crypto.getRandomValues(values);
  const first = values[0]?.toString(36).padStart(7, '0') ?? '0000000';
  const second = values[1]?.toString(36).padStart(7, '0') ?? '0000000';
  return `AV-${first}-${second}`.toUpperCase();
}
