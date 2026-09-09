"use client";

import { useEffect, useState } from "react";
import { useJamendo } from "@/hooks/useJamendo";

const genres = [
  { id: "rock", label: "Rock" },
  { id: "pop", label: "Pop" },
  { id: "jazz", label: "Jazz" },
  { id: "electronic", label: "Eletrônica" },
  { id: "ambient", label: "Ambient" },
  { id: "classical", label: "Clássica" },
] as const;

export function RadioConsole() {
  const {
    ready,
    playback,
    tracks,
    loading,
    error,
    loadTag,
    playTrack,
    toggle,
    stop,
    previous,
    next,
  } = useJamendo();
  const [genre, setGenre] = useState<(typeof genres)[number]["id"]>("rock");

  useEffect(() => {
    if (ready) void loadTag(genre, 24);
  }, [genre, loadTag, ready]);

  return (
    <section className="library-console" aria-label="Rádio">
      <header className="library-console-heading">
        <div>
          <p className="eyebrow">RÁDIO</p>
          <h2>Rádio</h2>
          <p className="library-console-category">Acesso livre para visitantes</p>
        </div>
        <span>{tracks.length || "—"} faixas</span>
      </header>

      <div className="category-tabs" style={{ marginBottom: 14 }}>
        {genres.map(item => (
          <button
            key={item.id}
            type="button"
            className={genre === item.id ? "active" : ""}
            onClick={() => setGenre(item.id)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {playback.track && (
        <div className="library-console-detail-actions">
          <button type="button" className="library-console-back" onClick={() => void previous()}>← Anterior</button>
          <button type="button" className="library-console-play-all" onClick={() => void toggle()}>
            {playback.isPlaying ? "❚❚ Pausar" : "▶ Continuar"}
          </button>
          <button type="button" className="library-console-back" onClick={() => void stop()}>■ Parar</button>
          <button type="button" className="library-console-back" onClick={() => void next()}>Próxima →</button>
        </div>
      )}

      {playback.track && (
        <p style={{ margin: "8px 0 14px" }}>
          No ar: <strong>{playback.track.name}</strong> — {playback.track.artists.map(artist => artist.name).join(", ")}
        </p>
      )}

      {error && <p role="alert" style={{ margin: "10px 0" }}>{error}</p>}

      <div className="library-console-list">
        {loading ? (
          <div className="library-console-empty">
            <span>◌</span>
            <strong>Carregando rádio…</strong>
            <small>Buscando músicas para esta estação.</small>
          </div>
        ) : tracks.length ? tracks.map(track => (
          <button
            key={`jamendo-radio-${track.id}`}
            type="button"
            className={playback.track?.id === track.id ? "featured" : ""}
            onClick={() => void playTrack(track, tracks)}
          >
            <span className="library-console-cover">
              {track.image ? <img src={track.image} alt="" /> : <i aria-hidden="true">◉</i>}
            </span>
            <span>
              <strong>{track.name}</strong>
              <small>{track.artists.map(artist => artist.name).join(", ")}</small>
            </span>
            <b aria-hidden="true">{playback.track?.id === track.id && playback.isPlaying ? "❚❚" : "▶"}</b>
          </button>
        )) : (
          <div className="library-console-empty">
            <span>◉</span>
            <strong>Nenhuma faixa disponível</strong>
            <small>Tente outro estilo musical.</small>
          </div>
        )}
      </div>
    </section>
  );
}
