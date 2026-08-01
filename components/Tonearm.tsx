"use client";

import { useTonearmProgress } from "@/hooks/useTonearmProgress";
import styles from "./Tonearm.module.css";

type TonearmProps = {
  position: number;
  duration: number;
  queueIndex: number;
  queueLength: number;
  hasTrack: boolean;
  playing: boolean;
};

export function Tonearm({ position, duration, queueIndex, queueLength, hasTrack, playing }: TonearmProps) {
  const angle = useTonearmProgress(position, duration, hasTrack, queueIndex, queueLength);
  const stateClass = hasTrack ? (playing ? styles.lowered : styles.parked) : styles.parked;

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
