"use client";

import { useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import styles from "./LoginScreen.module.css";

export function LoginScreen() {
  const { login, enterDemo } = useSpotifyAuth();
  const [message, setMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async () => {
    setMessage("");
    setIsConnecting(true);

    try {
      await login();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível conectar ao Spotify.");
      setIsConnecting(false);
    }
  };

  return (
    <main className={styles.screen}>
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.layout}>
        <section className={styles.card} aria-labelledby="login-title">
          <div className={styles.brandArea}>
            <div className="mini-deck" aria-hidden="true">
              <div className="mini-record"><i /></div>
              <div className="mini-arm" />
            </div>
            <p className="eyebrow">APRESENTAMOS</p>
            <h1 id="login-title"><span>Visual</span> SpotyMusic</h1>
          </div>

          <p className={styles.tagline}>Seu Spotify em uma experiência visual e analógica.</p>
          <p className={styles.copy}>
            Entre na sua biblioteca, escolha uma faixa e veja a música ganhar cor, movimento e textura em um toca-discos inspirado nos grandes sistemas hi-fi dos anos 70.
          </p>

          <ul className={styles.features} aria-label="Principais recursos">
            <li><b aria-hidden="true">◉</b><span>Biblioteca e playlists</span></li>
            <li><b aria-hidden="true">◫</b><span>Capas no centro do vinil</span></li>
            <li><b aria-hidden="true">⌁</b><span>Controles com estética Hi-Fi</span></li>
          </ul>

          <button className={styles.primary} onClick={connect} disabled={isConnecting}>
            <svg className={styles.spotifyIcon} viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="11" fill="currentColor" />
              <path d="M6.7 9.1c3.6-1.1 7.8-.8 10.9.8M7.4 12.2c3-.8 6.6-.6 9.3.7M8.1 15.1c2.5-.6 5.3-.4 7.5.6" fill="none" stroke="#140f0b" strokeWidth="1.55" strokeLinecap="round" />
            </svg>
            {isConnecting ? "Conectando ao Spotify…" : "Conectar ao Spotify"}
          </button>

          <button className={styles.secondary} onClick={enterDemo}>Explorar em modo demonstração</button>

          {message && <p className={styles.error} role="alert">{message}</p>}

          <div className={styles.privacy}>
            <span>Conexão segura via Spotify · Nenhuma senha é armazenada</span>
            <a href="/privacy">Privacidade</a>
          </div>
        </section>

        <AdSlot
          className={styles.rectangle}
          format="rectangle"
          slot={process.env.NEXT_PUBLIC_ADSENSE_LOGIN_RECTANGLE_SLOT}
          title="Publicidade lateral da tela de login"
        />

        <AdSlot
          className={styles.banner}
          format="horizontal"
          slot={process.env.NEXT_PUBLIC_ADSENSE_LOGIN_BANNER_SLOT}
          title="Publicidade inferior da tela de login"
        />
      </div>
    </main>
  );
}
