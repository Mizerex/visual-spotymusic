"use client";

import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";

export function PlaybackControls() {
  const { playback, toggle, stop, previous, next, setShuffle, setRepeat } = useSpotifyAuth();
  const unavailable = !playback.track;
  const knownQueue = playback.queueLength > 0;
  const cycleRepeat = () => setRepeat(playback.repeat === "off" ? "context" : playback.repeat === "context" ? "track" : "off");

  return <div className="playback-controls">
    <button disabled={unavailable} className={playback.shuffle ? "active" : ""} onClick={() => setShuffle(!playback.shuffle)} aria-label="Ativar ou desativar reprodução aleatória" aria-pressed={playback.shuffle}>⌘</button>
    <button disabled={unavailable || (knownQueue && playback.queueIndex <= 0)} onClick={previous} aria-label="Faixa anterior" aria-keyshortcuts="ArrowLeft J">◀│</button>
    <button disabled={unavailable} className="main-play" onClick={toggle} aria-label={playback.isPlaying ? "Pausar" : "Reproduzir"} aria-keyshortcuts="Space K">{playback.isPlaying ? "Ⅱ" : "▶"}</button>
    <button disabled={unavailable || playback.stopped} className="stop-control" onClick={stop} aria-label="Parar música e recolher o braço" aria-keyshortcuts="S">■</button>
    <button disabled={unavailable || (knownQueue && playback.queueIndex >= playback.queueLength - 1)} onClick={next} aria-label="Próxima faixa" aria-keyshortcuts="ArrowRight L">│▶</button>
    <button disabled={unavailable} className={playback.repeat !== "off" ? "active" : ""} onClick={cycleRepeat} aria-label="Alterar modo de repetição" aria-pressed={playback.repeat !== "off"}>↻{playback.repeat === "track" ? <sup>1</sup> : null}</button>
  </div>;
}
