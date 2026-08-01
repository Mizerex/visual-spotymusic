"use client";

import { useEffect, useRef } from "react";
import { DEFAULT_RESTORE_LEVEL, MIN_AUDIBLE_VOLUME, levelToVolume, volumeToLevel } from "@/utils/volume";

export function VolumeControl({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const lastAudibleVolume = useRef(levelToVolume(DEFAULT_RESTORE_LEVEL));
  const level = volumeToLevel(value);

  useEffect(() => {
    if (value > MIN_AUDIBLE_VOLUME) lastAudibleVolume.current = value;
  }, [value]);

  const toggleMute = () => {
    onChange(value > MIN_AUDIBLE_VOLUME ? 0 : lastAudibleVolume.current);
  };

  return <div className="volume-control">
    <button aria-label={value > MIN_AUDIBLE_VOLUME ? "Silenciar" : "Restaurar volume"} onClick={toggleMute}>{value > MIN_AUDIBLE_VOLUME ? "◖))" : "◖×"}</button>
    <input
      aria-label={`Volume: ${level}%`}
      type="range"
      min="0"
      max="100"
      step="1"
      value={level}
      onChange={event => onChange(levelToVolume(Number(event.target.value)))}
      style={{ "--progress": `${level}%` } as React.CSSProperties}
    />
  </div>;
}
