"use client";
import { useEffect } from "react";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
export function ErrorToast() {
  const { error, clearError } = useSpotifyAuth();
  useEffect(() => { if (!error) return; const timer = setTimeout(clearError, 4200); return () => clearTimeout(timer); }, [error, clearError]);
  if (!error) return null;
  return <button className="error-toast" role="alert" onClick={clearError}><span>!</span>{error}<i>×</i></button>;
}
