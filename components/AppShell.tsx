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

const interactiveTags = new Set(["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"]);

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
    setVolume,
  } = useSpotifyAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [libraryCategory, setLibraryCategory] = useState<LibraryCategory>("playlists");
  const [mainView, setMainView] = useState<MainView>("library");
  const lastAudibleVolume = useRef(levelToVolume(DEFAULT_RESTORE_LEVEL));

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
