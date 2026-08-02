"use client";

import { useEffect, useMemo, useState } from "react";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import type { LibraryCategory, LibraryItem } from "@/types/spotify";
import { levelToVolume, volumeToLevel } from "@/utils/volume";
import styles from "./mobile-concept.module.css";

const RETURN_PATH_KEY = "visual_spotymusic_post_auth_path";
type Drawer = "tracks" | "playlists" | "more" | "equalizer" | null;

function rememberMobileReturnPath() {
  for (const storage of [window.sessionStorage, window.localStorage]) {
    try { storage.setItem(RETURN_PATH_KEY, "/mobile-concept"); } catch { /* Safari pode bloquear um dos armazenamentos. */ }
  }
}

function formatTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function MobileCassettePlayer() {
  const {
    authenticated,
    demo,
    ready,
    playerReady,
    profile,
    playback,
    library,
    login,
    enterDemo,
    restartDemo,
    logout,
    loadLibrary,
    loadDetails,
    playItem,
    activateDevice,
    toggle,
    stop,
    previous,
    next,
    seek,
    setVolume,
    error,
    clearError,
    demoFinished,
  } = useSpotifyAuth();

  const [drawer, setDrawer] = useState<Drawer>(null);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [connecting, setConnecting] = useState(false);

  const track = playback.track;
  const cover = track?.album.images?.[0]?.url;
  const volumeLevel = volumeToLevel(playback.volume);
  const activeCategory: LibraryCategory | null = drawer === "tracks" || drawer === "playlists" ? drawer : null;
  const drawerItems = activeCategory ? library[activeCategory] : [];

  useEffect(() => {
    if (!authenticated || !activeCategory || library[activeCategory].length) return;
    let active = true;
    setLoadingLibrary(true);
    loadLibrary(activeCategory).finally(() => {
      if (active) setLoadingLibrary(false);
    });
    return () => { active = false; };
  }, [activeCategory, authenticated, library, loadLibrary]);

  const progressPercent = useMemo(() => {
    if (!playback.duration) return 0;
    return Math.max(0, Math.min(100, (playback.position / playback.duration) * 100));
  }, [playback.duration, playback.position]);

  const connect = async () => {
    if (connecting) return;
    setConnecting(true);
    setLoginMessage("");
    rememberMobileReturnPath();
    try {
      await login();
    } catch (reason) {
      setLoginMessage(reason instanceof Error ? reason.message : "Não foi possível conectar ao Spotify.");
      setConnecting(false);
    }
  };

  const openDrawer = (nextDrawer: Exclude<Drawer, null>) => {
    setDrawer(current => current === nextDrawer ? null : nextDrawer);
  };

  const selectItem = async (item: LibraryItem) => {
    if (item.kind === "track") {
      await playItem(item);
      setDrawer(null);
      return;
    }

    setLoadingLibrary(true);
    try {
      const tracks = await loadDetails(item);
      if (!tracks.length) return;
      await playItem(tracks[0], { uri: item.uri, tracks, index: 0 });
      setDrawer(null);
    } finally {
      setLoadingLibrary(false);
    }
  };

  if (!ready) {
    return <main className={styles.loadingScreen}><div className={styles.loadingRecord} /><p>Aquecendo o toca-fitas…</p></main>;
  }

  if (!authenticated) {
    return (
      <main className={styles.mobileLogin}>
        <section className={styles.loginPanel}>
          <img src="/visual-spotymusic-icon.png" width="112" height="112" alt="Visual SpotyMusic" />
          <p>EXPERIÊNCIA CASSETE HI-FI</p>
          <h1>Visual SpotyMusic Mobile</h1>
          <span>Conecte sua conta para usar sua biblioteca ou experimente a faixa de demonstração.</span>
          <button type="button" onClick={connect} disabled={connecting}>
            {connecting ? "Conectando…" : "Conectar ao Spotify"}
          </button>
          <button type="button" className={styles.demoButton} onClick={enterDemo} disabled={connecting}>
            Explorar em modo demonstração
          </button>
          {loginMessage && <small role="alert">{loginMessage}</small>}
        </section>
      </main>
    );
  }

  return (
    <main className={styles.previewPage}>
      <section className={`${styles.interfaceFrame} ${playback.isPlaying ? styles.playing : ""}`} aria-label="Interface mobile funcional do Visual SpotyMusic">
        <img
          className={styles.interfaceImage}
          src="/mobile-interface-current.png"
          alt="Interface mobile do Visual SpotyMusic"
          width="422"
          height="725"
          decoding="sync"
        />

        <button className={`${styles.hotspot} ${styles.menuHotspot}`} type="button" onClick={() => openDrawer("tracks")} aria-label="Abrir biblioteca" />
        <button className={`${styles.hotspot} ${styles.equalizerHotspot}`} type="button" onClick={() => openDrawer("equalizer")} aria-label="Abrir equalizador" />

        <section className={styles.nowOverlay} aria-label="Música atual">
          <div className={styles.coverSlot}>
            {cover ? <img src={cover} alt={`Capa de ${track?.album.name || "álbum"}`} /> : <span>♫</span>}
          </div>
          <div className={styles.trackText}>
            <small>{playback.isPlaying ? "NOW PLAYING" : playback.stopped ? "STOPPED" : "PAUSED"}</small>
            <strong>{track?.name || "Escolha uma música"}</strong>
            <b>{track?.artists.map(artist => artist.name).join(", ") || profile?.display_name || "Visual SpotyMusic"}</b>
            <span>{track?.album.name || (demo ? "Modo demonstração" : playerReady ? "Player pronto" : "Conectando o player")}</span>
          </div>
        </section>

        <input
          className={styles.progressRange}
          type="range"
          min="0"
          max={Math.max(1, playback.duration)}
          value={Math.min(playback.position, Math.max(1, playback.duration))}
          disabled={!track}
          onChange={event => void seek(Number(event.target.value))}
          aria-label="Posição da música"
        />
        <span className={styles.currentTime}>{formatTime(playback.position)}</span>
        <span className={styles.durationTime}>{formatTime(playback.duration)}</span>
        <i className={styles.progressFill} style={{ width: `${progressPercent * 0.73}%` }} aria-hidden="true" />

        <i className={styles.vuNeedle} aria-hidden="true" />

        <div className={styles.transportHotspots} aria-label="Controles de reprodução">
          <button type="button" onClick={() => void previous()} disabled={!track} aria-label="Faixa anterior" />
          <button type="button" onClick={() => { if (playback.isPlaying) void toggle(); }} disabled={!track || !playback.isPlaying} aria-label="Pausar" />
          <button type="button" onClick={() => { if (!playback.isPlaying) void toggle(); }} disabled={!track || playback.isPlaying} aria-label="Reproduzir" />
          <button type="button" onClick={() => void stop()} disabled={!track || playback.stopped} aria-label="Parar" />
          <button type="button" onClick={() => void next()} disabled={!track} aria-label="Próxima faixa" />
        </div>

        <input
          className={styles.volumeRange}
          type="range"
          min="0"
          max="100"
          value={volumeLevel}
          onChange={event => void setVolume(levelToVolume(Number(event.target.value)))}
          aria-label="Volume"
        />
        <i className={styles.volumeThumb} style={{ top: `${72.5 + (100 - volumeLevel) * 0.115}%` }} aria-hidden="true" />

        <nav className={styles.bottomHotspots} aria-label="Navegação mobile">
          <button type="button" onClick={() => openDrawer("tracks")} aria-label="Biblioteca" />
          <button type="button" onClick={() => setDrawer(null)} aria-label="Toca-fitas" />
          <button type="button" onClick={() => openDrawer("playlists")} aria-label="Playlists" />
          <button type="button" onClick={() => openDrawer("more")} aria-label="Mais opções" />
        </nav>

        {drawer && (
          <section className={styles.drawer} aria-label="Painel mobile">
            <header>
              <div>
                <small>VISUAL SPOTYMUSIC</small>
                <strong>{drawer === "tracks" ? "Biblioteca" : drawer === "playlists" ? "Playlists" : drawer === "equalizer" ? "Equalizador" : "Mais opções"}</strong>
              </div>
              <button type="button" onClick={() => setDrawer(null)} aria-label="Fechar painel">×</button>
            </header>

            {(drawer === "tracks" || drawer === "playlists") && (
              <div className={styles.drawerList}>
                {loadingLibrary ? <p>Carregando…</p> : drawerItems.length ? drawerItems.map(item => (
                  <button type="button" key={`${item.kind}-${item.id}`} onClick={() => void selectItem(item)}>
                    <span>{item.image ? <img src={item.image} alt="" /> : "♫"}</span>
                    <div><strong>{item.name}</strong><small>{item.subtitle}</small></div>
                    <b>›</b>
                  </button>
                )) : <p>Nenhum item disponível nesta categoria.</p>}
              </div>
            )}

            {drawer === "equalizer" && (
              <div className={styles.equalizerPanel}>
                <img src="/mobile-equalizer-official.png" alt="Equalizador visual do Visual SpotyMusic" />
                <p>O equalizador visual acompanha o estado de reprodução. Os ajustes de áudio serão ligados na próxima etapa.</p>
              </div>
            )}

            {drawer === "more" && (
              <div className={styles.morePanel}>
                <p><strong>{profile?.display_name || "Visitante"}</strong><span>{demo ? "Modo demonstração" : playerReady ? "Spotify conectado" : "Player iniciando"}</span></p>
                {!demo && <button type="button" onClick={() => void activateDevice()}>Ativar player neste aparelho</button>}
                {demoFinished && <button type="button" onClick={() => void restartDemo()}>Reiniciar demonstração</button>}
                <button type="button" onClick={logout}>Sair</button>
              </div>
            )}
          </section>
        )}

        {error && (
          <div className={styles.errorToast} role="alert">
            <span>{error}</span>
            <button type="button" onClick={clearError} aria-label="Fechar erro">×</button>
          </div>
        )}
      </section>
    </main>
  );
}
