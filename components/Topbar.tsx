"use client";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { playback, profile, previous, next } = useSpotifyAuth();
  return <header className="studio-topbar">
    <div className="topbar-nav">
      <button onClick={onMenu} aria-label="Abrir biblioteca">☰</button>
      <button onClick={previous} aria-label="Faixa anterior">‹</button>
      <button onClick={next} aria-label="Próxima faixa">›</button>
    </div>
    <div className="topbar-track" title={playback.track?.name || "Visual SpotyMusic"}>
      <span className={playback.isPlaying ? "playing" : ""}>≋</span>
      <strong>{playback.track?.name || "Visual SpotyMusic"}</strong>
      <i>⌄</i>
    </div>
    <div className="topbar-account">
      <span className={`topbar-status ${playback.isPlaying ? "playing" : ""}`}><i />{playback.isPlaying ? "REPRODUZINDO" : "PRONTO"}</span>
      <span className="topbar-avatar">{profile?.display_name?.slice(0, 1).toUpperCase() || "V"}</span>
    </div>
  </header>;
}
