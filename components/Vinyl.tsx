"use client";
import { useVinylAnimation } from "@/hooks/useVinylAnimation";
export function Vinyl({ playing, rpm, image, album }: { playing: boolean; rpm: 33 | 45; image?: string; album?: string }) {
  const ref = useVinylAnimation(playing, rpm);
  return <div className="vinyl-perspective"><div className="vinyl" ref={ref}><div className="vinyl-shine" /><div className="record-grooves" />
    <div className={`record-label ${image ? "has-cover" : ""}`}>{image ? <img src={image} alt="" /> : <><span>VISUAL</span><i /><small>{album || "SIDE A"}</small></>}</div><b className="spindle-hole" />
  </div></div>;
}
