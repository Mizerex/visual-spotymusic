import { useMemo } from "react";
export function useTonearmProgress(position: number, duration: number, hasTrack: boolean, returning = false) {
  return useMemo(() => {
    if (!hasTrack || returning) return 0;
    const progress = Math.max(0, Math.min(1, position / Math.max(duration, 1)));
    // The stylus lands on the outer groove as soon as playback starts,
    // then follows the record continuously toward the inner groove.
    const outerGroove = 22;
    const innerGroove = 42;
    return outerGroove + progress * (innerGroove - outerGroove);
  }, [position, duration, hasTrack, returning]);
}
