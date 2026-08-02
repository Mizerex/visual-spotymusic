import type { SpotifyTokens } from "@/types/spotify";

const KEY = "visual_spotymusic_tokens";

function browserStorages() {
  if (typeof window === "undefined") return [] as Storage[];
  const storages: Storage[] = [];
  try { storages.push(window.localStorage); } catch { /* Safari pode bloquear o armazenamento persistente. */ }
  try { storages.push(window.sessionStorage); } catch { /* Usa apenas os armazenamentos disponíveis. */ }
  return storages;
}

export const tokenManager = {
  get(): SpotifyTokens | null {
    for (const storage of browserStorages()) {
      try {
        const value = storage.getItem(KEY);
        if (value) return JSON.parse(value) as SpotifyTokens;
      } catch {
        /* Tenta o próximo armazenamento disponível. */
      }
    }
    return null;
  },
  set(tokens: SpotifyTokens) {
    const serialized = JSON.stringify(tokens);
    let saved = false;
    for (const storage of browserStorages()) {
      try {
        storage.setItem(KEY, serialized);
        saved = true;
      } catch {
        /* Tenta o próximo armazenamento disponível. */
      }
    }
    if (!saved) throw new Error("O navegador bloqueou o armazenamento da sessão do Spotify.");
  },
  clear() {
    for (const storage of browserStorages()) {
      try { storage.removeItem(KEY); } catch { /* O navegador pode já ter limpado a sessão. */ }
    }
  },
  valid(tokens: SpotifyTokens | null) {
    return Boolean(tokens?.accessToken && tokens.expiresAt > Date.now() + 30_000);
  },
};
