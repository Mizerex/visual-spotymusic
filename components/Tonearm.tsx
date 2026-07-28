"use client";
import { useEffect, useRef, useState } from "react";
import { useTonearmProgress } from "@/hooks/useTonearmProgress";

export function Tonearm({ position, duration, trackId, playing }: { position: number; duration: number; trackId?: string; playing: boolean }) {
  const previousTrack = useRef<string | undefined>(undefined);
  const [changingTrack, setChangingTrack] = useState(false);
  const hasTrack = Boolean(trackId);
  const ended = hasTrack && duration > 0 && position >= duration - 750;
  const waitingToStart = hasTrack && !playing && position < 500;

  useEffect(() => {
    const previous = previousTrack.current;
    previousTrack.current = trackId;
    if (!previous || !trackId || previous === trackId) return;
    setChangingTrack(true);
    const timer = setTimeout(() => setChangingTrack(false), 650);
    return () => clearTimeout(timer);
  }, [trackId]);

  const returning = !hasTrack || ended || changingTrack || waitingToStart;
  const angle = useTonearmProgress(position, duration, hasTrack, returning);
  const stateClass = returning ? "tonearm--returning" : playing ? "tonearm--playing" : "tonearm--paused";

  return <div className={`tonearm-assembly ${stateClass}`} data-progress={duration > 0 ? Math.round((position / duration) * 100) : 0}>
    <img
      className="tonearm-base-layer"
      src="/mizer-black-tonearm-base.png"
      alt=""
      draggable={false}
    />
    <img
      className="tonearm-layer-image"
      src="/mizer-black-tonearm-moving.png"
      alt=""
      draggable={false}
      style={{ transform: `rotate(${angle}deg)` }}
    />
  </div>;
}
