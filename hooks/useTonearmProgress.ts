import { useMemo } from "react";

const TRACKS_PER_VISUAL_VINYL = 6;
const PARKED_ANGLE = 0;
const FIRST_GROOVE_ANGLE = 14;
const LAST_GROOVE_ANGLE = 27;

export function useTonearmProgress(position: number, duration: number, hasTrack: boolean, queueIndex: number, queueLength: number) {
  return useMemo(() => {
    if (!hasTrack) return PARKED_ANGLE;
    const trackProgress = Math.min(1, position / Math.max(duration, 1));
    const vinylProgress = queueLength > 0
      ? ((Math.max(0, queueIndex) % TRACKS_PER_VISUAL_VINYL) + trackProgress) / TRACKS_PER_VISUAL_VINYL
      : trackProgress;
    return FIRST_GROOVE_ANGLE + vinylProgress * (LAST_GROOVE_ANGLE - FIRST_GROOVE_ANGLE);
  }, [duration, hasTrack, position, queueIndex, queueLength]);
}
