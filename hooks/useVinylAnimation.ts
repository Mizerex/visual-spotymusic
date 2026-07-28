"use client";
import { useEffect, useRef } from "react";
export function useVinylAnimation(playing: boolean, rpm: 33 | 45) {
  const ref = useRef<HTMLDivElement>(null);
  const rotation = useRef(0);
  useEffect(() => {
    if (ref.current) ref.current.style.transform = `rotate(${rotation.current}deg)`;
    if (!playing) return;
    let frame = 0, previous = performance.now();
    const animate = (now: number) => {
      rotation.current = (rotation.current + (now - previous) * rpm * 0.006) % 360;
      previous = now;
      if (ref.current) ref.current.style.transform = `rotate(${rotation.current}deg)`;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [playing, rpm]);
  return ref;
}
