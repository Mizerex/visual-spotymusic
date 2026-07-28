import { refreshSpotifyToken } from "./spotifyAuth";
import { tokenManager } from "./tokenManager";

const BASE = "https://api.spotify.com/v1";

export async function spotifyApi<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  let tokens = tokenManager.get();
  if (!tokenManager.valid(tokens)) tokens = await refreshSpotifyToken();
  if (!tokens) throw new Error("Sua sessão expirou. Conecte-se novamente.");
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${tokens.accessToken}`, "Content-Type": "application/json", ...init.headers },
  });
  if (response.status === 401 && retry) {
    await refreshSpotifyToken();
    return spotifyApi<T>(path, init, false);
  }
  if (!response.ok) {
    let reason = "";
    try {
      const payload = await response.clone().json();
      reason = payload?.error?.message || payload?.message || "";
    } catch { /* A resposta pode não ser JSON. */ }
    const message = response.status === 403
      ? "O Spotify não autorizou esta busca para a conta conectada."
      : response.status === 404
        ? "Nenhum dispositivo de reprodução foi encontrado."
        : response.status === 429
          ? "O limite temporário de consultas do Spotify foi atingido. Aguarde um momento."
          : reason || "O Spotify não conseguiu concluir esta ação.";
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text.trim()) return undefined as T;
  return JSON.parse(text) as T;
}
