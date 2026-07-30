"use client";
import { useEffect, useRef } from "react";
export function VUMeter({ channel, playing }: { channel: "L" | "R"; playing: boolean }) {
  const needle = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let frame = 0;
    const animate = (now: number) => { const energy = playing ? .48 + Math.sin(now / (channel === "L" ? 123 : 147)) * .22 + Math.sin(now / 47) * .1 : .08; if (needle.current) needle.current.style.transform = `rotate(${-42 + Math.max(0, Math.min(1, energy)) * 84}deg)`; frame = requestAnimationFrame(animate); };
    frame = requestAnimationFrame(animate); return () => cancelAnimationFrame(frame);
  }, [channel, playing]);
  return <div className={`vu-meter vu-meter-${channel.toLowerCase()}`} aria-label={`VU Meter canal ${channel}`}><span className="vu-needle" ref={needle} /></div>;
}
