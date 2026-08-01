"use client";

import { useState } from "react";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";

export function DemoCompleteDialog() {
  const { demo, demoFinished, login, restartDemo } = useSpotifyAuth();
  const [busy, setBusy] = useState<"spotify" | "replay" | null>(null);
  const [message, setMessage] = useState("");

  if (!demo || !demoFinished) return null;

  const connect = async () => {
    setBusy("spotify");
    setMessage("");
    try {
      await login();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Não foi possível conectar ao Spotify.");
      setBusy(null);
    }
  };

  const replay = async () => {
    setBusy("replay");
    setMessage("");
    try {
      await restartDemo();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Não foi possível reiniciar a demonstração.");
      setBusy(null);
    }
  };

  return (
    <div className="demo-complete-backdrop">
      <section className="demo-complete-dialog" role="dialog" aria-modal="true" aria-labelledby="demo-complete-title">
        <img src="/visual-spotymusic-icon.png" alt="" aria-hidden="true" />
        <p className="eyebrow">EXPERIÊNCIA CONCLUÍDA</p>
        <h2 id="demo-complete-title">Gostou da experiência?</h2>
        <p>Veja suas músicas, álbuns e playlists ganharem vida no Visual SpotyMusic.</p>
        <div className="demo-complete-actions">
          <button type="button" className="demo-complete-primary" onClick={() => void connect()} disabled={busy !== null}>
            {busy === "spotify" ? "Conectando…" : "Conectar meu Spotify"}
          </button>
          <button type="button" className="demo-complete-secondary" onClick={() => void replay()} disabled={busy !== null}>
            {busy === "replay" ? "Preparando o disco…" : "Ouvir demonstração novamente"}
          </button>
        </div>
        {message && <small role="alert">{message}</small>}
      </section>
    </div>
  );
}
