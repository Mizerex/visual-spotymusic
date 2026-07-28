import { tokenManager } from "./tokenManager";

const AUTH_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const VERIFIER_KEY = "visual_spotymusic_pkce_verifier";
const STATE_KEY = "visual_spotymusic_oauth_state";

const scopes = [
  "user-read-private", "user-read-email", "streaming", "user-read-playback-state",
  "user-modify-playback-state", "user-library-read", "user-library-modify",
  "playlist-read-private", "user-follow-read", "user-read-currently-playing",
];

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
  const verifier = randomString();
  const challenge = base64Url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  const state = randomString(24);
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);
  const params = new URLSearchParams({
    client_id: spotifyClientId, response_type: "code", redirect_uri: redirectUri(),
    code_challenge_method: "S256", code_challenge: challenge, state,
    scope: scopes.join(" "), show_dialog: "false",
  });
  window.location.assign(`${AUTH_URL}?${params}`);
}

export async function exchangeCallback(code: string, state: string) {
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  if (!verifier || state !== sessionStorage.getItem(STATE_KEY)) throw new Error("A validação de segurança da conexão falhou.");
  const spotifyClientId = await clientId();
  if (!spotifyClientId) throw new Error("O Client ID do Spotify não está disponível.");
  const body = new URLSearchParams({ client_id: spotifyClientId, grant_type: "authorization_code", code, redirect_uri: redirectUri(), code_verifier: verifier });
  const response = await fetch(TOKEN_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!response.ok) throw new Error("Não foi possível concluir a conexão com o Spotify.");
  const data = await response.json();
  tokenManager.set({ accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt: Date.now() + data.expires_in * 1000 });
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
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
