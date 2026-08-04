export interface SceneBeats {
  hook: string;
  cause: string;
  stakes: string;
  decision: string;
}

export function createSceneBeats(paragraph: string): SceneBeats {
  const sentences = paragraph
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  if (sentences.length < 4)
    throw new Error('A scenario brief requires at least four causal beats.');
  return {
    hook: sentences[0]!,
    cause: sentences[1]!,
    stakes: sentences.slice(2, -1).join(' '),
    decision: sentences.at(-1)!,
  };
}
