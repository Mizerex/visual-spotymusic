"use client";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { Search } from "./Search";
import { LibraryList } from "./LibraryList";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import type { LibraryItem } from "@/types/spotify";

const categories = [
  { id: "playlists", label: "Playlists", icon: "playlist" }, { id: "albums", label: "Álbuns", icon: "album" },
  { id: "artists", label: "Artistas", icon: "artist" }, { id: "tracks", label: "Músicas", icon: "music" },
] as const;

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { library, loadLibrary, search, playItem, playback, profile, logout } = useSpotifyAuth();
  const [active, setActive] = useState<(typeof categories)[number]["id"]>("playlists");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Record<string, LibraryItem[]> | null>(null);
  useEffect(() => { loadLibrary(active); }, [active, loadLibrary]);
  useEffect(() => { const timer = setTimeout(() => { if (query.trim()) search(query).then(setResults).catch(() => setResults(null)); else setResults(null); }, 350); return () => clearTimeout(timer); }, [query, search]);
  const searchItems = results ? Object.values(results).flat() : null;
  return <aside className={`sidebar ${open ? "open" : ""}`}>
    <header className="brand"><div className="brand-mark"><i /></div><div><strong>VISUAL</strong><span>SPOTYMUSIC</span></div><button className="close-sidebar" onClick={onClose} aria-label="Fechar biblioteca"><Icon name="close" /></button></header>
    <nav aria-label="Navegação principal">
      <p className="nav-label">NAVEGAÇÃO</p>
      <button className="nav-item active"><Icon name="home" /> Início</button>
      <button className="nav-item"><Icon name="compass" /> Explorar</button>
      <button className="nav-item"><Icon name="radio" /> Rádio</button>
    </nav>
    <Search value={query} onChange={setQuery} />
    {!query && <><p className="nav-label library-label">SUA BIBLIOTECA</p><div className="category-tabs">{categories.map(category => <button key={category.id} className={active === category.id ? "active" : ""} onClick={() => setActive(category.id)} title={category.label}><Icon name={category.icon} /><span>{category.label}</span></button>)}</div></>}
    <div className="sidebar-content"><LibraryList items={searchItems || library[active]} selected={playback.track?.id} onPlay={item => { playItem(item); if (window.innerWidth < 760) onClose(); }} emptyText={query ? "Nenhum resultado para esta busca." : "Sua biblioteca aparecerá aqui."} /></div>
    <footer className="profile"><span className="avatar">{profile?.display_name?.slice(0, 1).toUpperCase() || "V"}</span><span><strong>{profile?.display_name || "Visual Listener"}</strong><small>Spotify conectado</small></span><button onClick={logout} aria-label="Desconectar do Spotify"><Icon name="logout" /></button></footer>
  </aside>;
}
