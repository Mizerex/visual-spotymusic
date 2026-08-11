"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import type { LibraryItem } from "@/types/spotify";

export function CassetteArtistLabel() {
  const { playback, library, loadDetails, playItem } = useSpotifyAuth();
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const [artistTracks, setArtistTracks] = useState<LibraryItem[]>([]);
  const [artistName, setArtistName] = useState("");
  const [artistLoading, setArtistLoading] = useState(false);

  const currentArtistName = useMemo(
    () => playback.track?.artists.map(artist => artist.name).join(", ") || "",
    [playback.track],
  );

  useEffect(() => {
    const locateFrame = () => {
      const element = document.querySelector<HTMLElement>(
        'section[aria-label="Interface mobile funcional do Visual SpotyMusic"]',
      );
      setFrame(element);
    };

    locateFrame();
    const observer = new MutationObserver(locateFrame);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!frame) return;
    frame.dataset.transportStopped = playback.stopped ? "true" : "false";
  }, [frame, playback.stopped]);

  useEffect(() => {
    const handleArtistClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest<HTMLButtonElement>('section[aria-label="Painel mobile"] button');
      if (!button) return;

      const panel = button.closest<HTMLElement>('section[aria-label="Painel mobile"]');
      const panelTitle = panel?.querySelector("header strong")?.textContent?.trim();
      if (panelTitle !== "Artistas") return;

      const name = button.querySelector("div strong")?.textContent?.trim();
      if (!name) return;
      const artist = library.artists.find(item => item.name === name);
      if (!artist) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      setArtistLoading(true);
      setArtistName(artist.name);
      void loadDetails(artist)
        .then(tracks => setArtistTracks(tracks))
        .finally(() => setArtistLoading(false));
    };

    document.addEventListener("click", handleArtistClick, true);
    return () => document.removeEventListener("click", handleArtistClick, true);
  }, [library.artists, loadDetails]);

  const artistFontSize =
    currentArtistName.length > 30
      ? "clamp(7px, 2.4vw, 12px)"
      : currentArtistName.length > 20
        ? "clamp(8px, 2.8vw, 14px)"
        : "clamp(10px, 3.5vw, 18px)";

  const label = frame && currentArtistName && !playback.stopped
    ? createPortal(
        <div
          aria-label={`Artista: ${currentArtistName}`}
          style={{
            position: "absolute",
            zIndex: 6,
            left: "14.2%",
            top: "16.45%",
            width: "73.5%",
            height: "5.75%",
            display: "grid",
            gridTemplateColumns: "18% minmax(0, 1fr) 18%",
            alignItems: "center",
            boxSizing: "border-box",
            padding: "0 2.3%",
            overflow: "hidden",
            border: "1px solid rgba(84, 55, 28, .45)",
            borderRadius: "2px",
            background: "linear-gradient(180deg, #f1e1bd 0%, #e8d3a7 100%)",
            boxShadow: "inset 0 0 5px rgba(35, 21, 11, .28)",
            color: "#201710",
            pointerEvents: "none",
            fontFamily: "Arial Narrow, Arial, Helvetica, sans-serif",
            lineHeight: 1,
          }}
        >
          <small style={{ fontSize: "clamp(4px, 1.2vw, 6px)", fontWeight: 800, textTransform: "uppercase", whiteSpace: "nowrap" }}>
            ARTISTA:
          </small>
          <strong
            title={currentArtistName}
            style={{
              minWidth: 0,
              overflow: "hidden",
              padding: "0 3%",
              fontSize: artistFontSize,
              fontWeight: 900,
              letterSpacing: ".015em",
              textAlign: "left",
              textOverflow: "ellipsis",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {currentArtistName}
          </strong>
          <span style={{ justifySelf: "end", fontSize: "clamp(4px, 1.2vw, 6px)", fontWeight: 800, textTransform: "uppercase", whiteSpace: "nowrap" }}>
            LADO&nbsp; A
          </span>
        </div>,
        frame,
      )
    : null;

  const artistBrowser = frame && (artistLoading || artistTracks.length > 0)
    ? createPortal(
        <section
          aria-label="Músicas do artista"
          style={{
            position: "absolute",
            zIndex: 40,
            inset: "8% 5% 7%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid rgba(255,157,22,.55)",
            borderRadius: "10px",
            background: "rgba(10,6,4,.97)",
            boxShadow: "0 12px 36px rgba(0,0,0,.72)",
            color: "#f2dfbf",
          }}
        >
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "14px 16px", borderBottom: "1px solid rgba(255,157,22,.22)" }}>
            <div style={{ minWidth: 0 }}>
              <small style={{ display: "block", color: "#ff9d16", fontSize: "10px", letterSpacing: ".1em" }}>ARTISTA</small>
              <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{artistName}</strong>
            </div>
            <button
              type="button"
              onClick={() => { setArtistTracks([]); setArtistName(""); setArtistLoading(false); }}
              aria-label="Fechar músicas do artista"
              style={{ border: 0, background: "transparent", color: "#f2dfbf", fontSize: "28px", lineHeight: 1, cursor: "pointer" }}
            >
              ×
            </button>
          </header>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {artistLoading ? (
              <p style={{ padding: "12px" }}>Carregando músicas…</p>
            ) : artistTracks.length ? artistTracks.map((item, index) => (
              <button
                key={`${item.id}-${index}`}
                type="button"
                onClick={() => {
                  void playItem(item, {
                    uri: `local:artist:${item.track?.artists?.[0]?.id || artistName}`,
                    tracks: artistTracks,
                    index,
                    mode: "local",
                    label: `Músicas de ${artistName}`,
                  });
                  setArtistTracks([]);
                  setArtistName("");
                }}
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "42px minmax(0,1fr) 20px",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 8px",
                  border: 0,
                  borderBottom: "1px solid rgba(255,255,255,.07)",
                  background: "transparent",
                  color: "inherit",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <span style={{ width: "38px", height: "38px", display: "grid", placeItems: "center", overflow: "hidden", borderRadius: "4px", background: "#24160e" }}>
                  {item.image ? <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "♫"}
                </span>
                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "13px" }}>{item.name}</strong>
                  <small style={{ color: "#bca88c" }}>{item.subtitle}</small>
                </span>
                <b style={{ color: "#ff9d16" }}>›</b>
              </button>
            )) : (
              <p style={{ padding: "12px" }}>Nenhuma música encontrada para este artista.</p>
            )}
          </div>
        </section>,
        frame,
      )
    : null;

  return (
    <>
      <style jsx global>{`
        [class*="cassetteArtwork"] { display: none !important; }
        [data-transport-stopped="true"] [class*="trackText"] b { visibility: hidden !important; }
        [class*="volumeRange"]::-webkit-slider-thumb {
          width: 62% !important;
          height: clamp(18px, 4.7vw, 26px) !important;
        }
        [class*="volumeRange"]::-moz-range-thumb {
          width: 62% !important;
          height: clamp(18px, 4.7vw, 26px) !important;
        }
      `}</style>
      {label}
      {artistBrowser}
    </>
  );
}
