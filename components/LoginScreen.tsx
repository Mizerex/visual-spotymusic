"use client";
import { useState } from "react";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";

export function LoginScreen() {
  const { login, enterDemo } = useSpotifyAuth();
  const [message, setMessage] = useState("");
  const connect = () => login().catch(error => setMessage(error.message));
  return <main className="login-screen">
    <div className="login-glow" />
    <section className="login-card">
      <div className="mini-deck" aria-hidden="true"><div className="mini-record"><i /></div><div className="mini-arm" /></div>
      <p className="eyebrow">APRESENTAMOS</p>
      <h1><span>Visual</span> SpotyMusic</h1>
      <p className="tagline">Seu Spotify em uma experiência visual e analógica.</p>
      <p className="login-copy">Entre na sua biblioteca, escolha uma faixa e veja a música ganhar cor, movimento e textura em um toca-discos inspirado nos grandes sistemas hi-fi dos anos 70.</p>
      <button className="spotify-button" onClick={connect}><span>●</span> Conectar ao Spotify</button>
      <button className="demo-button" onClick={enterDemo}>Explorar em modo demonstração</button>
      {message && <p className="login-error" role="alert">{message}</p>}
      <small>Conexão segura via Spotify · Nenhuma senha é armazenada</small>
    </section>
  </main>;
}
