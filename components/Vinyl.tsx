"use client";
import { useVinylAnimation } from "@/hooks/useVinylAnimation";
export function Vinyl({ playing, rpm, album }: { playing: boolean; rpm: 33 | 45; album?: string }) {
  const ref = useVinylAnimation(playing, rpm);
  return <div className="vinyl-perspective"><div className="vinyl"><div className="record-grooves" />
    <div className={`vinyl-motion ${playing ? "vinyl--spinning" : ""}`} data-motion={playing ? "spinning" : "paused"} ref={ref}><div className="vinyl-shine" /><div className="record-label"><span>VISUAL</span><i /><small>{album || "SIDE A"}</small></div></div><b className="spindle-hole" />
  </div></div>;
}
