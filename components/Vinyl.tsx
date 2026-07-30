"use client";

import { useVinylAnimation } from "@/hooks/useVinylAnimation";
import styles from "./Vinyl.module.css";

export function Vinyl({
  playing,
  rpm,
  image,
  album,
  removed,
}: {
  playing: boolean;
  rpm: 33 | 45;
  image?: string;
  album?: string;
  removed: boolean;
}) {
  const ref = useVinylAnimation(playing, rpm);

  return (
    <div
      className={`${styles.perspective} ${removed ? styles.removed : ""}`}
      aria-label={album ? `Disco do álbum ${album}` : "Disco de vinil"}
      aria-hidden={removed}
    >
      <div className={styles.vinyl} ref={ref}>
        <img className={styles.discTexture} src="/vinyl-selected.png" alt="" />

        <div className={styles.label}>
          {image ? (
            <img className={styles.cover} src={image} alt="" />
          ) : (
            <span className={styles.fallback}>
              <strong>VISUAL</strong>
              <small>{album || "SPOTYMUSIC · SIDE A"}</small>
            </span>
          )}
        </div>

        <span className={styles.spindle} aria-hidden="true" />
      </div>
    </div>
  );
}
