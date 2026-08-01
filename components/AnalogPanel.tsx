"use client";

import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import { levelToVolume, volumeToLevel } from "@/utils/volume";
import { Knob } from "./Knob";
import { VUMeter } from "./VUMeter";

export function AnalogPanel() {
  const { playback, tone, setVolume, setBalance, setBass, setTreble } = useSpotifyAuth();
  const volumeLevel = volumeToLevel(playback.volume);

  return <section className="analog-panel" aria-label="Painel analógico">
    <div className="analog-title"><span>VISUAL</span><strong>STEREO RECEIVER</strong><small>VS-70 · HI-FIDELITY</small></div>
    <div className="meters"><VUMeter channel="L" playing={playback.isPlaying} /><VUMeter channel="R" playing={playback.isPlaying} /></div>
    <div className="tone-controls">
      <Knob label="VOLUME" value={volumeLevel} step={1} onChange={value => void setVolume(levelToVolume(value))} />
      <Knob label="BALANCE" value={tone.balance} min={-50} max={50} step={5} onChange={setBalance} />
      <Knob label="BASS" value={tone.bass} min={-10} max={10} suffix=" dB" onChange={setBass} />
      <Knob label="TREBLE" value={tone.treble} min={-10} max={10} suffix=" dB" onChange={setTreble} />
    </div>
    <div className="output-control"><span>SPEAKERS</span><Knob label="A / B" initial={50} /><small className="visual-note">PHONES · 6.3 mm</small></div>
  </section>;
}
