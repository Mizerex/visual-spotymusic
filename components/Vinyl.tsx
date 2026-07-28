"use client";
import { useVinylAnimation } from "@/hooks/useVinylAnimation";
export function Vinyl({ playing, rpm, album }: { playing: boolean; rpm: 33 | 45; album?: string }) {
  const ref = useVinylAnimation(playing, rpm);
  return <div className="vinyl-perspective"><div className="vinyl">
    <div
      className={`vinyl-motion ${playing ? "vinyl--spinning" : ""}`}
      data-motion={playing ? "spinning" : "paused"}
      ref={ref}
    >
      <img className="vinyl-layer-image" src="/mizer-vinyl.png" alt="" draggable={false} />
    </div>
  </div></div>;
}
