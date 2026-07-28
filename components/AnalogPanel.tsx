"use client";
import { usePlaybackState } from "@/hooks/usePlaybackState";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import { Knob } from "./Knob";
import { VUMeter } from "./VUMeter";
export function AnalogPanel() {
  const playback = usePlaybackState();
  const { setVolume } = useSpotifyAuth();
  return <section className="analog-panel" aria-label="Painel analógico">
    <div className="analog-title"><span>VISUAL</span><strong>STEREO AMPLIFIER</strong><small>VS-70</small></div>
    <div className="meters"><VUMeter channel="L" playing={playback.isPlaying} /><VUMeter channel="R" playing={playback.isPlaying} /></div>
    <div className="tone-controls"><Knob label="BASS" initial={0} min={-10} max={10} suffix=" dB" /><Knob label="MID" initial={0} min={-10} max={10} suffix=" dB" /><Knob label="TREBLE" initial={0} min={-10} max={10} suffix=" dB" /><Knob label="BALANCE" initial={0} min={-50} max={50} /></div>
    <div className="output-control"><span>OUTPUT</span><Knob label="VOLUME" value={Math.round(playback.volume * 100)} onChange={value => { void setVolume(value / 100); }} /><small className="visual-note">Volume real</small></div>
  </section>;
}
