import { tokenManager } from "./tokenManager";

const AUTH_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const VERIFIER_KEY = "visual_spotymusic_pkce_verifier";
const STATE_KEY = "visual_spotymusic_oauth_state";
const PENDING_LOGIN_KEY = "visual_spotymusic_pending_spotify_login";
const PENDING_LOGIN_MAX_AGE = 15 * 60 * 1000;

const scopes = [
  "user-read-private", "user-read-email", "streaming", "user-read-playback-state",
  "user-modify-playback-state", "user-library-read", "user-library-modify",
  "playlist-read-private", "user-follow-read", "user-read-currently-playing",
];

type PendingSpotifyLogin = {
  verifier: string;
  state: string;
  redirectUri: string;
  createdAt: number;
};

let cachedClientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID?.trim() || "";

async function clientId() {
  if (cachedClientId) return cachedClientId;
  try {
    const response = await fetch("/spotify-config.json", { cache: "no-store" });
    if (response.ok) cachedClientId = ((await response.json()).clientId || "").trim();
  } catch {
    cachedClientId = "";
  }
  return cachedClientId;
}

export function redirectUri() {
  if (process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI) return process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
  return typeof window === "undefined" ? "" : `${window.location.origin}/callback`;
}

function browserStorages() {
  if (typeof window === "undefined") return [] as Storage[];
  const storages: Storage[] = [];
  try { storages.push(window.sessionStorage); } catch { /* Safari pode bloquear o armazenamento. */ }
  try { storages.push(window.localStorage); } catch { /* Safari pode bloquear o armazenamento. */ }
  return storages;
}

function savePendingLogin(login: PendingSpotifyLogin) {
  const serialized = JSON.stringify(login);
  let saved = false;

  for (const storage of browserStorages()) {
    try {
      storage.setItem(PENDING_LOGIN_KEY, serialized);
      storage.setItem(VERIFIER_KEY, login.verifier);
      storage.setItem(STATE_KEY, login.state);
      saved = true;
    } catch {
      /* Tenta o próximo armazenamento disponível. */
    }
  }

  return saved;
}

function readPendingLogin(): PendingSpotifyLogin | null {
  for (const storage of browserStorages()) {
    try {
      const serialized = storage.getItem(PENDING_LOGIN_KEY);
      if (serialized) {
        const pending = JSON.parse(serialized) as Partial<PendingSpotifyLogin>;
        const valid = typeof pending.verifier === "string"
          && typeof pending.state === "string"
          && typeof pending.redirectUri === "string"
          && typeof pending.createdAt === "number"
          && Date.now() - pending.createdAt <= PENDING_LOGIN_MAX_AGE;
        if (valid) return pending as PendingSpotifyLogin;
        storage.removeItem(PENDING_LOGIN_KEY);
      }

      const verifier = storage.getItem(VERIFIER_KEY);
      const state = storage.getItem(STATE_KEY);
      if (verifier && state) {
        return { verifier, state, redirectUri: redirectUri(), createdAt: Date.now() };
      }
    } catch {
      /* Tenta o próximo armazenamento disponível. */
    }
  }

  return null;
}

export function clearPendingSpotifyLogin() {
  for (const storage of browserStorages()) {
    try {
      storage.removeItem(PENDING_LOGIN_KEY);
      storage.removeItem(VERIFIER_KEY);
      storage.removeItem(STATE_KEY);
    } catch {
      /* O navegador pode limpar o armazenamento por conta própria. */
    }
  }
}

function randomString(length = 64) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"[byte % 66]).join("");
}

function base64Url(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export async function beginSpotifyLogin() {
  const spotifyClientId = await clientId();
  if (!spotifyClientId) throw new Error("O Client ID do Spotify ainda não foi configurado.");

  const callbackUri = redirectUri();
  if (!callbackUri) throw new Error("O endereço de retorno do Spotify não está disponível.");

  const verifier = randomString();
  const challenge = base64Url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  const state = randomString(24);
  const saved = savePendingLogin({ verifier, state, redirectUri: callbackUri, createdAt: Date.now() });
  if (!saved) throw new Error("O navegador bloqueou o armazenamento necessário para conectar ao Spotify. Permita cookies e dados do site e tente novamente.");

  const params = new URLSearchParams({
    client_id: spotifyClientId, response_type: "code", redirect_uri: callbackUri,
    code_challenge_method: "S256", code_challenge: challenge, state,
    scope: scopes.join(" "), show_dialog: "false",
  });
  window.location.assign(`${AUTH_URL}?${params}`);
}

export async function exchangeCallback(code: string, state: string) {
  const pending = readPendingLogin();
  if (!pending) throw new Error("A sessão de conexão expirou. Volte ao início e conecte ao Spotify novamente.");
  if (state !== pending.state) {
    clearPendingSpotifyLogin();
    throw new Error("A validação de segurança da conexão falhou. Tente conectar novamente.");
  }

  const spotifyClientId = await clientId();
  if (!spotifyClientId) throw new Error("O Client ID do Spotify não está disponível.");

  const body = new URLSearchParams({
    client_id: spotifyClientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: pending.redirectUri,
    code_verifier: pending.verifier,
  });
  const response = await fetch(TOKEN_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!response.ok) throw new Error("Não foi possível concluir a conexão com o Spotify. Volte ao início e tente novamente.");

  const data = await response.json();
  tokenManager.set({ accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt: Date.now() + data.expires_in * 1000 });
  clearPendingSpotifyLogin();
}

export async function refreshSpotifyToken() {
  const current = tokenManager.get();
  if (!current?.refreshToken) return null;
  const spotifyClientId = await clientId();
  if (!spotifyClientId) return null;
  const body = new URLSearchParams({ client_id: spotifyClientId, grant_type: "refresh_token", refresh_token: current.refreshToken });
  const response = await fetch(TOKEN_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!response.ok) { tokenManager.clear(); return null; }
  const data = await response.json();
  const next = { accessToken: data.access_token, refreshToken: data.refresh_token || current.refreshToken, expiresAt: Date.now() + data.expires_in * 1000 };
  tokenManager.set(next);
  return next;
}
