"use client";
import { useState } from "react";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import { Vinyl } from "./Vinyl";
import { Tonearm } from "./Tonearm";

export function Turntable() {
  const { playback, toggle, activateDevice, playerReady } = useSpotifyAuth();
  const [rpm, setRpm] = useState<33 | 45>(33);
  return <section className="turntable-section" aria-label="Toca-discos">
    <div className="turntable-topline"><span className="model">MM-77 <small>DIRECT DRIVE</small></span><span className={`status-light ${playback.isPlaying ? "on" : ""}`}><i /> {playback.isPlaying ? "PLAYING" : "STANDBY"}</span></div>
    <div className="deck">
      <div className="wood-grain" />
      <div className="platter"><div className="platter-dots" /><Vinyl playing={playback.isPlaying} rpm={rpm} image={playback.track?.album.images?.[0]?.url} album={playback.track?.album.name} /></div>
      <Tonearm position={playback.position} duration={playback.duration} hasTrack={Boolean(playback.track)} />
      <div className="deck-controls">
        <button className="power-knob" onClick={playback.track ? toggle : activateDevice} aria-label={playback.track ? (playback.isPlaying ? "Pausar" : "Iniciar reprodução") : "Ativar toca-discos"}><i className={playerReady ? "on" : ""} /></button>
        <div className="rpm-switch"><button className={rpm === 33 ? "active" : ""} onClick={() => setRpm(33)}>33</button><button className={rpm === 45 ? "active" : ""} onClick={() => setRpm(45)}>45</button><small>RPM</small></div>
        <span className="pitch-label">{playerReady ? "PLAYER ONLINE" : "TOQUE PARA ATIVAR"}</span>
      </div>
    </div>
    <p className="turntable-caption">VISUAL SPOTYMUSIC HI-FIDELITY <span>SERIES 01</span></p>
  </section>;
}
