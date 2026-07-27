"use client";
import { usePlaybackState } from "@/hooks/usePlaybackState";
import { Knob } from "./Knob";
import { VUMeter } from "./VUMeter";
export function AnalogPanel() {
  const playback = usePlaybackState();
  return <section className="analog-panel" aria-label="Painel analógico">
    <div className="analog-title"><span>VISUAL</span><strong>STEREO AMPLIFIER</strong><small>VS-70</small></div>
    <div className="meters"><VUMeter channel="L" playing={playback.isPlaying} /><VUMeter channel="R" playing={playback.isPlaying} /></div>
    <div className="tone-controls"><Knob label="BASS" initial={0} min={-10} max={10} suffix=" dB" /><Knob label="MID" initial={0} min={-10} max={10} suffix=" dB" /><Knob label="TREBLE" initial={0} min={-10} max={10} suffix=" dB" /><Knob label="BALANCE" initial={0} min={-50} max={50} /></div>
    <div className="output-control"><span>OUTPUT</span><Knob label="LEVEL" initial={72} /><small className="visual-note">Controle visual</small></div>
  </section>;
}
