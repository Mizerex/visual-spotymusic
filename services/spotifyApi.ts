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
    let spotifyMessage = "";
    try {
      const data = await response.clone().json();
      spotifyMessage = data?.error?.message || data?.error_description || "";
    } catch {
      /* A resposta pode não ter corpo JSON. */
    }

    const method = (init.method || "GET").toUpperCase();
    const isPlaybackAction = method !== "GET" && (
      path.startsWith("/me/player") ||
      path.includes("/play") ||
      path.includes("/pause") ||
      path.includes("/seek") ||
      path.includes("/next") ||
      path.includes("/previous")
    );

    let message = "O Spotify não conseguiu concluir esta ação.";
    if (response.status === 404) message = "Nenhum dispositivo de reprodução foi encontrado.";
    else if (response.status === 403 && isPlaybackAction) message = "A reprodução no navegador exige uma conta Spotify Premium.";
    else if (response.status === 403) message = spotifyMessage || "O Spotify não permitiu acessar este conteúdo da biblioteca.";
    else if (spotifyMessage) message = spotifyMessage;
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  const method = (init.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return undefined as T;
  const text = await response.text();
  if (!text.trim()) return undefined as T;
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("json")) return text as T;
  return JSON.parse(text) as T;
}
