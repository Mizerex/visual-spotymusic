"use client";
import { useEffect, useRef, useState } from "react";
import { useTonearmProgress } from "@/hooks/useTonearmProgress";
export function Tonearm({ position, duration, trackId, playing }: { position: number; duration: number; trackId?: string; playing: boolean }) {
  const previousTrack = useRef<string | undefined>(undefined);
  const [changingTrack, setChangingTrack] = useState(false);
  const hasTrack = Boolean(trackId);
  const ended = hasTrack && duration > 0 && position >= duration - 750;

  useEffect(() => {
    const previous = previousTrack.current;
    previousTrack.current = trackId;
    if (!previous || !trackId || previous === trackId) return;
    setChangingTrack(true);
    const timer = setTimeout(() => setChangingTrack(false), 650);
    return () => clearTimeout(timer);
  }, [trackId]);

  const returning = !hasTrack || ended || changingTrack;
  const angle = useTonearmProgress(position, duration, hasTrack, returning);
  const stateClass = returning ? "tonearm--returning" : playing ? "tonearm--playing" : "tonearm--paused";
  return <div className={`tonearm-assembly ${stateClass}`} data-progress={duration > 0 ? Math.round((position / duration) * 100) : 0}>
    <svg className="tonearm tonearm-svg" viewBox="0 0 1000 680" aria-hidden="true">
      <defs>
        <linearGradient id="visualArmMetal" x1="0" x2="1">
          <stop offset="0" stopColor="#080706" /><stop offset=".25" stopColor="#403b35" />
          <stop offset=".48" stopColor="#c5b8a5" /><stop offset=".72" stopColor="#514a41" /><stop offset="1" stopColor="#070605" />
        </linearGradient>
        <filter id="visualArmShadow"><feDropShadow dx="7" dy="10" stdDeviation="5" floodOpacity=".72" /></filter>
      </defs>
      <g className="tonearm-moving" filter="url(#visualArmShadow)" style={{ transform: `rotate(${angle}deg)` }}>
        <path d="M858 106 C820 160 790 225 746 294 C700 365 642 427 574 490" fill="none" stroke="#080706" strokeWidth="31" strokeLinecap="round" />
        <path d="M858 106 C820 160 790 225 746 294 C700 365 642 427 574 490" fill="none" stroke="url(#visualArmMetal)" strokeWidth="19" strokeLinecap="round" />
        <g transform="translate(535 474) rotate(-31)">
          <path d="M0 0 H110 L126 20 L105 50 H10 Z" fill="#0d0c0b" stroke="#40382f" strokeWidth="3" />
          <path d="M16 14 H84" stroke="rgba(255,255,255,.13)" strokeWidth="3" />
          <path d="M99 46 l14 22" stroke="#d6cdbf" strokeWidth="3" />
          <circle cx="113" cy="68" r="3.4" fill="#fff4dc" className="stylus-tip" />
        </g>
      </g>
    </svg>
  </div>;
}
