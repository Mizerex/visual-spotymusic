"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import type { LibraryCategory, LibraryItem } from "@/types/spotify";
import { levelToVolume, volumeToLevel } from "@/utils/volume";
import styles from "./mobile-concept.module.css";

const RETURN_PATH_KEY = "visual_spotymusic_post_auth_path";
type Drawer = LibraryCategory | "radio" | "more" | "equalizer" | null;
type TransportFlash = "previous" | "next" | null;

function rememberMobileReturnPath() {
  for (const storageName of ["sessionStorage", "localStorage"] as const) {
    try {
      window[storageName].setItem(RETURN_PATH_KEY, "/mobile-concept");
    } catch {
      /* O Safari pode bloquear ou indisponibilizar um dos armazenamentos. */
    }
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
    playbackSource,
    library,
    login,
    enterDemo,
    restartDemo,
    logout,
    loadLibrary,
    loadDetails,
    search,
    playItem,
    playArtistMix,
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
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [radioQuery, setRadioQuery] = useState("");
  const [radioResults, setRadioResults] = useState<LibraryItem[]>([]);
  const [radioSearching, setRadioSearching] = useState(false);
  const [transportFlash, setTransportFlash] = useState<TransportFlash>(null);
  const leftReelRef = useRef<HTMLElement | null>(null);
  const rightReelRef = useRef<HTMLElement | null>(null);
  const equalizerBarsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const reelAnglesRef = useRef<[number, number]>([0, 0]);
  const reelBoostRef = useRef({ until: 0, direction: 1 });
  const transportFlashTimerRef = useRef<number | null>(null);
  const visualStateRef = useRef({ position: 0, duration: 0, volume: 0 });

  const track = playback.track;
  const cover = track?.album.images?.[0]?.url;
  const volumeLevel = volumeToLevel(playback.volume);
  const activeCategory: LibraryCategory | null = drawer === "radio" ? "artists" : drawer === "tracks" || drawer === "playlists" || drawer === "albums" || drawer === "artists" ? drawer : null;
  const drawerItems = drawer === "radio" && radioQuery.trim() ? radioResults : activeCategory ? library[activeCategory] : [];
  const tapeProgress = playback.duration ? Math.max(0, Math.min(1, playback.position / playback.duration)) : 0;
  const playbackEnded = Boolean(track && !playback.isPlaying && playback.duration > 0 && playback.position >= playback.duration - 250);
  const transportStopped = playback.stopped || playbackEnded;
  const showingSelector = !track || selectorOpen;
  visualStateRef.current = { position: playback.position, duration: playback.duration, volume: playback.volume };

  useEffect(() => {
    if (!authenticated || !activeCategory || library[activeCategory].length) return;
    let active = true;
    setLoadingLibrary(true);
    loadLibrary(activeCategory).finally(() => {
      if (active) setLoadingLibrary(false);
    });
    return () => { active = false; };
  }, [activeCategory, authenticated, library, loadLibrary]);

  useEffect(() => {
    if (drawer !== "radio" || !radioQuery.trim()) {
      setRadioResults([]);
      setRadioSearching(false);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      setRadioSearching(true);
      search(radioQuery).then(results => {
        if (active) setRadioResults(results.artists);
      }).finally(() => {
        if (active) setRadioSearching(false);
      });
    }, 320);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [drawer, radioQuery, search]);

  const progressPercent = useMemo(() => {
    if (!playback.duration) return 0;
    return Math.max(0, Math.min(100, (playback.position / playback.duration) * 100));
  }, [playback.duration, playback.position]);

  useEffect(() => {
    reelAnglesRef.current = [0, 0];
    for (const reel of [leftReelRef.current, rightReelRef.current]) {
      reel?.getAnimations().forEach(animation => animation.cancel());
      if (reel) reel.style.transform = "translate(-50%, -50%) rotate(0deg)";
    }
  }, [track?.id]);

  useEffect(() => {
    const bars = equalizerBarsRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const restingLevel = playback.isPlaying && reducedMotion ? 18 : 5;
    bars.forEach((bar, index) => bar?.style.setProperty("--bar-level", `${restingLevel + (index % 3) * 2}%`));
    if (!playback.isPlaying || reducedMotion) return;

    let frame = 0;
    let previousTime = performance.now();
    let equalizerTime = 0;
    const tick = (now: number) => {
      const elapsed = Math.min(48, now - previousTime) / 1000;
      previousTime = now;
      const { position, duration, volume } = visualStateRef.current;
      const progress = duration ? Math.max(0, Math.min(1, position / duration)) : 0;
      const boosted = now < reelBoostRef.current.until;
      const direction = boosted ? reelBoostRef.current.direction : 1;
      const boost = boosted ? 4.2 : 1;
      const leftSpeed = (72 + progress * 158) * direction * boost;
      const rightSpeed = (230 - progress * 158) * direction * boost;
      reelAnglesRef.current[0] += leftSpeed * elapsed;
      reelAnglesRef.current[1] += rightSpeed * elapsed;
      if (leftReelRef.current) leftReelRef.current.style.transform = `translate(-50%, -50%) rotate(${reelAnglesRef.current[0]}deg)`;
      if (rightReelRef.current) rightReelRef.current.style.transform = `translate(-50%, -50%) rotate(${reelAnglesRef.current[1]}deg)`;

      if (now - equalizerTime >= 80) {
        equalizerTime = now;
        const seconds = now / 1000 + progress * 2.4;
        const amplitude = .2 + Math.max(0, Math.min(1, volume)) * .78;
        bars.forEach((bar, index) => {
          const frequency = index < 3 ? .72 + index * .08 : index < 6 ? 1.08 + (index - 3) * .16 : 1.62 + (index - 6) * .23;
          const primary = (Math.sin(seconds * frequency * Math.PI * 2 + index * 1.31) + 1) / 2;
          const secondary = (Math.sin(seconds * frequency * .47 * Math.PI * 2 + index * .73) + 1) / 2;
          const level = Math.min(96, 7 + amplitude * (25 + primary * 47 + secondary * 17));
          bar?.style.setProperty("--bar-level", `${level}%`);
        });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playback.isPlaying, track?.id]);

  useEffect(() => () => {
    if (transportFlashTimerRef.current !== null) {
      window.clearTimeout(transportFlashTimerRef.current);
    }
    for (const reel of [leftReelRef.current, rightReelRef.current]) {
      reel?.getAnimations().forEach(animation => animation.cancel());
    }
  }, []);

  const flashTransportButton = useCallback((control: Exclude<TransportFlash, null>) => {
    if (transportFlashTimerRef.current !== null) {
      window.clearTimeout(transportFlashTimerRef.current);
    }
    setTransportFlash(control);
    transportFlashTimerRef.current = window.setTimeout(() => {
      setTransportFlash(null);
      transportFlashTimerRef.current = null;
    }, 260);
  }, []);

  const triggerReelBurst = useCallback((direction: -1 | 1) => {
    reelBoostRef.current = { until: performance.now() + 360, direction };
    if (playback.isPlaying || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    [leftReelRef.current, rightReelRef.current].forEach((reel, index) => {
      if (!reel) return;
      const start = reelAnglesRef.current[index];
      const finish = start + direction * 230;
      const animation = reel.animate([
        { transform: `translate(-50%, -50%) rotate(${start}deg)` },
        { transform: `translate(-50%, -50%) rotate(${finish}deg)` },
      ], { duration: 320, easing: "cubic-bezier(.2,.75,.25,1)" });
      animation.finished.then(() => {
        reelAnglesRef.current[index] = finish;
        reel.style.transform = `translate(-50%, -50%) rotate(${finish}deg)`;
      }).catch(() => undefined);
    });
  }, [playback.isPlaying]);

  const handlePrevious = () => {
    if (!track) return;
    flashTransportButton("previous");
    triggerReelBurst(-1);
    void previous();
  };

  const handleNext = () => {
    if (!track) return;
    flashTransportButton("next");
    triggerReelBurst(1);
    void next();
  };

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

  const openSource = (category: Exclude<LibraryCategory, "tracks">) => {
    setDrawer(category);
  };

  const selectItem = async (item: LibraryItem) => {
    if (drawer === "radio" && item.kind === "artist") {
      setLoadingLibrary(true);
      try {
        const started = await playArtistMix(item);
        if (!started) return;
        setSelectorOpen(false);
        setDrawer(null);
        setRadioQuery("");
      } finally {
        setLoadingLibrary(false);
      }
      return;
    }

    if (item.kind === "track") {
      await playItem(item);
      setSelectorOpen(false);
      setDrawer(null);
      return;
    }

    setLoadingLibrary(true);
    try {
      const tracks = await loadDetails(item);
      if (!tracks.length) return;
      await playItem(tracks[0], {
        uri: item.kind === "artist" ? `local:artist:${item.id}` : item.uri,
        tracks,
        index: 0,
        mode: item.kind === "artist" ? "local" : "context",
        label: item.kind === "artist" ? `Músicas de ${item.name}` : item.name,
      });
      setSelectorOpen(false);
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

        <i
          ref={leftReelRef}
          className={`${styles.cassetteReel} ${styles.leftReel}`}
          style={{ width: `${11.7 - tapeProgress * 2.4}%` }}
          aria-hidden="true"
        />
        <i
          ref={rightReelRef}
          className={`${styles.cassetteReel} ${styles.rightReel}`}
          style={{ width: `${9.3 + tapeProgress * 2.4}%` }}
          aria-hidden="true"
        />

        <button className={`${styles.hotspot} ${styles.menuHotspot}`} type="button" onClick={() => openDrawer("tracks")} aria-label="Abrir biblioteca" />
        <button className={`${styles.hotspot} ${styles.equalizerHotspot}`} type="button" onClick={() => openDrawer("equalizer")} aria-label="Abrir equalizador" />

        <section className={`${styles.nowOverlay} ${showingSelector ? styles.selectorOverlay : ""}`} aria-label={showingSelector ? "Selecionar conteúdo" : "Música atual"}>
          {showingSelector ? (
            <>
              <small className={styles.selectorLabel}>{track ? "TROCAR CONTEÚDO" : "ESCOLHA UMA FONTE"}</small>
              <div className={styles.sourceGrid}>
                <button type="button" onClick={() => openSource("albums")}><b>▣</b><span>Álbuns</span></button>
                <button type="button" onClick={() => openSource("playlists")}><b>≡</b><span>Playlists</span></button>
                <button type="button" onClick={() => openSource("artists")}><b>●</b><span>Artistas</span></button>
                <button type="button" onClick={() => setDrawer("radio")}><b>◉</b><span>Rádio</span><small>Mix do artista</small></button>
              </div>
            </>
          ) : (
            <>
              <button className={styles.changeSourceButton} type="button" onClick={() => setSelectorOpen(true)}>Trocar</button>
              <div className={styles.coverSlot}>
                {cover ? <img src={cover} alt={`Capa de ${track.album.name || "álbum"}`} /> : <span>♫</span>}
              </div>
              <div className={styles.trackText}>
                <small>{playback.isPlaying ? "PLAYING" : playback.stopped ? "STOPPED" : "PAUSED"}</small>
                <strong>{track.name}</strong>
                <b>{track.artists.map(artist => artist.name).join(", ")}</b>
                <span>{playbackSource || track.album.name}</span>
              </div>
            </>
          )}
        </section>

        {track && !showingSelector && (
          <>
            <input
              className={styles.progressRange}
              type="range"
              min="0"
              max={Math.max(1, playback.duration)}
              value={Math.min(playback.position, Math.max(1, playback.duration))}
              onChange={event => void seek(Number(event.target.value))}
              aria-label="Posição da música"
            />
            <span className={styles.currentTime}>{formatTime(playback.position)}</span>
            <span className={styles.durationTime}>{formatTime(playback.duration)}</span>
            <i className={styles.progressFill} style={{ width: `${progressPercent * 0.73}%` }} aria-hidden="true" />
          </>
        )}

        <div className={styles.transportVisuals} aria-hidden="true">
          <img className={styles.transportBase} src="/mobile-controls-off.png" alt="" width="1536" height="1024" decoding="sync" />
          <i className={`${styles.transportLight} ${styles.previousLight} ${transportFlash === "previous" ? styles.transportLightOn : ""}`}>
            <img src="/mobile-controls-on.png" alt="" width="1492" height="1024" decoding="sync" />
          </i>
          <i className={`${styles.transportLight} ${styles.pauseLight} ${track && !playback.isPlaying && !transportStopped ? styles.transportLightOn : ""}`}>
            <img src="/mobile-controls-on.png" alt="" width="1492" height="1024" decoding="sync" />
          </i>
          <i className={`${styles.transportLight} ${styles.playLight} ${playback.isPlaying ? styles.transportLightOn : ""}`}>
            <img src="/mobile-controls-on.png" alt="" width="1492" height="1024" decoding="sync" />
          </i>
          <i className={`${styles.transportLight} ${styles.stopLight} ${track && transportStopped ? styles.transportLightOn : ""}`}>
            <img src="/mobile-controls-on.png" alt="" width="1492" height="1024" decoding="sync" />
          </i>
          <i className={`${styles.transportLight} ${styles.nextLight} ${transportFlash === "next" ? styles.transportLightOn : ""}`}>
            <img src="/mobile-controls-on.png" alt="" width="1492" height="1024" decoding="sync" />
          </i>
        </div>

        <div className={styles.transportHotspots} aria-label="Controles de reprodução">
          <button type="button" onClick={handlePrevious} disabled={!track} aria-label="Faixa anterior" />
          <button type="button" onClick={() => { if (playback.isPlaying) void toggle(); }} disabled={!track || !playback.isPlaying} aria-label="Pausar" />
          <button type="button" onClick={() => { if (!playback.isPlaying) void toggle(); }} disabled={!track || playback.isPlaying} aria-label="Reproduzir" />
          <button type="button" onClick={() => void stop()} disabled={!track || playback.stopped} aria-label="Parar" />
          <button type="button" onClick={handleNext} disabled={!track} aria-label="Próxima faixa" />
        </div>

        <div className={styles.digitalEqualizer} aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => <span key={index} ref={element => { equalizerBarsRef.current[index] = element; }} />)}
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
                <strong>{drawer === "tracks" ? "Biblioteca" : drawer === "playlists" ? "Playlists" : drawer === "albums" ? "Álbuns" : drawer === "artists" ? "Artistas" : drawer === "radio" ? "Mix do artista" : drawer === "equalizer" ? "Equalizador" : "Mais opções"}</strong>
              </div>
              <button type="button" onClick={() => setDrawer(null)} aria-label="Fechar painel">×</button>
            </header>

            {(drawer === "tracks" || drawer === "playlists" || drawer === "albums" || drawer === "artists" || drawer === "radio") && (
              <div className={styles.drawerList}>
                {drawer === "radio" && (
                  <label className={styles.artistSearch}>
                    <span>Artista seguido ou pesquisado</span>
                    <input value={radioQuery} onChange={event => setRadioQuery(event.target.value)} placeholder="Pesquisar artista" type="search" />
                  </label>
                )}
                {loadingLibrary || radioSearching ? <p>Carregando…</p> : drawerItems.length ? drawerItems.map(item => (
                  <button type="button" key={`${item.kind}-${item.id}`} onClick={() => void selectItem(item)}>
                    <span>{item.image ? <img src={item.image} alt="" /> : "♫"}</span>
                    <div><strong>{item.name}</strong><small>{drawer === "radio" ? "Músicas deste artista" : item.subtitle}</small></div>
                    <b>›</b>
                  </button>
                )) : <p>{drawer === "radio" ? "Nenhum artista encontrado." : "Nenhum item disponível nesta categoria."}</p>}
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
