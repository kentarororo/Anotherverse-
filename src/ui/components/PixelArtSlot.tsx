interface PixelArtSlotProps {
  assetId: string;
  role: string;
  side: 'heroes' | 'enemies';
  state?: string;
  compact?: boolean;
}

export function PixelArtSlot({
  assetId,
  role,
  side,
  state = 'idle',
  compact = false,
}: PixelArtSlotProps) {
  return (
    <div
      className={`pixel-art-slot role-${role} side-${side} state-${state} ${compact ? 'is-compact' : ''}`}
      data-art-slot={`unit:${assetId}`}
      data-asset-id={assetId}
      aria-hidden="true"
    >
      <div className="pixel-sprite-canvas">
        <span className="pixel-aura" />
        <span className="pixel-shadow" />
        <span className="pixel-body" />
        <span className="pixel-head" />
        <span className="pixel-prop" />
      </div>
      <small>ART SLOT / {assetId}</small>
    </div>
  );
}
