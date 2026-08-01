import type { SpotifyPlayer } from "@/types/spotify";

let sdkPromise: Promise<void> | null = null;

export function loadSpotifySdk() {
  if (typeof window === "undefined" || window.Spotify) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<void>((resolve, reject) => {
    let settled = false;
    const previousReady = window.onSpotifyWebPlaybackSDKReady;
    const source = "https://sdk.scdn.co/spotify-player.js";
    let script = document.querySelector(`script[src="${source}"]`) as HTMLScriptElement | null;

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      if (error) {
        sdkPromise = null;
        reject(error);
      } else {
        resolve();
      }
    };

    window.onSpotifyWebPlaybackSDKReady = () => {
      try {
        previousReady?.();
      } finally {
        finish();
      }
    };

    const onError = () => finish(new Error("Não foi possível carregar o player do Spotify."));
    const onLoad = () => {
      if (window.Spotify) finish();
    };

    if (!script) {
      script = document.createElement("script");
      script.src = source;
      script.async = true;
      (document.head || document.body).appendChild(script);
    }

    script.addEventListener("error", onError, { once: true });
    script.addEventListener("load", onLoad, { once: true });

    const timeoutId = window.setTimeout(() => {
      if (window.Spotify) finish();
      else finish(new Error("O player do Spotify demorou demais para iniciar. Recarregue a página e tente novamente."));
    }, 15000);
  });

  return sdkPromise;
}

export async function activatePlayer(player: SpotifyPlayer | null) {
  if (player) await player.activateElement();
}
