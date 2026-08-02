import { z } from 'zod';

export const RNG_STREAM_NAMES = [
  'world',
  'characters',
  'scenarios',
  'enemies',
  'rewards',
  'combat',
  'narration',
] as const;

export const RngStreamNameSchema = z.enum(RNG_STREAM_NAMES);
export type RngStreamName = z.infer<typeof RngStreamNameSchema>;

export const RngStreamStateSchema = z.object({
  value: z.number().int().nonnegative().max(0xffffffff),
  position: z.number().int().nonnegative(),
});

export type RngStreamState = z.infer<typeof RngStreamStateSchema>;

export const RngStreamsStateSchema = z.record(RngStreamNameSchema, RngStreamStateSchema);
export type RngStreamsState = z.infer<typeof RngStreamsStateSchema>;

export interface RngDraw {
  readonly value: number;
  readonly uint32: number;
  readonly streams: RngStreamsState;
}

function hashSeed(input: string): number {
  let hash = 0x811c9dc5;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  const unsignedHash = hash >>> 0;
  return unsignedHash === 0 ? 0x6d2b79f5 : unsignedHash;
}

function nextUint32(stream: RngStreamState): RngStreamState {
  let value = stream.value >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;

  return {
    value: value >>> 0,
    position: stream.position + 1,
  };
}

export function createRngStreams(campaignSeed: string): RngStreamsState {
  if (campaignSeed.trim().length === 0) {
    throw new Error('Campaign seed must not be empty.');
  }

  return RngStreamsStateSchema.parse(
    Object.fromEntries(
      RNG_STREAM_NAMES.map((streamName) => [
        streamName,
        { value: hashSeed(`${campaignSeed}::${streamName}`), position: 0 },
      ]),
    ),
  );
}

export function drawFromStream(streams: RngStreamsState, name: RngStreamName): RngDraw {
  const nextStream = nextUint32(streams[name]);

  return {
    uint32: nextStream.value,
    value: nextStream.value / 0x100000000,
    streams: {
      ...streams,
      [name]: nextStream,
    },
  };
}

export function drawInteger(
  streams: RngStreamsState,
  name: RngStreamName,
  minimum: number,
  maximum: number,
): { readonly value: number; readonly streams: RngStreamsState } {
  if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || maximum < minimum) {
    throw new Error('RNG integer bounds must be integers with maximum >= minimum.');
  }

  const draw = drawFromStream(streams, name);
  const span = maximum - minimum + 1;
  return {
    value: minimum + Math.floor(draw.value * span),
    streams: draw.streams,
  };
}
