"use client";
import { useState } from "react";

type KnobProps = {
  label: string;
  initial?: number;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  onChange?: (value: number) => void;
};

export function Knob({ label, initial = 50, value: controlledValue, min = 0, max = 100, step = 1, suffix = "", onChange }: KnobProps) {
  const [internalValue, setInternalValue] = useState(initial);
  const value = controlledValue ?? internalValue;
  const update = (next: number) => {
    const normalized = Math.max(min, Math.min(max, Math.round(next / step) * step));
    if (controlledValue === undefined) setInternalValue(normalized);
    onChange?.(normalized);
  };
  const click = (event: React.MouseEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const upperHalf = event.clientY < bounds.top + bounds.height / 2;
    update(value + (upperHalf ? step : -step));
  };
  const degrees = -135 + (value - min) / (max - min) * 270;
  return <div className="knob-control"><button className="knob" onClick={click} onKeyDown={e => { if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); update(value + step); } if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); update(value - step); } }} aria-label={`${label}: ${value}${suffix}. Clique na metade superior para aumentar ou na inferior para diminuir.`} title="Parte superior: aumentar · Parte inferior: diminuir" style={{ "--knob-angle": `${degrees}deg` } as React.CSSProperties}><i /><span className="knob-up" aria-hidden="true">+</span><span className="knob-down" aria-hidden="true">−</span></button><strong>{label}</strong><small>{value}{suffix}</small></div>;
}
