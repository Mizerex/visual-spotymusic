import { useMemo } from "react";
export function useTonearmProgress(position: number, duration: number, hasTrack: boolean, returning = false) {
  return useMemo(() => {
    if (!hasTrack || returning) return 0;
    const progress = Math.max(0, Math.min(1, position / Math.max(duration, 1)));
    const outerGroove = 15;
    const innerGroove = 35;
    return outerGroove + progress * (innerGroove - outerGroove);
  }, [position, duration, hasTrack, returning]);
}
