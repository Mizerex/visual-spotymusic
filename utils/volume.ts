const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const DEFAULT_RESTORE_LEVEL = 35;
export const MIN_AUDIBLE_VOLUME = 0.000001;

export function clampVolume(value: number) {
  return clamp(Number.isFinite(value) ? value : 0, 0, 1);
}

export function levelToVolume(level: number) {
  const normalized = clamp(Number.isFinite(level) ? level : 0, 0, 100) / 100;
  return Number((normalized * normalized).toFixed(4));
}

export function volumeToLevel(volume: number) {
  return Math.round(Math.sqrt(clampVolume(volume)) * 100);
}
