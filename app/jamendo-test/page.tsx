"use client";

import { useEffect } from "react";
import { JamendoProvider } from "@/context/JamendoProvider";
import { useJamendo } from "@/hooks/useJamendo";

function JamendoTestContent() {
  const {
    ready,
    playback,
    tracks,
    loading,
    error,
    loadPopular,
    playTrack,
    toggle,
    stop,
    previous,
    next,
    setVolume,
  } = useJamendo();

  useEffect(() => {
    if (ready && tracks.length === 0 && !loading) void loadPopular(12);
  }, [loadPopular, loading, ready, tracks.length]);

  return (
    <main style={{ minHeight: "100vh", padding: 24, background: "#111", color: "#f4f4f4", fontFamily: "system-ui, sans-serif" }}>
      <h1>Visual SpotyMusic — Teste Jamendo</h1>
      <p>Rota isolada para validar catálogo e reprodução antes de integrar ao toca-discos principal.</p>

      {error && <p style={{ color: "#ff8a8a" }}>{error}</p>}
      {loading && <p>Carregando músicas do Jamendo...</p>}

      {playback.track && (
        <section style={{ margin: "24px 0", padding: 16, border: "1px solid #444", borderRadius: 12 }}>
          {playback.track.image && (
            <img src={playback.track.image} alt="" width={160} height={160} style={{ objectFit: "cover", borderRadius: 8 }} />
          )}
          <h2>{playback.track.name}</h2>
          <p>{playback.track.artists.map(artist => artist.name).join(", ")}</p>
          <p>{Math.floor(playback.position / 1000)}s / {Math.floor(playback.duration / 1000)}s</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button type="button" onClick={() => void previous()}>Anterior</button>
            <button type="button" onClick={() => void toggle()}>{playback.isPlaying ? "Pausar" : "Tocar"}</button>
            <button type="button" onClick={() => void stop()}>Stop</button>
            <button type="button" onClick={() => void next()}>Próxima</button>
            <button type="button" onClick={() => void setVolume(Math.max(0, playback.volume - 0.1))}>Volume -</button>
            <button type="button" onClick={() => void setVolume(Math.min(1, playback.volume + 0.1))}>Volume +</button>
          </div>
        </section>
      )}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
        {tracks.map(track => (
          <button
            type="button"
            key={`jamendo-${track.id}`}
            onClick={() => void playTrack(track)}
            style={{ textAlign: "left", padding: 12, border: "1px solid #333", borderRadius: 12, background: "#1b1b1b", color: "inherit", cursor: "pointer" }}
          >
            {track.image && <img src={track.image} alt="" width="100%" style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: 8 }} />}
            <strong style={{ display: "block", marginTop: 8 }}>{track.name}</strong>
            <span>{track.artists.map(artist => artist.name).join(", ")}</span>
          </button>
        ))}
      </section>
    </main>
  );
}

export default function JamendoTestPage() {
  return (
    <JamendoProvider>
      <JamendoTestContent />
    </JamendoProvider>
  );
}
