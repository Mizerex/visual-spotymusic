import { useMemo } from "react";
export function useTonearmProgress(position: number, duration: number, hasTrack: boolean, returning = false) {
  return useMemo(() => {
    if (!hasTrack || returning) return 19;
    const progress = Math.max(0, Math.min(1, position / Math.max(duration, 1)));
    return 14.5 + progress * 9;
  }, [position, duration, hasTrack, returning]);
}
