"use client";

import { useEffect, useRef, useState } from "react";
import { clearPendingSpotifyLogin, exchangeCallback } from "@/services/spotifyAuth";

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
      setMessage("A conexão foi cancelada. Volte ao início e tente novamente quando quiser.");
      return;
    }
    if (!code || !state) {
      setMessage("A resposta do Spotify está incompleta. Volte ao início e conecte novamente.");
      return;
    }

    exchangeCallback(code, state)
      .then(() => window.location.replace(new URL("/", window.location.origin).toString()))
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
