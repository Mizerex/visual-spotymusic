"use client";

import { useEffect, useState } from "react";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import type { LibraryItem } from "@/types/spotify";

const publicDiscovery: LibraryItem[] = [
  ["Top Brasil", "O que está em alta"],
  ["Sertanejo", "Descubra artistas"],
  ["Rock Brasil", "Clássicos e novidades"],
  ["Pop Brasil", "Sucessos brasileiros"],
  ["MPB", "Vozes do Brasil"],
  ["Viral Brasil", "Músicas em destaque"],
].map(([name, subtitle], index) => ({
  id: `public-${index}`,
  uri: "",
  name,
  subtitle,
  kind: "playlist" as const,
  externalUrl: `https://open.spotify.com/search/${encodeURIComponent(name)}`,
}));

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
  const { library, loadLibrary, playItem, search, profile, demo, playback } = useSpotifyAuth();
  const [loading, setLoading] = useState(true);
  const [discover, setDiscover] = useState<LibraryItem[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      loadLibrary("albums"),
      loadLibrary("playlists"),
      demo ? Promise.resolve(null) : search("música brasileira").then(result => {
        if (active) setDiscover(result.artists.slice(0, 6));
      }).catch(() => null),
    ])
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [demo, loadLibrary, search]);

  const premium = demo || profile?.product === "premium";
  const openDiscovery = (item: LibraryItem) => {
    if (item.externalUrl) {
      window.open(item.externalUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (premium) {
      void playItem(item);
      return;
    }
    window.open(`https://open.spotify.com/${item.kind}/${item.id}`, "_blank", "noopener,noreferrer");
  };

  return <aside className="library-showcase" aria-label="Destaques da sua biblioteca">
    <div className="showcase-title">
      <span>SUA COLEÇÃO</span>
      <strong>Biblioteca visual</strong>
    </div>
    <Shelf title="Álbuns" items={library.albums} loading={loading} onPlay={item => { void playItem(item); }} />
    <Shelf title="Playlists" items={library.playlists} loading={loading} onPlay={item => { void playItem(item); }} />
    {(!premium || (!library.albums.length && !library.playlists.length)) &&
      <Shelf title="Descubra no Spotify" items={discover.length ? discover : publicDiscovery} loading={false} onPlay={openDiscovery} />}
    <section className={`led-equalizer ${playback.isPlaying ? "is-playing" : ""}`} aria-label={playback.isPlaying ? "Equalizador visual animado" : "Equalizador visual em espera"}>
      <div className="led-equalizer-head">
        <span>VISUAL SIGNAL</span>
        <i>{playback.isPlaying ? "LIVE" : "STANDBY"}</i>
      </div>
      <div className="led-bars" aria-hidden="true">
        {[8,5,7,9,6,5,8,7,6,4,7,5].map((height, index) =>
          <span
            className="led-column"
            key={index}
            style={{
              "--led-height": height,
              "--led-delay": `${-(index * 0.09)}s`,
              "--led-speed": `${0.58 + (index % 5) * 0.11}s`,
            } as React.CSSProperties}
          >
            {Array.from({ length: 9 }, (_, led) => <i key={led} />)}
          </span>
        )}
      </div>
    </section>
  </aside>;
}
