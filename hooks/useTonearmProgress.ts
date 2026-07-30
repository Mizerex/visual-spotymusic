import { useMemo } from "react";
export function useTonearmProgress(position: number, duration: number, hasTrack: boolean) {
  return useMemo(() => !hasTrack ? -3 : 14 + Math.min(1, position / Math.max(duration, 1)) * 7, [position, duration, hasTrack]);
}
