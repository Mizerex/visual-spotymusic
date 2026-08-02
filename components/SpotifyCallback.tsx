"use client";

import { useEffect, useRef, useState } from "react";
import { clearPendingSpotifyLogin, exchangeCallback } from "@/services/spotifyAuth";

const RETURN_PATH_KEY = "visual_spotymusic_post_auth_path";

function consumeReturnPath() {
  let selected = "/";
  for (const storageName of ["sessionStorage", "localStorage"] as const) {
    try {
      const storage = window[storageName];
      const value = storage.getItem(RETURN_PATH_KEY);
      if (value?.startsWith("/") && !value.startsWith("//")) selected = value;
      storage.removeItem(RETURN_PATH_KEY);
    } catch {
      /* O Safari pode ter limpado ou bloqueado um dos armazenamentos. */
    }
  }
  return selected;
}

function clearReturnPath() {
  for (const storageName of ["sessionStorage", "localStorage"] as const) {
    try { window[storageName].removeItem(RETURN_PATH_KEY); } catch { /* Sem ação necessária. */ }
  }
}

export function SpotifyCallback() {
  const [message, setMessage] = useState("Conectando ao Spotify...");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const denied = params.get("error");

    if (denied) {
      clearPendingSpotifyLogin();
      clearReturnPath();
      setMessage("A conexão foi cancelada. Volte ao início e tente novamente quando quiser.");
      return;
    }
    if (!code || !state) {
      setMessage("A resposta do Spotify está incompleta. Volte ao início e conecte novamente.");
      return;
    }

    exchangeCallback(code, state)
      .then(() => {
        const target = consumeReturnPath();
        window.location.replace(new URL(target, window.location.origin).toString());
      })
      .catch(error => setMessage(error instanceof Error ? error.message : "Não foi possível concluir a conexão com o Spotify."));
  }, []);

  return (
    <main className="callback-screen">
      <div className="loading-record" />
      <img
        className="callback-logo"
        src="/visual-spotymusic-platter-logo.png"
        alt="Visual SpotyMusic"
        width="1536"
        height="1024"
      />
      <p>{message}</p>
      <a href="/">Voltar ao início</a>
    </main>
  );
}
