"use client";

import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import styles from "./Topbar.module.css";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { playback, profile, previous, next } = useSpotifyAuth();
  const trackName = playback.track?.name || "Visual Music";

  return (
    <header className={`studio-topbar ${styles.bar}`}>
      <div className={`topbar-nav ${styles.nav}`}>
        <button className={styles.menuButton} onClick={onMenu} aria-label="Abrir biblioteca">☰</button>
        <button onClick={previous} aria-label="Faixa anterior">‹</button>
        <button onClick={next} aria-label="Próxima faixa">›</button>
      </div>

      <div className={`topbar-track ${styles.track}`} title={trackName}>
        <span className={`${styles.signal} ${playback.isPlaying ? styles.signalPlaying : ""}`} aria-hidden="true">≋</span>
        <span className={styles.trackCopy}>
          <small>{playback.isPlaying ? "AGORA TOCANDO" : "SISTEMA HI-FI"}</small>
          <strong>{trackName}</strong>
        </span>
      </div>

      <div className={`topbar-account ${styles.account}`}>
        <span className={`${styles.status} ${playback.isPlaying ? styles.statusPlaying : ""}`}>
          <i aria-hidden="true" />
          {playback.isPlaying ? "REPRODUZINDO" : "PRONTO"}
        </span>
        <span className={styles.avatar} aria-label={profile?.display_name || "Perfil"}>
          {profile?.display_name?.slice(0, 1).toUpperCase() || "V"}
        </span>
      </div>
    </header>
  );
}
