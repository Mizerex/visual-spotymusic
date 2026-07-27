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
  if (response.status === 204) return undefined as T;
  if (!response.ok) {
    const message = response.status === 403 ? "Este recurso exige uma conta Spotify Premium." : response.status === 404 ? "Nenhum dispositivo de reprodução foi encontrado." : "O Spotify não conseguiu concluir esta ação.";
    throw new Error(message);
  }
  return response.json();
}
