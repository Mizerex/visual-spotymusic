"use client";
import { useState } from "react";
import { AdSlot } from "./AdSlot";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";

export function LoginScreen() {
  const { login, authError } = useSpotifyAuth();
  const [message, setMessage] = useState("");
  const connect = () => login().catch(error => setMessage(error.message));
  return <main className="login-screen">
    <div className="login-glow" />
    <div className="login-layout">
      <section className="login-card">
        <img className="login-logo" src="/visual-spotymusic-logo.png" alt="Visual SpotyMusic" />
        <p className="tagline">Seu Spotify em uma experiência visual e analógica.</p>
        <p className="login-copy">Entre com a sua própria conta para carregar somente a sua biblioteca, os seus álbuns e as suas playlists. Sua reprodução não é compartilhada com outros visitantes.</p>
        <ul className="login-benefits" aria-label="Como funciona">
          <li><span aria-hidden="true">✓</span> Sua conta e sua biblioteca</li>
          <li><span aria-hidden="true">✓</span> Sessão independente neste dispositivo</li>
          <li><span aria-hidden="true">✓</span> Autorização feita diretamente pelo Spotify</li>
        </ul>
        <button className="spotify-button" onClick={connect}><span aria-hidden="true">●</span> Entrar com meu Spotify</button>
        {(message || authError) && <p className="login-error" role="alert">{message || authError}</p>}
        <small>A reprodução completa no navegador exige Spotify Premium.</small>
        <p className="login-security">Conexão segura via Spotify · O Visual SpotyMusic não recebe nem armazena sua senha.</p>
        <a className="privacy-link" href="/privacy">Privacidade</a>
      </section>

      <AdSlot
        className="login-ad login-ad--rectangle"
        format="rectangle"
        slotKey="loginRectangleSlot"
        title="Publicidade lateral da tela de login"
      />

      <AdSlot
        className="login-ad login-ad--banner"
        format="horizontal"
        slotKey="loginBannerSlot"
        title="Publicidade inferior da tela de login"
      />
    </div>
  </main>;
}
