"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import type { LibraryItem } from "@/types/spotify";

export function CassetteArtistLabel() {
  const { playback, library, loadDetails, playItem, clearError } = useSpotifyAuth();
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const [browserTracks, setBrowserTracks] = useState<LibraryItem[]>([]);
  const [browserName, setBrowserName] = useState("");
  const [browserType, setBrowserType] = useState("CONTEÚDO");
  const [browserLoading, setBrowserLoading] = useState(false);
  const [explicitStop, setExplicitStop] = useState(false);

  const currentArtistName = useMemo(
    () => playback.track?.artists.map(artist => artist.name).join(", ") || "",
    [playback.track],
  );

  useEffect(() => {
    const locateFrame = () => {
      const element = document.querySelector<HTMLElement>('section[aria-label="Interface mobile funcional do Visual SpotyMusic"]');
      setFrame(element);
    };
    locateFrame();
    const observer = new MutationObserver(locateFrame);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!frame) return;
    frame.dataset.transportStopped = explicitStop ? "true" : "false";
  }, [explicitStop, frame]);

  useEffect(() => {
    if (!playback.track) return;
    if (playback.isPlaying) setExplicitStop(false);
  }, [playback.isPlaying, playback.track?.id]);

  useEffect(() => {
    const handleTransportClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest<HTMLButtonElement>('button[aria-label="Parar"]')) return;
      setExplicitStop(true);
      clearError();
    };
    document.addEventListener("click", handleTransportClick, true);
    return () => document.removeEventListener("click", handleTransportClick, true);
  }, [clearError]);

  useEffect(() => {
    const handleLibraryClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest<HTMLButtonElement>('section[aria-label="Painel mobile"] button');
      if (!button) return;
      const panel = button.closest<HTMLElement>('section[aria-label="Painel mobile"]');
      const panelTitle = panel?.querySelector("header strong")?.textContent?.trim();
      if (!panelTitle || !["Artistas", "Playlists", "Álbuns"].includes(panelTitle)) return;
      const name = button.querySelector("div strong")?.textContent?.trim();
      if (!name) return;
      const collection = panelTitle === "Artistas" ? library.artists : panelTitle === "Playlists" ? library.playlists : library.albums;
      const item = collection.find(entry => entry.name === name);
      if (!item) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      clearError();
      setExplicitStop(false);
      setBrowserLoading(true);
      setBrowserName(item.name);
      setBrowserType(panelTitle === "Artistas" ? "ARTISTA" : panelTitle === "Playlists" ? "PLAYLIST" : "ÁLBUM");
      setBrowserTracks([]);
      void loadDetails(item).then(setBrowserTracks).finally(() => setBrowserLoading(false));
    };
    document.addEventListener("click", handleLibraryClick, true);
    return () => document.removeEventListener("click", handleLibraryClick, true);
  }, [clearError, library.albums, library.artists, library.playlists, loadDetails]);

  const artistFontSize = currentArtistName.length > 34 ? "clamp(7px, 2.2vw, 11px)" : currentArtistName.length > 24 ? "clamp(8px, 2.6vw, 13px)" : "clamp(10px, 3.1vw, 16px)";

  const label = frame && currentArtistName && !explicitStop ? createPortal(
    <div
      aria-label={`Artista na fita: ${currentArtistName}`}
      style={{ position: "absolute", zIndex: 9, left: "22.7%", top: "14.05%", width: "61.8%", height: "4.45%", display: "flex", alignItems: "center", boxSizing: "border-box", padding: "0 2%", overflow: "hidden", color: "#17120d", pointerEvents: "none", fontFamily: "Arial Narrow, Arial, Helvetica, sans-serif", lineHeight: 1 }}
    >
      <strong title={currentArtistName} style={{ width: "100%", overflow: "hidden", fontSize: artistFontSize, fontWeight: 900, letterSpacing: ".025em", textAlign: "left", textOverflow: "ellipsis", textTransform: "uppercase", whiteSpace: "nowrap" }}>
        {currentArtistName}
      </strong>
    </div>, frame
  ) : null;

  const browser = frame && (browserLoading || browserTracks.length > 0) ? createPortal(
    <section aria-label="Músicas selecionadas" style={{ position: "absolute", zIndex: 40, inset: "8% 5% 7%", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid rgba(255,157,22,.55)", borderRadius: "10px", background: "rgba(10,6,4,.97)", boxShadow: "0 12px 36px rgba(0,0,0,.72)", color: "#f2dfbf" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "14px 16px", borderBottom: "1px solid rgba(255,157,22,.22)" }}>
        <div style={{ minWidth: 0 }}><small style={{ display: "block", color: "#ff9d16", fontSize: "10px", letterSpacing: ".1em" }}>{browserType}</small><strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{browserName}</strong></div>
        <button type="button" onClick={() => { setBrowserTracks([]); setBrowserName(""); setBrowserLoading(false); }} aria-label="Fechar lista de músicas" style={{ border: 0, background: "transparent", color: "#f2dfbf", fontSize: "28px", lineHeight: 1, cursor: "pointer" }}>×</button>
      </header>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        {browserLoading ? <p style={{ padding: "12px" }}>Carregando músicas…</p> : browserTracks.length ? browserTracks.map((item, index) => (
          <button key={`${item.id}-${index}`} type="button" onClick={() => { clearError(); setExplicitStop(false); void playItem(item, { uri: `local:selection:${browserName}`, tracks: browserTracks, index, mode: "local", label: browserName }); setBrowserTracks([]); setBrowserName(""); }} style={{ width: "100%", display: "grid", gridTemplateColumns: "42px minmax(0,1fr) 20px", alignItems: "center", gap: "10px", padding: "9px 8px", border: 0, borderBottom: "1px solid rgba(255,255,255,.07)", background: "transparent", color: "inherit", textAlign: "left", cursor: "pointer" }}>
            <span style={{ width: "38px", height: "38px", display: "grid", placeItems: "center", overflow: "hidden", borderRadius: "4px", background: "#24160e" }}>{item.image ? <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "♫"}</span>
            <span style={{ minWidth: 0 }}><strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "13px" }}>{item.name}</strong><small style={{ color: "#bca88c" }}>{item.subtitle}</small></span><b style={{ color: "#ff9d16" }}>›</b>
          </button>
        )) : <p style={{ padding: "12px" }}>Nenhuma música encontrada.</p>}
      </div>
    </section>, frame
  ) : null;

  return <><style jsx global>{`
    [class*="cassetteArtwork"] { display: none !important; }
    [data-transport-stopped="true"] [class*="coverSlot"], [data-transport-stopped="true"] [class*="trackText"], [data-transport-stopped="true"] [class*="progressRange"], [data-transport-stopped="true"] [class*="currentTime"], [data-transport-stopped="true"] [class*="durationTime"], [data-transport-stopped="true"] [class*="progressTrack"], [data-transport-stopped="true"] [class*="progressFill"] { display: none !important; }
    [data-transport-stopped="true"] [class*="nowOverlay"] { min-height: 0 !important; }

    [class*="volumeControl"] {
      right: 13.7% !important;
      top: 72.6% !important;
      width: 10.4% !important;
      height: 17.4% !important;
    }
    [class*="volumeRange"] { left: 8% !important; width: 84% !important; height: 78% !important; }
    [class*="volumeRange"]::-webkit-slider-thumb { width: 54% !important; height: clamp(15px, 3.8vw, 21px) !important; }
    [class*="volumeRange"]::-moz-range-thumb { width: 54% !important; height: clamp(15px, 3.8vw, 21px) !important; }
  `}</style>{label}{browser}</>;
}
