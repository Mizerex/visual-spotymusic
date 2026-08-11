"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";

export function CassetteArtistLabel() {
  const { playback } = useSpotifyAuth();
  const [frame, setFrame] = useState<HTMLElement | null>(null);

  const artistName = useMemo(
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

  if (!frame || !artistName) return null;

  const artistFontSize =
    artistName.length > 30
      ? "clamp(7px, 2.4vw, 12px)"
      : artistName.length > 20
        ? "clamp(8px, 2.8vw, 14px)"
        : "clamp(10px, 3.5vw, 18px)";

  return createPortal(
    <div
      aria-label={`Artista: ${artistName}`}
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
      <small
        style={{
          fontSize: "clamp(4px, 1.2vw, 6px)",
          fontWeight: 800,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        ARTISTA:
      </small>
      <strong
        title={artistName}
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
        {artistName}
      </strong>
      <span
        style={{
          justifySelf: "end",
          fontSize: "clamp(4px, 1.2vw, 6px)",
          fontWeight: 800,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        LADO&nbsp; A
      </span>
    </div>,
    frame,
  );
}
