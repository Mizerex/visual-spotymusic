"use client";
import { useState } from "react";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import { Vinyl } from "./Vinyl";
import { Tonearm } from "./Tonearm";
import { LibraryShowcase } from "./LibraryShowcase";

export function Turntable() {
  const { playback, toggle, activateDevice, playerReady } = useSpotifyAuth();
  const [rpm, setRpm] = useState<33 | 45>(33);
  const [targetLightOn, setTargetLightOn] = useState(false);
  return <section className="turntable-section" aria-label="Toca-discos">
    <LibraryShowcase />
    <div className="turntable-topline"><span className="model">MM-77 <small>DIRECT DRIVE</small></span><span className={`status-light ${playback.isPlaying ? "on" : ""}`}><i /> {playback.isPlaying ? "PLAYING" : "STANDBY"}</span></div>
    <div className="deck">
      <div className="wood-grain" />
      <div className={`target-light-beam ${targetLightOn ? "is-on" : ""}`} aria-hidden="true" />
      <button
        type="button"
        className={`target-light ${targetLightOn ? "is-on" : ""}`}
        onClick={() => setTargetLightOn(on => !on)}
        aria-label={targetLightOn ? "Apagar luz lateral do prato" : "Acender luz lateral do prato"}
        aria-pressed={targetLightOn}
        title={targetLightOn ? "Apagar luz do prato" : "Acender luz do prato"}
      >
        <span className="target-light-stem"><i /></span>
      </button>
      <div className="platter"><div className="platter-dots" /><Vinyl
        playing={playback.isPlaying}
        rpm={rpm}
        album={playback.track?.album.name}
        coverUrl={playback.track?.album.images?.[0]?.url}
      /></div>
      <Tonearm position={playback.position} duration={playback.duration} trackId={playback.track?.id} playing={playback.isPlaying} />
      <div className="deck-controls">
        <button className="power-knob" onClick={playback.track ? toggle : activateDevice} aria-label={playback.track ? (playback.isPlaying ? "Pausar" : "Iniciar reprodução") : "Ativar toca-discos"}><i className={playerReady ? "on" : ""} /></button>
        <div className="rpm-switch"><button className={rpm === 33 ? "active" : ""} onClick={() => setRpm(33)}>33</button><button className={rpm === 45 ? "active" : ""} onClick={() => setRpm(45)}>45</button><small>RPM</small></div>
        <span className="pitch-label">{playerReady ? "PLAYER ONLINE" : "TOQUE PARA ATIVAR"}</span>
      </div>
    </div>
    <p className="turntable-caption">VISUAL SPOTYMUSIC HI-FIDELITY <span>SERIES 01</span></p>
  </section>;
}
