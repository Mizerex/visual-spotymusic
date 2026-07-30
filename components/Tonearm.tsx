"use client";

import { useTonearmProgress } from "@/hooks/useTonearmProgress";
import styles from "./Tonearm.module.css";

type TonearmProps = {
  position: number;
  duration: number;
  hasTrack: boolean;
  playing: boolean;
};

export function Tonearm({ position, duration, hasTrack, playing }: TonearmProps) {
  const angle = useTonearmProgress(position, duration, hasTrack);
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
