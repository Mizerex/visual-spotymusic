"use client";

import { useEffect, useRef, useState } from "react";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import { DEFAULT_RESTORE_LEVEL, MIN_AUDIBLE_VOLUME, levelToVolume, volumeToLevel } from "@/utils/volume";
import { LoginScreen } from "./LoginScreen";
import { Sidebar } from "./Sidebar";
import { Turntable } from "./Turntable";
import { NowPlaying } from "./NowPlaying";
import { AnalogPanel } from "./AnalogPanel";
import { ErrorToast } from "./ErrorToast";
import { Icon } from "./Icon";
import { LibraryConsole } from "./LibraryConsole";
import { DemoCompleteDialog } from "./DemoCompleteDialog";
import type { LibraryCategory } from "@/types/spotify";

export type MainView = "library" | "explore" | "radio";

type SupportedMediaAction =
  | "play"
  | "pause"
  | "stop"
  | "previoustrack"
  | "nexttrack"
  | "seekbackward"
  | "seekforward"
  | "seekto";

const interactiveTags = new Set(["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"]);
const mediaActions: SupportedMediaAction[] = [
  "play",
  "pause",
  "stop",
  "previoustrack",
  "nexttrack",
  "seekbackward",
  "seekforward",
  "seekto",
];

export function AppShell() {
  const {
    authenticated,
    demo,
    ready,
    playback,
    toggle,
    stop,
    previous,
    next,
    seek,
    setVolume,
  } = useSpotifyAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [libraryCategory, setLibraryCategory] = useState<LibraryCategory>("playlists");
  const [mainView, setMainView] = useState<MainView>("library");
  const lastAudibleVolume = useRef(levelToVolume(DEFAULT_RESTORE_LEVEL));
  const playbackRef = useRef(playback);

  useEffect(() => {
    playbackRef.current = playback;
  }, [playback]);

  useEffect(() => {
    if (playback.volume > MIN_AUDIBLE_VOLUME) lastAudibleVolume.current = playback.volume;
  }, [playback.volume]);

  useEffect(() => {
    if (demo) {
      setLibraryCategory("tracks");
      setMainView("library");
    }
  }, [demo]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || interactiveTags.has(target.tagName))) return;
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;

      const key = event.key.toLowerCase();
      const hasTrack = Boolean(playback.track);
      const run = (action: () => Promise<void>) => {
        event.preventDefault();
        void action();
      };

      if ((event.code === "Space" || key === "k") && hasTrack) {
        run(toggle);
        return;
      }
      if (key === "s" && hasTrack) {
        run(stop);
        return;
      }
      if ((event.code === "ArrowLeft" || key === "j") && hasTrack) {
        run(previous);
        return;
      }
      if ((event.code === "ArrowRight" || key === "l") && hasTrack) {
        run(next);
        return;
      }
      if (key === "m") {
        event.preventDefault();
        if (playback.volume > MIN_AUDIBLE_VOLUME) {
          lastAudibleVolume.current = playback.volume;
          void setVolume(0);
        } else {
          void setVolume(lastAudibleVolume.current);
        }
        return;
      }
      if (event.code === "Equal" || event.code === "NumpadAdd") {
        event.preventDefault();
        void setVolume(levelToVolume(Math.min(100, volumeToLevel(playback.volume) + 2)));
        return;
      }
      if (event.code === "Minus" || event.code === "NumpadSubtract") {
        event.preventDefault();
        void setVolume(levelToVolume(Math.max(0, volumeToLevel(playback.volume) - 2)));
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, playback.track, playback.volume, previous, setVolume, stop, toggle]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const register = (action: SupportedMediaAction, handler: ((details: any) => void) | null) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Alguns navegadores implementam apenas parte das ações multimídia.
      }
    };

    register("play", () => {
      const current = playbackRef.current;
      if (current.track && !current.isPlaying) void toggle();
    });
    register("pause", () => {
      const current = playbackRef.current;
      if (current.track && current.isPlaying) void toggle();
    });
    register("stop", () => {
      if (playbackRef.current.track) void stop();
    });
    register("previoustrack", () => {
      if (playbackRef.current.track) void previous();
    });
    register("nexttrack", () => {
      if (playbackRef.current.track) void next();
    });
    register("seekbackward", details => {
      const current = playbackRef.current;
      if (!current.track) return;
      const offset = Number(details?.seekOffset) || 10;
      void seek(Math.max(0, current.position - offset * 1000));
    });
    register("seekforward", details => {
      const current = playbackRef.current;
      if (!current.track) return;
      const offset = Number(details?.seekOffset) || 10;
      void seek(Math.min(current.duration || current.position, current.position + offset * 1000));
    });
    register("seekto", details => {
      const current = playbackRef.current;
      if (!current.track || !Number.isFinite(details?.seekTime)) return;
      void seek(Math.max(0, Math.min(current.duration, Number(details.seekTime) * 1000)));
    });

    return () => {
      mediaActions.forEach(action => register(action, null));
    };
  }, [next, previous, seek, stop, toggle]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const track = playback.track;
    if (!track) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
      return;
    }

    if ("MediaMetadata" in window) {
      const image = track.album.images?.[0]?.url;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name,
        artist: track.artists.map(artist => artist.name).join(", "),
        album: track.album.name,
        artwork: image ? [{ src: image }] : undefined,
      });
    }

    navigator.mediaSession.playbackState = playback.stopped
      ? "none"
      : playback.isPlaying
        ? "playing"
        : "paused";

    if (playback.duration > 0 && "setPositionState" in navigator.mediaSession) {
      try {
        navigator.mediaSession.setPositionState({
          duration: playback.duration / 1000,
          playbackRate: 1,
          position: Math.max(0, Math.min(playback.position, playback.duration - 1)) / 1000,
        });
      } catch {
        // O navegador pode rejeitar a posição durante a troca de faixa.
      }
    }
  }, [playback.duration, playback.isPlaying, playback.position, playback.stopped, playback.track]);

  if (!ready) return <main className="loading-screen"><div className="loading-record" /><p>Aquecendo as válvulas...</p></main>;
  if (!authenticated) return <LoginScreen />;

  return <div className="app-shell">
    <button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Abrir biblioteca"><Icon name="menu" /><span>VISUAL SPOTYMUSIC</span></button>
    <Sidebar
      open={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      activeCategory={libraryCategory}
      activeView={mainView}
      onViewChange={setMainView}
      onCategoryChange={category => {
        setLibraryCategory(category);
        setMainView("library");
      }}
    />
    {sidebarOpen && <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Fechar biblioteca" />}
    <main className="studio"><div className="top-grid"><LibraryConsole category={libraryCategory} mode={mainView} /><Turntable /><NowPlaying /></div><AnalogPanel /></main>
    <ErrorToast />
    <DemoCompleteDialog />
  </div>;
}
