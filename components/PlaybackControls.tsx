"use client";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
export function PlaybackControls() {
  const { playback, toggle, previous, next, setShuffle, setRepeat } = useSpotifyAuth();
  const cycleRepeat = () => setRepeat(playback.repeat === "off" ? "context" : playback.repeat === "context" ? "track" : "off");
  return <div className="playback-controls">
    <button className={playback.shuffle ? "active" : ""} onClick={() => setShuffle(!playback.shuffle)} aria-label="Aleatório">⌘</button>
    <button onClick={previous} aria-label="Faixa anterior">◀│</button>
    <button className="main-play" onClick={toggle} aria-label={playback.isPlaying ? "Pausar" : "Reproduzir"}>{playback.isPlaying ? "Ⅱ" : "▶"}</button>
    <button onClick={next} aria-label="Próxima faixa">│▶</button>
    <button className={playback.repeat !== "off" ? "active" : ""} onClick={cycleRepeat} aria-label="Repetir">↻{playback.repeat === "track" ? <sup>1</sup> : null}</button>
  </div>;
}
