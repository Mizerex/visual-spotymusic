"use client";
import { usePlaybackState } from "@/hooks/usePlaybackState";
import { Knob } from "./Knob";
import { VUMeter } from "./VUMeter";
export function AnalogPanel() {
  const playback = usePlaybackState();
  return <section className="analog-panel" aria-label="Painel analógico">
    <div className="analog-title"><span>VISUAL</span><strong>STEREO RECEIVER</strong><small>VS-70 · HI-FIDELITY</small></div>
    <div className="meters"><VUMeter channel="L" playing={playback.isPlaying} /><VUMeter channel="R" playing={playback.isPlaying} /></div>
    <div className="tone-controls"><Knob label="VOLUME" initial={72} /><Knob label="BALANCE" initial={0} min={-50} max={50} /><Knob label="BASS" initial={0} min={-10} max={10} suffix=" dB" /><Knob label="TREBLE" initial={0} min={-10} max={10} suffix=" dB" /></div>
    <div className="output-control"><span>SPEAKERS</span><Knob label="A / B" initial={50} /><small className="visual-note">PHONES · 6.3 mm</small></div>
  </section>;
}
