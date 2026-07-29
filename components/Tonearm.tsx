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
      <div className={styles.base} />
      <div className={styles.arm} style={{ transform: `rotate(${angle}deg)` }}>
        <div className={styles.counterweight} />
        <div className={styles.pivotCollar} />
        <div className={styles.tube} />
        <div className={styles.headshell}>
          <div className={styles.cartridge}>
            <i className={styles.stylus} />
          </div>
        </div>
      </div>
      <div className={styles.rest} />
    </div>
  );
}
