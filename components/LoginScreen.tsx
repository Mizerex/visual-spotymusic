"use client";

import { useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import styles from "./LoginScreen.module.css";

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.58 14.42a.75.75 0 0 1-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 1 1-.33-1.46c4.58-1.04 8.51-.59 11.66 1.33.35.21.46.67.25 1.04Zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.23-1.98-8.15-2.55-11.96-1.39a.94.94 0 1 1-.55-1.8c4.36-1.33 9.78-.69 13.49 1.58.44.27.58.85.31 1.3Zm.13-3.4C14.31 7.45 7.91 7.24 4.22 8.35a1.13 1.13 0 1 1-.65-2.16c4.24-1.28 11.32-1.03 15.76 1.61a1.13 1.13 0 0 1-1.15 1.95Z" />
    </svg>
  );
}

export function LoginScreen() {
  const { login, enterDemo } = useSpotifyAuth();
  const [message, setMessage] = useState("");
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    if (connecting) return;

    setMessage("");
    setConnecting(true);

    try {
      await login();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível conectar ao Spotify.");
      setConnecting(false);
    }
  };

  return (
    <main className={styles.screen}>
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.layout}>
        <section className={styles.card} aria-labelledby="login-title">
          <div className={styles.deck} aria-hidden="true">
            <div className={styles.record}><i /></div>
            <div className={styles.arm} />
          </div>

          <p className={styles.eyebrow}>APRESENTAMOS</p>
          <h1 id="login-title" className={styles.title}><span>Visual</span> SpotyMusic</h1>
          <p className={styles.tagline}>Seu Spotify em uma experiência visual e analógica.</p>
          <p className={styles.copy}>
            Entre na sua biblioteca, escolha uma faixa e veja a música ganhar cor,
            movimento e textura em um toca-discos inspirado nos grandes sistemas hi-fi dos anos 70.
          </p>

          <div className={styles.actions}>
            <button
              className={styles.primary}
              type="button"
              onClick={connect}
              disabled={connecting}
              aria-busy={connecting}
            >
              {connecting ? <span className={styles.spinner} aria-hidden="true" /> : <SpotifyIcon />}
              {connecting ? "Conectando ao Spotify..." : "Conectar ao Spotify"}
            </button>

            <button
              className={styles.secondary}
              type="button"
              onClick={enterDemo}
              disabled={connecting}
            >
              Explorar em modo demonstração
            </button>
          </div>

          <ul className={styles.benefits} aria-label="Informações de segurança">
            <li><span className={styles.check} aria-hidden="true">✓</span>Conexão segura</li>
            <li><span className={styles.check} aria-hidden="true">✓</span>Seus dados permanecem no Spotify</li>
            <li><span className={styles.check} aria-hidden="true">✓</span>Nenhuma senha armazenada</li>
          </ul>

          {message && <p className={styles.error} role="alert">{message}</p>}

          <div className={styles.footer}>
            <span>Autenticação oficial do Spotify</span>
            <span aria-hidden="true">·</span>
            <a className={styles.privacy} href="/privacy">Privacidade</a>
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
