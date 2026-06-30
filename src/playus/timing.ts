export const MAX_GAMEPLAY_DELTA_MS = 150;

export function clampGameplayDeltaMs(deltaMs: number): number {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return 0;
  return Math.min(deltaMs, MAX_GAMEPLAY_DELTA_MS);
}

export function clampGameplayDeltaSeconds(deltaSeconds: number): number {
  if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return 0;
  return Math.min(deltaSeconds, MAX_GAMEPLAY_DELTA_MS / 1000);
}
