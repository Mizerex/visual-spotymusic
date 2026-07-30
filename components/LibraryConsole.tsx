"use client";

import { useEffect, useState } from "react";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import type { LibraryCategory, LibraryItem } from "@/types/spotify";
import type { MainView } from "./AppShell";

const signalBars = [5, 8, 11, 7, 13, 9, 6, 12, 8, 10, 6, 11];
const categoryLabels: Record<LibraryCategory, string> = {
  playlists: "Playlists",
  albums: "Álbuns",
  artists: "Artistas",
  tracks: "Músicas",
};

export function LibraryConsole({ category, mode }: { category: LibraryCategory; mode: MainView }) {
  const { library, loadLibrary, loadDetails, search, playItem, playback } = useSpotifyAuth();
  const [detail, setDetail] = useState<{ item: LibraryItem; tracks: LibraryItem[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [exploreQuery, setExploreQuery] = useState("");
  const [exploreItems, setExploreItems] = useState<LibraryItem[]>([]);
  const displayedCategory: LibraryCategory = mode === "radio" ? "artists" : category;
  const rootItems = mode === "explore" ? exploreItems : library[displayedCategory];
  const items = detail?.tracks || rootItems;
  const panelTitle = mode === "explore" ? "Explorar" : mode === "radio" ? "Rádio" : "Biblioteca visual";
  const heading = detail
    ? mode === "radio" ? `Rádio de ${detail.item.name}` : detail.item.name
    : mode === "explore" ? "Buscar no Spotify"
      : mode === "radio" ? "Rádios dos seus artistas"
        : categoryLabels[category];

  useEffect(() => {
    let active = true;
    setDetail(null);

    if (mode === "explore" || library[displayedCategory].length) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    loadLibrary(displayedCategory).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [displayedCategory, loadLibrary, mode]);

  useEffect(() => {
    if (mode !== "explore") return;
    if (!exploreQuery.trim()) {
      setExploreItems([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    const timer = setTimeout(() => {
      search(exploreQuery)
        .then(result => {
          if (active) setExploreItems(Object.values(result).flat());
        })
        .catch(() => {
          if (active) setExploreItems([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [exploreQuery, mode, search]);

  const openItem = async (item: LibraryItem) => {
    if (item.kind === "track") {
      await playItem(item);
      return;
    }

    setLoading(true);
    try {
      const tracks = await loadDetails(item);
      setDetail({ item, tracks });
    } finally {
      setLoading(false);
    }
  };

  const emptyTitle = mode === "explore" && !exploreQuery
    ? "Pesquise no Spotify"
    : detail ? "Nenhuma música disponível" : "Sua coleção aparecerá aqui";

  const emptyCopy = mode === "explore" && !exploreQuery
    ? "Digite acima para encontrar músicas, artistas, álbuns e playlists."
    : detail
      ? "Este item não possui músicas disponíveis."
      : mode === "radio"
        ? "Siga artistas no Spotify para criar suas estações."
        : `Escolha ${categoryLabels[category]} na biblioteca para começar.`;

  return (
    <section className="library-console" aria-label={panelTitle}>
      <header className="library-console-heading">
        <div>
          <p className="eyebrow">{mode === "explore" ? "DESCOBRIR" : mode === "radio" ? "ESTAÇÕES DOS ARTISTAS" : "SUA COLEÇÃO"}</p>
          <h2>{panelTitle}</h2>
          <p className="library-console-category">{heading}</p>
        </div>
        <span>{items.length || "—"} itens</span>
      </header>

      {mode === "explore" && !detail && (
        <label className="library-console-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={exploreQuery}
            onChange={event => setExploreQuery(event.target.value)}
            placeholder="Buscar música, artista, álbum ou playlist"
            aria-label="Explorar no Spotify"
          />
        </label>
      )}

      {detail && (
        <div className="library-console-detail-actions">
          <button type="button" className="library-console-back" onClick={() => setDetail(null)}>← Voltar</button>
          <button type="button" className="library-console-play-all" onClick={() => void playItem(detail.item)}>
            ▶ {mode === "radio" ? "Iniciar rádio" : "Reproduzir tudo"}
          </button>
        </div>
      )}

      <div className="library-console-list">
        {loading ? (
          <div className="library-console-empty">
            <span>◌</span>
            <strong>Carregando…</strong>
            <small>Aguarde enquanto o Spotify prepara todos os itens.</small>
          </div>
        ) : items.length ? items.map((item, index) => (
          <button
            key={`${item.kind}-${item.id}-${index}`}
            type="button"
            className={playback.track?.id === item.id ? "featured" : ""}
            onClick={() => void openItem(item)}
          >
            <span className="library-console-cover">
              {item.image ? <img src={item.image} alt="" /> : <i aria-hidden="true">{mode === "radio" ? "◉" : "♫"}</i>}
            </span>
            <span>
              <strong>{mode === "radio" && !detail ? `Rádio de ${item.name}` : item.name}</strong>
              <small>{mode === "radio" && !detail ? "Estação baseada neste artista" : item.subtitle}</small>
            </span>
            <b aria-hidden="true">{item.kind === "track" ? "▶" : "›"}</b>
          </button>
        )) : (
          <div className="library-console-empty">
            <span>{mode === "radio" ? "◉" : "♫"}</span>
            <strong>{emptyTitle}</strong>
            <small>{emptyCopy}</small>
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
