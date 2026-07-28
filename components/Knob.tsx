"use client";
import { useRef, useState } from "react";

type KnobProps = {
  label: string;
  initial?: number;
  min?: number;
  max?: number;
  suffix?: string;
  value?: number;
  onChange?: (value: number) => void;
};

export function Knob({ label, initial = 50, min = 0, max = 100, suffix = "", value: controlledValue, onChange }: KnobProps) {
  const [internalValue, setInternalValue] = useState(initial);
  const value = controlledValue ?? internalValue;
  const origin = useRef({ x: 0, y: 0, value: initial, moved: false });
  const step = Math.max(1, Math.round((max - min) / 20));
  const update = (next: number) => {
    const safeValue = Math.max(min, Math.min(max, Math.round(next)));
    if (controlledValue === undefined) setInternalValue(safeValue);
    onChange?.(safeValue);
  };
  const pointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    origin.current = { x: event.clientX, y: event.clientY, value, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const deltaX = event.clientX - origin.current.x;
    const deltaY = origin.current.y - event.clientY;
    if (Math.hypot(deltaX, deltaY) > 4) origin.current.moved = true;
    update(origin.current.value + (deltaX + deltaY) * (max - min) / 150);
  };
  const pointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!origin.current.moved) update(value >= max ? min : value + step);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };
  const degrees = -135 + (value - min) / (max - min) * 270;
  return <div className="knob-control"><button className="knob" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={() => { origin.current.moved = true; }} onDoubleClick={() => update(initial)} onKeyDown={e => { if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); update(value + step); } if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); update(value - step); } if (e.key === "Home") update(min); if (e.key === "End") update(max); }} aria-label={`${label}: ${value}${suffix}`} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={`${value}${suffix}`} role="slider" style={{ "--knob-angle": `${degrees}deg` } as React.CSSProperties}><i /></button><strong>{label}</strong><small>{value}{suffix}</small></div>;
}
