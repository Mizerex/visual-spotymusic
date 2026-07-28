import type { SpotifyPlayer } from "@/types/spotify";

export function loadSpotifySdk() {
  if (typeof window === "undefined" || window.Spotify) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    window.onSpotifyWebPlaybackSDKReady = () => resolve();
    const existing = document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]');
    if (existing) return;
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    script.onerror = () => reject(new Error("Não foi possível carregar o player do Spotify."));
    document.body.appendChild(script);
  });
}

export async function activatePlayer(player: SpotifyPlayer | null) {
  if (player) await player.activateElement();
}
