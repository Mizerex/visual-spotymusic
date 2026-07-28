"use client";
import { useTonearmProgress } from "@/hooks/useTonearmProgress";
export function Tonearm({ position, duration, hasTrack }: { position: number; duration: number; hasTrack: boolean }) {
  const angle = useTonearmProgress(position, duration, hasTrack);
  return <div className="tonearm-assembly"><div className="tonearm-base"><i /></div><div className="tonearm" style={{ transform: `rotate(${angle}deg)` }}><div className="counterweight" /><div className="arm-tube" /><div className="headshell"><i /></div></div><div className="arm-rest" /></div>;
}
