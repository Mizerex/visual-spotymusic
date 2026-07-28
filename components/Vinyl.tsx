"use client";
import { useVinylAnimation } from "@/hooks/useVinylAnimation";
export function Vinyl({ playing, rpm, album, coverUrl }: { playing: boolean; rpm: 33 | 45; album?: string; coverUrl?: string }) {
  const ref = useVinylAnimation(playing, rpm);
  return <div className="vinyl-perspective"><div className="vinyl">
    <div
      className={`vinyl-motion ${playing ? "vinyl--spinning" : ""}`}
      data-motion={playing ? "spinning" : "paused"}
      ref={ref}
    >
      <img className="vinyl-layer-image" src="/mizer-vinyl-fitted.png" alt="" draggable={false} />
      {coverUrl ? (
        <span className="vinyl-album-label">
          <img src={coverUrl} alt={`Capa do álbum ${album || "em reprodução"}`} draggable={false} />
          <i aria-hidden="true" />
        </span>
      ) : null}
    </div>
  </div></div>;
}
