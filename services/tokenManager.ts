import type { SpotifyTokens } from "@/types/spotify";

const KEY = "visual_spotymusic_tokens";

export const tokenManager = {
  get(): SpotifyTokens | null {
    if (typeof window === "undefined") return null;
    try {
      const value = localStorage.getItem(KEY);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },
  set(tokens: SpotifyTokens) {
    localStorage.setItem(KEY, JSON.stringify(tokens));
  },
  clear() {
    localStorage.removeItem(KEY);
  },
  valid(tokens: SpotifyTokens | null) {
    return Boolean(tokens?.accessToken && tokens.expiresAt > Date.now() + 30_000);
  },
};
