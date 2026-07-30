"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { Search } from "./Search";
import { LibraryList } from "./LibraryList";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import type { LibraryCategory, LibraryItem } from "@/types/spotify";
import styles from "./Sidebar.module.css";

const categories = [
  { id: "playlists", label: "Playlists", icon: "playlist" },
  { id: "albums", label: "Álbuns", icon: "album" },
  { id: "artists", label: "Artistas", icon: "artist" },
  { id: "tracks", label: "Músicas", icon: "music" },
] as const;

export function Sidebar({
  open,
  onClose,
  activeCategory,
  onCategoryChange,
}: {
  open: boolean;
  onClose: () => void;
  activeCategory: LibraryCategory;
  onCategoryChange: (category: LibraryCategory) => void;
}) {
  const { loadDetails, search, playItem, playback, profile, logout, demo, playerReady } = useSpotifyAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Record<string, LibraryItem[]> | null>(null);
  const [detail, setDetail] = useState<{ item: LibraryItem; tracks: LibraryItem[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) search(query).then(setResults).catch(() => setResults(null));
      else setResults(null);
    }, 350);

    return () => clearTimeout(timer);
  }, [query, search]);

  const searchItems = results ? Object.values(results).flat() : null;

  const openItem = async (item: LibraryItem) => {
    if (item.kind === "track") {
      await playItem(item);
      return;
    }

    setDetailLoading(true);
    try {
      setDetail({ item, tracks: await loadDetails(item) });
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <aside className={`sidebar ${styles.shell} ${open ? "open" : ""}`} aria-label="Biblioteca do Spotify">
      <header className={`brand ${styles.brand}`}>
        <img className={styles.logo} src="/visual-spotymusic-logo.png" alt="Visual SpotyMusic" />
        <button className="close-sidebar" onClick={onClose} aria-label="Fechar biblioteca">
          <Icon name="close" />
        </button>
      </header>

      <nav aria-label="Navegação principal">
        <p className="nav-label">NAVEGAÇÃO</p>
        <button className="nav-item active" aria-current="page"><Icon name="home" /> Início</button>
        <button className="nav-item" title="Área em desenvolvimento"><Icon name="compass" /> Explorar</button>
        <button className="nav-item" title="Área em desenvolvimento"><Icon name="radio" /> Rádio</button>
      </nav>

      <Search value={query} onChange={value => { setQuery(value); if (value) setDetail(null); }} />

      {!query && (
        <>
          <p className="nav-label library-label">SUA BIBLIOTECA</p>
          <div className="category-tabs">
            {categories.map(category => (
              <button
                key={category.id}
                className={activeCategory === category.id ? "active" : ""}
                onClick={() => {
                  onCategoryChange(category.id);
                  setDetail(null);
                }}
                title={category.label}
                aria-label={category.label}
                aria-pressed={activeCategory === category.id}
              >
                <Icon name={category.icon} />
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {(query || detail) && <div className="sidebar-content">
        {detail ? (
          <div className="library-detail">
            <button className="detail-back" onClick={() => setDetail(null)}>← Voltar</button>
            <div className="detail-hero">
              {detail.item.image ? <img src={detail.item.image} alt="" /> : <span>♫</span>}
              <div>
                <small>{detail.item.kind.toUpperCase()}</small>
                <strong>{detail.item.name}</strong>
                <p>{detail.item.subtitle}</p>
              </div>
            </div>
            <button className="detail-play" onClick={() => playItem(detail.item)}>▶ Reproduzir</button>
            {detailLoading ? (
              <p className="detail-loading">Carregando faixas…</p>
            ) : (
              <LibraryList
                items={detail.tracks}
                selected={playback.track?.id}
                onPlay={playItem}
                emptyText="O Spotify não liberou a lista, mas Reproduzir ainda pode tocar a coleção."
              />
            )}
          </div>
        ) : (
          <LibraryList
            items={searchItems || []}
            selected={playback.track?.id}
            onPlay={item => { void openItem(item); }}
            emptyText="Nenhum resultado para esta busca."
          />
        )}
      </div>}

      <footer className={`profile ${styles.profile}`}>
        <span className="avatar">{profile?.display_name?.slice(0, 1).toUpperCase() || "V"}</span>
        <span>
          <strong>{profile?.display_name || "Visual Listener"}</strong>
          <small>{demo ? "Modo demonstração" : playerReady ? "Toca-discos online" : "Conectando ao Spotify"}</small>
        </span>
        <button onClick={logout} aria-label="Desconectar do Spotify" title="Sair">
          <Icon name="logout" />
        </button>
      </footer>
    </aside>
  );
}
