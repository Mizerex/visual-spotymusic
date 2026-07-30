"use client";

import { useEffect, useRef, useState } from "react";
import { useTonearmProgress } from "@/hooks/useTonearmProgress";
import styles from "./Tonearm.module.css";

type TonearmProps = {
  trackId: string;
  position: number;
  duration: number;
  hasTrack: boolean;
  playing: boolean;
};

export function Tonearm({ trackId, position, duration, hasTrack, playing }: TonearmProps) {
  const previousTrack = useRef(trackId);
  const [changingRecord, setChangingRecord] = useState(false);
  const onRecord = hasTrack && !changingRecord;
  const angle = useTonearmProgress(position, duration, onRecord);
  const stateClass = onRecord ? (playing ? styles.lowered : styles.parked) : styles.parked;

  useEffect(() => {
    if (!hasTrack || !playing) {
      setChangingRecord(false);
      previousTrack.current = trackId;
      return;
    }
    if (!previousTrack.current) {
      previousTrack.current = trackId;
      return;
    }
    if (trackId && trackId !== previousTrack.current && hasTrack && playing) {
      setChangingRecord(true);
      const timer = window.setTimeout(() => setChangingRecord(false), 850);
      previousTrack.current = trackId;
      return () => window.clearTimeout(timer);
    }
    previousTrack.current = trackId;
  }, [hasTrack, playing, trackId]);

  return (
    <div className={`${styles.assembly} ${stateClass}`} aria-hidden="true">
      <img
        className={styles.armImage}
        src="/tonearm-mechanical.png"
        alt=""
        style={{ transform: `rotate(${angle}deg)` }}
      />
    </div>
  );
}
