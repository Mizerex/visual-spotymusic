"use client";

import { useEffect, useState } from "react";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import type { LibraryItem } from "@/types/spotify";
import { LibraryAdvertising } from "./LibraryAdvertising";

function Shelf({
  title,
  items,
  loading,
  onPlay,
}: {
  title: string;
  items: LibraryItem[];
  loading: boolean;
  onPlay: (item: LibraryItem) => void;
}) {
  return <section className="showcase-shelf" aria-label={title}>
    <div className="showcase-heading">
      <h2>{title}</h2>
      <span>{items.length ? `${items.length} salvos` : ""}</span>
    </div>
    {loading ? <div className="showcase-loading" aria-label={`Carregando ${title.toLowerCase()}`}>
      <i /><i /><i />
    </div> : items.length ? <div className="showcase-row">
      {items.slice(0, 6).map(item => <button
        key={`${item.kind}-${item.id}`}
        className="showcase-card"
        onClick={() => onPlay(item)}
        title={`Reproduzir ${item.name}`}
      >
        <span className="showcase-cover">
          {item.image ? <img src={item.image} alt="" /> : <span>{item.name.slice(0, 1).toUpperCase()}</span>}
          <i aria-hidden="true">▶</i>
        </span>
        <strong>{item.name}</strong>
        <small>{item.subtitle}</small>
      </button>)}
    </div> : <p className="showcase-empty">Nenhum item salvo.</p>}
  </section>;
}

export function LibraryShowcase() {
  const { library, loadLibrary, playItem } = useSpotifyAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([loadLibrary("albums"), loadLibrary("playlists")])
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadLibrary]);

  return <aside className="library-showcase" aria-label="Destaques da sua biblioteca">
    <div className="showcase-title">
      <span>SUA COLEÇÃO</span>
      <strong>Biblioteca visual</strong>
    </div>
    <Shelf title="Álbuns" items={library.albums} loading={loading} onPlay={item => { void playItem(item); }} />
    <Shelf title="Playlists" items={library.playlists} loading={loading} onPlay={item => { void playItem(item); }} />
    <LibraryAdvertising />
  </aside>;
}
