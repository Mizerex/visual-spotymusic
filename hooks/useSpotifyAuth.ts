"use client";
import { useContext } from "react";
import { SpotifyContext } from "@/context/SpotifyProvider";
export function useSpotifyAuth() { const context = useContext(SpotifyContext); if (!context) throw new Error("SpotifyProvider ausente"); return context; }
