"use client";

import { useEffect } from "react";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import type { LibraryCategory } from "@/types/spotify";

const signalBars = [5, 8, 11, 7, 13, 9, 6, 12, 8, 10, 6, 11];
const categoryLabels: Record<LibraryCategory, string> = {
  playlists: "Playlists",
  albums: "Álbuns",
  artists: "Artistas",
  tracks: "Músicas",
};

export function LibraryConsole({ category }: { category: LibraryCategory }) {
  const { library, loadLibrary, playItem, playback } = useSpotifyAuth();
  const items = library[category].slice(0, 6);

  useEffect(() => {
    void loadLibrary(category);
  }, [category, loadLibrary]);

  return (
    <section className="library-console" aria-label="Biblioteca visual">
      <header className="library-console-heading">
        <div>
          <p className="eyebrow">SUA COLEÇÃO</p>
          <h2>Biblioteca visual</h2>
          <p className="library-console-category">{categoryLabels[category]}</p>
        </div>
        <span>{library[category].length || "—"} itens</span>
      </header>

      <div className="library-console-list">
        {items.length ? items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={index === 0 ? "featured" : ""}
            onClick={() => void playItem(item)}
          >
            <span className="library-console-cover">
              {item.image ? <img src={item.image} alt="" /> : <i aria-hidden="true">♫</i>}
            </span>
            <span>
              <strong>{item.name}</strong>
              <small>{item.subtitle}</small>
            </span>
            <b aria-hidden="true">▶</b>
          </button>
        )) : (
          <div className="library-console-empty">
            <span>♫</span>
            <strong>Sua coleção aparecerá aqui</strong>
            <small>Escolha {categoryLabels[category]} na biblioteca para começar.</small>
          </div>
        )}
      </div>

      <div className={`visual-signal ${playback.isPlaying ? "active" : ""}`}>
        <div className="visual-signal-label">
          <span>VISUAL SIGNAL</span>
          <span>{playback.isPlaying ? "LIVE" : "STANDBY"}</span>
        </div>
        <div className="visual-signal-bars" aria-hidden="true">
          {signalBars.map((height, index) => (
            <i key={index} style={{ "--signal-height": height } as React.CSSProperties} />
          ))}
        </div>
      </div>
    </section>
  );
}
