"use client";
import { useVinylAnimation } from "@/hooks/useVinylAnimation";
export function Vinyl({ playing, rpm }: { playing: boolean; rpm: 33 | 45 }) {
  const ref = useVinylAnimation(playing, rpm);
  return <div className="vinyl-perspective"><div className="vinyl" ref={ref}><div className="vinyl-shine" /><div className="record-label"><span>VISUAL</span><i /><small>SIDE A</small></div><b className="spindle-hole" /></div></div>;
}
