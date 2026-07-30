"use client";
import { useEffect, useState } from "react";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import { LoginScreen } from "./LoginScreen";
import { Sidebar } from "./Sidebar";
import { Turntable } from "./Turntable";
import { NowPlaying } from "./NowPlaying";
import { AnalogPanel } from "./AnalogPanel";
import { ErrorToast } from "./ErrorToast";
import { Icon } from "./Icon";
import { LibraryConsole } from "./LibraryConsole";
import type { LibraryCategory } from "@/types/spotify";

export type MainView = "library" | "explore" | "radio";

export function AppShell() {
  const { authenticated, ready, toggle } = useSpotifyAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [libraryCategory, setLibraryCategory] = useState<LibraryCategory>("playlists");
  const [mainView, setMainView] = useState<MainView>("library");
  useEffect(() => { const handler = (event: KeyboardEvent) => { if (event.code === "Space" && !["INPUT", "BUTTON"].includes((event.target as HTMLElement).tagName)) { event.preventDefault(); toggle(); } }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, [toggle]);
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
  </div>;
}
