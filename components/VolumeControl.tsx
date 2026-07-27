"use client";
export function VolumeControl({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <div className="volume-control"><button aria-label="Silenciar" onClick={() => onChange(value ? 0 : .7)}>{value ? "◖))" : "◖×"}</button><input aria-label="Volume" type="range" min="0" max="1" step="0.01" value={value} onChange={e => onChange(Number(e.target.value))} style={{ "--progress": `${value * 100}%` } as React.CSSProperties} /></div>;
}
