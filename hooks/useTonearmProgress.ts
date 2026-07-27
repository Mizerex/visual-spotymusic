import { useMemo } from "react";
export function useTonearmProgress(position: number, duration: number, hasTrack: boolean) {
  return useMemo(() => !hasTrack ? -23 : -7 + Math.min(1, position / Math.max(duration, 1)) * 18, [position, duration, hasTrack]);
}
