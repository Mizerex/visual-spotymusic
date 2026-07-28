"use client";
import { useRef, useState } from "react";
export function Knob({ label, initial = 50, min = 0, max = 100, suffix = "" }: { label: string; initial?: number; min?: number; max?: number; suffix?: string }) {
  const [value, setValue] = useState(initial);
  const origin = useRef({ y: 0, value: initial });
  const update = (next: number) => setValue(Math.max(min, Math.min(max, Math.round(next))));
  const pointerDown = (event: React.PointerEvent) => { origin.current = { y: event.clientY, value }; event.currentTarget.setPointerCapture(event.pointerId); };
  const pointerMove = (event: React.PointerEvent) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) update(origin.current.value + (origin.current.y - event.clientY) * (max - min) / 120); };
  const degrees = -135 + (value - min) / (max - min) * 270;
  return <div className="knob-control"><button className="knob" onPointerDown={pointerDown} onPointerMove={pointerMove} onKeyDown={e => { if (e.key === "ArrowUp" || e.key === "ArrowRight") update(value + 1); if (e.key === "ArrowDown" || e.key === "ArrowLeft") update(value - 1); }} aria-label={`${label}: ${value}${suffix}`} style={{ "--knob-angle": `${degrees}deg` } as React.CSSProperties}><i /></button><strong>{label}</strong><small>{value}{suffix}</small></div>;
}
