"use client";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
export function PlaybackControls() {
  const { playback, toggle, stop, previous, next, setShuffle, setRepeat } = useSpotifyAuth();
  const unavailable = !playback.track;
  const cycleRepeat = () => setRepeat(playback.repeat === "off" ? "context" : playback.repeat === "context" ? "track" : "off");
  return <div className="playback-controls">
    <button disabled={unavailable} className={playback.shuffle ? "active" : ""} onClick={() => setShuffle(!playback.shuffle)} aria-label="Ativar ou desativar reprodução aleatória" aria-pressed={playback.shuffle}>⌘</button>
    <button disabled={unavailable} onClick={previous} aria-label="Faixa anterior">◀│</button>
    <button disabled={unavailable} className="main-play" onClick={toggle} aria-label={playback.isPlaying ? "Pausar" : "Reproduzir"}>{playback.isPlaying ? "Ⅱ" : "▶"}</button>
    <button disabled={unavailable || playback.stopped} className="stop-control" onClick={stop} aria-label="Parar música e recolher o braço">■</button>
    <button disabled={unavailable} onClick={next} aria-label="Próxima faixa">│▶</button>
    <button disabled={unavailable} className={playback.repeat !== "off" ? "active" : ""} onClick={cycleRepeat} aria-label="Alterar modo de repetição" aria-pressed={playback.repeat !== "off"}>↻{playback.repeat === "track" ? <sup>1</sup> : null}</button>
  </div>;
}
