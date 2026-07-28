"use client";
const format = (ms: number) => `${Math.floor(ms / 60000)}:${Math.floor(ms / 1000 % 60).toString().padStart(2, "0")}`;
export function ProgressBar({ position, duration, onChange }: { position: number; duration: number; onChange: (value: number) => void }) {
  return <div className="progress-wrap"><input aria-label="Progresso da música" type="range" min="0" max={duration || 1} value={Math.min(position, duration || 1)} onChange={e => onChange(Number(e.target.value))} style={{ "--progress": `${duration ? position / duration * 100 : 0}%` } as React.CSSProperties} /><div><span>{format(position)}</span><span>{format(duration)}</span></div></div>;
}
