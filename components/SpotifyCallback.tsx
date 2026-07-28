"use client";
import { useEffect, useState } from "react";
import { exchangeCallback } from "@/services/spotifyAuth";
export function SpotifyCallback() {
  const [message, setMessage] = useState("Conectando ao Spotify...");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code"), state = params.get("state"), denied = params.get("error");
    if (denied) { setMessage("Acesso cancelado. Você pode fechar esta tela e tentar novamente."); return; }
    if (!code || !state) { setMessage("A resposta do Spotify está incompleta."); return; }
    exchangeCallback(code, state).then(() => window.location.replace("/")).catch(error => setMessage(error.message));
  }, []);
  return <main className="callback-screen"><div className="loading-record" /><h1>Visual SpotyMusic</h1><p>{message}</p><a href="/">Voltar ao início</a></main>;
}
