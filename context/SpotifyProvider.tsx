"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { beginSpotifyLogin } from "@/services/spotifyAuth";
import { spotifyApi } from "@/services/spotifyApi";
import { loadSpotifySdk } from "@/services/spotifyPlayer";
import { tokenManager } from "@/services/tokenManager";
import type { LibraryItem, PlaybackSnapshot, SpotifyPlayer, SpotifyTrack } from "@/types/spotify";

type Profile = { display_name?: string; product?: string; images?: { url: string }[] };
type Category = "playlists" | "albums" | "artists" | "tracks";
type PlayContext = { uri: string; tracks: LibraryItem[]; index: number };

type SpotifyContextValue = {
  authenticated: boolean; demo: boolean; ready: boolean; playerReady: boolean; profile: Profile | null;
  demoFinished: boolean;
  playback: PlaybackSnapshot; deviceId: string; library: Record<Category, LibraryItem[]>;
  login: () => Promise<void>; enterDemo: () => void; restartDemo: () => Promise<void>; logout: () => void;
  loadLibrary: (category: Category) => Promise<void>; loadDetails: (item: LibraryItem) => Promise<LibraryItem[]>; search: (query: string) => Promise<Record<Category, LibraryItem[]>>;
  playItem: (item: LibraryItem, context?: PlayContext) => Promise<void>; toggle: () => Promise<void>; stop: () => Promise<void>; previous: () => Promise<void>; next: () => Promise<void>;
  activateDevice: () => Promise<void>;
  seek: (ms: number) => Promise<void>; setVolume: (value: number) => Promise<void>;
  setShuffle: (value: boolean) => Promise<void>; setRepeat: (value: "off" | "context" | "track") => Promise<void>;
  toggleLike: () => Promise<void>; liked: boolean; error: string; clearError: () => void;
};

const initialPlayback: PlaybackSnapshot = { track: null, isPlaying: false, stopped: true, queueIndex: 0, queueLength: 0, position: 0, duration: 0, volume: 0.72, shuffle: false, repeat: "off" };
export const SpotifyContext = createContext<SpotifyContextValue | null>(null);

const demoTrack: SpotifyTrack = {
  id: "visual-spotymusic-demo",
  uri: "demo:track:visual-spotymusic",
  name: "Demonstração Visual SpotyMusic",
  duration_ms: 64170,
  album: {
    name: "Sessão de demonstração",
    images: [{ url: "/visual-spotymusic-icon.png" }],
    total_tracks: 1,
  },
  artists: [{ name: "Visual SpotyMusic" }],
};
const demoTracks: SpotifyTrack[] = [demoTrack];

const mapTrack = (track: SpotifyTrack): LibraryItem => ({ id: track.id, uri: track.uri, name: track.name, subtitle: `${track.artists.map(a => a.name).join(", ")} · ${track.album.name}`, image: track.album.images?.[0]?.url, kind: "track", track });
const demoItem = mapTrack(demoTrack);
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const withPage = (path: string, limit: number, offset: number) => `${path}${path.includes("?") ? "&" : "?"}limit=${limit}&offset=${offset}`;

async function loadEveryOffsetPage(path: string, getItems: (data: any) => any[], getTotal: (data: any) => number) {
  const limit = 50;
  const collected: any[] = [];
  let offset = 0;

  while (true) {
    const data = await spotifyApi<any>(withPage(path, limit, offset));
    const page = getItems(data) || [];
    collected.push(...page);
    if (!page.length || collected.length >= getTotal(data) || page.length < limit) break;
    offset += page.length;
  }

  return collected;
}

export function SpotifyProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [demo, setDemo] = useState(false);
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [demoFinished, setDemoFinished] = useState(false);
  const [playback, setPlayback] = useState(initialPlayback);
  const [deviceId, setDeviceId] = useState("");
  const [library, setLibrary] = useState<Record<Category, LibraryItem[]>>({ playlists: [], albums: [], artists: [], tracks: [] });
  const [liked, setLiked] = useState(false);
  const [error, setError] = useState("");
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const demoAudioRef = useRef<HTMLAudioElement | null>(null);
  const stoppedRef = useRef(true);
  const queueRef = useRef<PlayContext | null>(null);

  const fail = useCallback((reason: unknown) => setError(reason instanceof Error ? reason.message : "Algo deu errado. Tente novamente."), []);

  useEffect(() => {
    const tokens = tokenManager.get();
    setAuthenticated(Boolean(tokens));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!authenticated || demo) return;
    let cancelled = false;
    spotifyApi<Profile>("/me").then(setProfile).catch(fail);
    loadSpotifySdk().then(() => {
      if (cancelled || !window.Spotify) return;
      const player = new window.Spotify.Player({ name: "Visual SpotyMusic", getOAuthToken: cb => cb(tokenManager.get()?.accessToken || ""), volume: playback.volume });
      player.addListener("ready", ({ device_id }) => setDeviceId(device_id));
      player.addListener("not_ready", () => setDeviceId(""));
      player.addListener("authentication_error", fail);
      player.addListener("account_error", () => fail(new Error("A reprodução no navegador exige Spotify Premium.")));
      player.addListener("playback_error", fail);
      player.addListener("player_state_changed", (state) => {
        if (!state) return;
        if (stoppedRef.current) {
          setPlayback(previous => ({ ...previous, isPlaying: false, stopped: true, position: 0 }));
          return;
        }
        const sdkTrack = state.track_window.current_track;
        const track: SpotifyTrack = { id: sdkTrack.id, uri: sdkTrack.uri, name: sdkTrack.name, duration_ms: sdkTrack.duration_ms, album: { id: sdkTrack.album.id, name: sdkTrack.album.name, images: sdkTrack.album.images || [], total_tracks: sdkTrack.album.total_tracks }, artists: sdkTrack.artists || [], external_urls: sdkTrack.external_urls, track_number: sdkTrack.track_number };
        const queue = queueRef.current;
        const queueIndex = queue?.tracks.findIndex(item => item.id === track.id) ?? -1;
        if (queue && queueIndex >= 0) queue.index = queueIndex;
        if (queue && queueIndex < 0) queueRef.current = null;
        if (!state.paused) stoppedRef.current = false;
        setPlayback(previous => ({ ...previous, track, isPlaying: !state.paused, stopped: false, position: state.position, duration: state.duration, queueIndex: queueIndex >= 0 ? queueIndex : 0, queueLength: queueIndex >= 0 ? queue?.tracks.length || 0 : 0, shuffle: state.shuffle, repeat: ["off", "context", "track"][state.repeat_mode] as PlaybackSnapshot["repeat"] }));
      });
      player.connect().then(ok => { if (!ok) fail(new Error("O player do Spotify não ficou disponível.")); });
      playerRef.current = player;
    }).catch(fail);
    return () => { cancelled = true; playerRef.current?.disconnect(); playerRef.current = null; };
  }, [authenticated, demo, fail]);

  useEffect(() => {
    if (!authenticated || demo) return;
    const syncPlayback = async () => {
      try {
        const current = await spotifyApi<any>("/me/player");
        if (!current?.item) return;
        if (stoppedRef.current) {
          setPlayback(previous => ({ ...previous, isPlaying: false, stopped: true, position: 0 }));
          return;
        }
        const queue = queueRef.current;
        const queueIndex = queue?.tracks.findIndex(item => item.id === current.item.id) ?? -1;
        if (queue && queueIndex >= 0) queue.index = queueIndex;
        if (queue && queueIndex < 0) queueRef.current = null;
        setPlayback(previous => ({ ...previous, track: current.item, isPlaying: Boolean(current.is_playing), stopped: false, position: current.progress_ms || 0, duration: current.item.duration_ms || 0, queueIndex: queueIndex >= 0 ? queueIndex : 0, queueLength: queueIndex >= 0 ? queue?.tracks.length || 0 : 0, shuffle: Boolean(current.shuffle_state), repeat: current.repeat_state || "off" }));
      } catch { /* O SDK continua sendo a fonte principal. */ }
    };
    void syncPlayback();
    const timer = setInterval(syncPlayback, 6000);
    return () => clearInterval(timer);
  }, [authenticated, demo]);

  useEffect(() => {
    if (!demo) {
      demoAudioRef.current?.pause();
      demoAudioRef.current = null;
      setDemoFinished(false);
      return;
    }

    const audio = new Audio("/visual-spotymusic-demo.mp3");
    audio.preload = "metadata";
    audio.volume = playback.volume;
    demoAudioRef.current = audio;

    const syncTime = () => {
      setPlayback(previous => ({
        ...previous,
        position: Math.round(audio.currentTime * 1000),
        duration: Number.isFinite(audio.duration) ? Math.round(audio.duration * 1000) : demoTrack.duration_ms,
      }));
    };
    const finish = () => {
      stoppedRef.current = true;
      setPlayback(previous => ({ ...previous, isPlaying: false, stopped: true, position: previous.duration || demoTrack.duration_ms }));
      setDemoFinished(true);
    };

    audio.addEventListener("timeupdate", syncTime);
    audio.addEventListener("loadedmetadata", syncTime);
    audio.addEventListener("ended", finish);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", syncTime);
      audio.removeEventListener("loadedmetadata", syncTime);
      audio.removeEventListener("ended", finish);
      if (demoAudioRef.current === audio) demoAudioRef.current = null;
    };
  }, [demo]);

  const loadLibrary = useCallback(async (category: Category) => {
    if (demo) {
      const mock: Record<Category, LibraryItem[]> = {
        tracks: [demoItem],
        playlists: [],
        albums: [],
        artists: [],
      };
      setLibrary(current => ({ ...current, [category]: mock[category] })); return;
    }
    try {
      let source: any[] = [];
      if (category === "playlists") source = await loadEveryOffsetPage("/me/playlists", data => data.items, data => data.total);
      if (category === "albums") source = await loadEveryOffsetPage("/me/albums", data => data.items, data => data.total);
      if (category === "tracks") source = await loadEveryOffsetPage("/me/tracks", data => data.items, data => data.total);
      if (category === "artists") {
        let after = "";
        do {
          const data = await spotifyApi<any>(`/me/following?type=artist&limit=50${after ? `&after=${encodeURIComponent(after)}` : ""}`);
          source.push(...(data.artists?.items || []));
          after = data.artists?.cursors?.after || "";
        } while (after);
      }
      const items: LibraryItem[] = source.map((raw: any) => {
        const value = raw.track || raw.album || raw;
        if (category === "tracks") return mapTrack(value);
        return { id: value.id, uri: value.uri, name: value.name, subtitle: category === "artists" ? "Artista" : category === "albums" ? value.artists.map((a: any) => a.name).join(", ") : `${value.items?.total ?? value.tracks?.total ?? 0} faixas`, image: value.images?.[0]?.url, kind: category.slice(0, -1) as LibraryItem["kind"] };
      });
      setLibrary(current => ({ ...current, [category]: items }));
    } catch (reason) { fail(reason); }
  }, [demo, fail]);

  const loadDetails = useCallback(async (item: LibraryItem) => {
    if (item.kind === "track") return [item];
    if (demo) return demoTracks.map(mapTrack);
    try {
      if (item.kind === "playlist") {
        const entries = await loadEveryOffsetPage(`/playlists/${item.id}/items`, data => data.items, data => data.total);
        return entries.map((entry: any) => entry.item || entry.track).filter((entry: any) => entry?.type !== "episode").map(mapTrack);
      }
      if (item.kind === "album") {
        const data = await spotifyApi<any>(`/albums/${item.id}`);
        const tracks = await loadEveryOffsetPage(`/albums/${item.id}/tracks`, page => page.items, page => page.total);
        return tracks.map((track: any) => mapTrack({ ...track, album: { id: data.id || item.id, name: data.name || item.name, images: data.images || (item.image ? [{ url: item.image }] : []), total_tracks: data.total_tracks } }));
      }
      const data = await spotifyApi<any>(`/artists/${item.id}/top-tracks?market=from_token`);
      return (data.tracks || []).map(mapTrack);
    } catch (reason) {
      fail(reason);
      return [];
    }
  }, [demo, fail]);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return { playlists: [], albums: [], artists: [], tracks: [] };
    if (demo) {
      const matches = demoTracks.filter(t => `${t.name} ${t.artists[0].name}`.toLowerCase().includes(query.toLowerCase())).map(mapTrack);
      return { playlists: [], albums: [], artists: [], tracks: matches };
    }
    const data = await spotifyApi<any>(`/search?q=${encodeURIComponent(query)}&type=track,artist,album,playlist&limit=8`);
    const basic = (value: any, kind: LibraryItem["kind"]): LibraryItem => ({ id: value.id, uri: value.uri, name: value.name, subtitle: kind === "artist" ? "Artista" : kind === "playlist" ? `${value.items?.total ?? value.tracks?.total ?? 0} faixas` : value.artists?.map((a: any) => a.name).join(", ") || "Spotify", image: value.images?.[0]?.url, kind });
    return { tracks: data.tracks.items.map(mapTrack), artists: data.artists.items.map((x: any) => basic(x, "artist")), albums: data.albums.items.map((x: any) => basic(x, "album")), playlists: data.playlists.items.filter(Boolean).map((x: any) => basic(x, "playlist")) };
  }, [demo]);

  const activateDevice = useCallback(async () => {
    try {
      if (demo) return;
      if (!playerRef.current || !deviceId) throw new Error("O toca-discos ainda está iniciando. Aguarde alguns segundos.");
      await playerRef.current.activateElement();
      await spotifyApi("/me/player", { method: "PUT", body: JSON.stringify({ device_ids: [deviceId], play: false }) });
    } catch (reason) { fail(reason); }
  }, [demo, deviceId, fail]);

  const playItem = useCallback(async (item: LibraryItem, context?: PlayContext) => {
    try {
      const selectedItem = context?.tracks[context.index] || item;
      const selectedTrack = selectedItem.track;
      queueRef.current = context ? { ...context } : null;
      if (demo) {
        const track = selectedTrack || item.track || demoTracks[0];
        const audio = demoAudioRef.current;
        if (!audio) throw new Error("A demonstração ainda está carregando. Tente novamente.");
        audio.currentTime = 0;
        setDemoFinished(false);
        stoppedRef.current = false;
        setPlayback(previous => ({ ...previous, track, duration: track.duration_ms, position: 0, isPlaying: true, stopped: false, queueIndex: context?.index || 0, queueLength: context?.tracks.length || 1 }));
        await audio.play();
        return;
      }
      if (!playerRef.current || !deviceId) throw new Error("O toca-discos ainda está iniciando. Aguarde alguns segundos.");
      stoppedRef.current = true;
      if (selectedTrack) {
        setPlayback(previous => ({ ...previous, track: selectedTrack, duration: selectedTrack.duration_ms, position: 0, isPlaying: false, stopped: true, queueIndex: context?.index || 0, queueLength: context?.tracks.length || 0 }));
      }
      await playerRef.current.activateElement();
      await spotifyApi("/me/player", { method: "PUT", body: JSON.stringify({ device_ids: [deviceId], play: false }) });
      await wait(300);
      const body = context
        ? { context_uri: context.uri, offset: { uri: selectedItem.uri }, position_ms: 0 }
        : item.kind === "track" ? { uris: [item.uri] } : { context_uri: item.uri };
      await spotifyApi(`/me/player/play?device_id=${deviceId}`, { method: "PUT", body: JSON.stringify(body) });
      stoppedRef.current = false;
      setPlayback(previous => ({ ...previous, isPlaying: true, stopped: false, position: 0 }));
    } catch (reason) { fail(reason); }
  }, [demo, deviceId, fail]);

  const toggle = useCallback(async () => {
    const wasPlaying = playback.isPlaying;
    const wasStopped = playback.stopped;
    try {
      if (!playback.track) throw new Error("Escolha uma música antes de apertar Play.");
      if (!demo && (!playerRef.current || !deviceId)) throw new Error("O toca-discos ainda está iniciando. Aguarde alguns segundos.");
      const shouldPlay = !playback.isPlaying;
      const queue = queueRef.current;
      const selected = queue?.tracks[queue.index];
      stoppedRef.current = false;
      setPlayback(previous => ({ ...previous, isPlaying: shouldPlay, stopped: false }));
      if (demo) {
        const audio = demoAudioRef.current;
        if (!audio) throw new Error("A demonstração ainda está carregando. Tente novamente.");
        if (shouldPlay) {
          if (wasStopped || audio.ended) audio.currentTime = 0;
          setDemoFinished(false);
          await audio.play();
        } else {
          audio.pause();
        }
        return;
      }
      await playerRef.current?.activateElement();
      const body = shouldPlay && wasStopped && queue && selected
        ? JSON.stringify({ context_uri: queue.uri, offset: { uri: selected.uri }, position_ms: 0 })
        : undefined;
      await spotifyApi(`/me/player/${shouldPlay ? "play" : "pause"}?device_id=${encodeURIComponent(deviceId)}`, { method: "PUT", body });
    } catch (reason) {
      stoppedRef.current = wasStopped;
      setPlayback(previous => ({ ...previous, isPlaying: wasPlaying, stopped: wasStopped }));
      fail(reason);
    }
  }, [demo, deviceId, playback.isPlaying, playback.stopped, playback.track, fail]);

  const stop = useCallback(async () => {
    if (!playback.track) return;
    stoppedRef.current = true;
    setPlayback(previous => ({ ...previous, isPlaying: false, stopped: true, position: 0 }));
    if (demo) {
      const audio = demoAudioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setDemoFinished(false);
      return;
    }
    try {
      if (!playerRef.current || !deviceId) throw new Error("O toca-discos ainda está iniciando. Aguarde alguns segundos.");
      await playerRef.current.activateElement();
      await spotifyApi(`/me/player/pause?device_id=${encodeURIComponent(deviceId)}`, { method: "PUT" });
      await spotifyApi(`/me/player/seek?position_ms=0&device_id=${encodeURIComponent(deviceId)}`, { method: "PUT" });
    } catch (reason) {
      fail(reason);
    }
  }, [demo, deviceId, playback.track, fail]);

  const previous = useCallback(async () => {
    try {
      if (!playback.track) throw new Error("Escolha uma música antes de usar os controles.");
      const keepParked = playback.stopped;
      const queue = queueRef.current;
      const targetIndex = queue ? Math.max(0, queue.index - 1) : -1;
      if (queue && targetIndex === queue.index) return;
      if (queue) queue.index = targetIndex;
      stoppedRef.current = keepParked;
      const targetTrack = queue?.tracks[targetIndex]?.track;
      if (keepParked && targetTrack) {
        setPlayback(previousState => ({ ...previousState, track: targetTrack, duration: targetTrack.duration_ms, position: 0, isPlaying: false, stopped: true, queueIndex: targetIndex, queueLength: queue.tracks.length }));
        return;
      }
      if (demo) {
        const i = queue ? targetIndex : Math.max(0, demoTracks.findIndex(track => track.id === playback.track?.id) - 1);
        const track = targetTrack || demoTracks[i];
        setPlayback(previousState => ({ ...previousState, track, duration: track.duration_ms, position: 0, stopped: false, queueIndex: queue ? targetIndex : i, queueLength: queue?.tracks.length || demoTracks.length }));
        return;
      }
      if (!playerRef.current || !deviceId) throw new Error("O toca-discos ainda está iniciando. Aguarde alguns segundos.");
      await playerRef.current.activateElement();
      await spotifyApi(`/me/player/previous?device_id=${encodeURIComponent(deviceId)}`, { method: "POST" });
      setPlayback(previousState => ({ ...previousState, position: 0, stopped: false, queueIndex: queue ? targetIndex : previousState.queueIndex }));
    } catch (reason) { fail(reason); }
  }, [demo, deviceId, playback.stopped, playback.track, fail]);

  const next = useCallback(async () => {
    try {
      if (!playback.track) throw new Error("Escolha uma música antes de usar os controles.");
      const keepParked = playback.stopped;
      const queue = queueRef.current;
      const targetIndex = queue ? Math.min(queue.tracks.length - 1, queue.index + 1) : -1;
      if (queue && targetIndex === queue.index) return;
      if (queue) queue.index = targetIndex;
      stoppedRef.current = keepParked;
      const targetTrack = queue?.tracks[targetIndex]?.track;
      if (keepParked && targetTrack) {
        setPlayback(previousState => ({ ...previousState, track: targetTrack, duration: targetTrack.duration_ms, position: 0, isPlaying: false, stopped: true, queueIndex: targetIndex, queueLength: queue.tracks.length }));
        return;
      }
      if (demo) {
        const i = queue ? targetIndex : Math.min(demoTracks.length - 1, Math.max(0, demoTracks.findIndex(track => track.id === playback.track?.id)) + 1);
        const track = targetTrack || demoTracks[i];
        setPlayback(previousState => ({ ...previousState, track, duration: track.duration_ms, position: 0, stopped: false, queueIndex: queue ? targetIndex : i, queueLength: queue?.tracks.length || demoTracks.length }));
        return;
      }
      if (!playerRef.current || !deviceId) throw new Error("O toca-discos ainda está iniciando. Aguarde alguns segundos.");
      await playerRef.current.activateElement();
      await spotifyApi(`/me/player/next?device_id=${encodeURIComponent(deviceId)}`, { method: "POST" });
      setPlayback(previousState => ({ ...previousState, position: 0, stopped: false, queueIndex: queue ? targetIndex : previousState.queueIndex }));
    } catch (reason) { fail(reason); }
  }, [demo, deviceId, playback.stopped, playback.track, fail]);

  const seek = useCallback(async (ms: number) => {
    try {
      setPlayback(previous => ({ ...previous, position: ms }));
      if (demo) {
        if (demoAudioRef.current) demoAudioRef.current.currentTime = ms / 1000;
      } else {
        await playerRef.current?.seek(ms);
      }
    } catch (reason) { fail(reason); }
  }, [demo, fail]);

  const setVolume = useCallback(async (value: number) => {
    try {
      setPlayback(previous => ({ ...previous, volume: value }));
      if (demo) {
        if (demoAudioRef.current) demoAudioRef.current.volume = value;
      } else {
        await playerRef.current?.setVolume(value);
      }
    } catch (reason) { fail(reason); }
  }, [demo, fail]);

  const setShuffle = useCallback(async (value: boolean) => {
    try {
      setPlayback(previous => ({ ...previous, shuffle: value }));
      if (!demo) {
        if (!deviceId) throw new Error("O toca-discos ainda está iniciando. Aguarde alguns segundos.");
        await spotifyApi(`/me/player/shuffle?state=${value}&device_id=${encodeURIComponent(deviceId)}`, { method: "PUT" });
      }
    } catch (reason) { fail(reason); }
  }, [demo, deviceId, fail]);

  const setRepeat = useCallback(async (value: PlaybackSnapshot["repeat"]) => {
    try {
      setPlayback(previous => ({ ...previous, repeat: value }));
      if (!demo) {
        if (!deviceId) throw new Error("O toca-discos ainda está iniciando. Aguarde alguns segundos.");
        await spotifyApi(`/me/player/repeat?state=${value}&device_id=${encodeURIComponent(deviceId)}`, { method: "PUT" });
      }
    } catch (reason) { fail(reason); }
  }, [demo, deviceId, fail]);
  useEffect(() => {
    const track = playback.track;
    if (!track) {
      setLiked(false);
      return;
    }
    if (demo) {
      setLiked(false);
      return;
    }
    let cancelled = false;
    spotifyApi<boolean[]>(`/me/library/contains?uris=${encodeURIComponent(track.uri)}`)
      .then(result => { if (!cancelled) setLiked(Boolean(result?.[0])); })
      .catch(() => { if (!cancelled) setLiked(false); });
    return () => { cancelled = true; };
  }, [demo, playback.track?.uri]);

  const toggleLike = useCallback(async () => {
    if (!playback.track) return;
    const value = !liked;
    const uri = playback.track.uri;
    setLiked(value);
    if (demo) return;
    try {
      await spotifyApi(`/me/library?uris=${encodeURIComponent(uri)}`, { method: value ? "PUT" : "DELETE" });
    } catch (reason) {
      setLiked(!value);
      fail(reason);
    }
  }, [demo, liked, playback.track, fail]);

  const enterDemo = useCallback(() => {
    stoppedRef.current = true;
    queueRef.current = { uri: "demo:session:visual-spotymusic", tracks: [demoItem], index: 0 };
    setDemoFinished(false);
    setDemo(true);
    setAuthenticated(true);
    setProfile({ display_name: "Visitante" });
    setLibrary({ playlists: [], albums: [], artists: [], tracks: [demoItem] });
    setPlayback(initialPlayback);
  }, []);

  const restartDemo = useCallback(async () => {
    const audio = demoAudioRef.current;
    if (!audio) throw new Error("A demonstração ainda está carregando. Tente novamente.");
    queueRef.current = { uri: "demo:session:visual-spotymusic", tracks: [demoItem], index: 0 };
    audio.currentTime = 0;
    setDemoFinished(false);
    stoppedRef.current = false;
    setPlayback(previous => ({ ...previous, track: demoTrack, duration: demoTrack.duration_ms, position: 0, isPlaying: true, stopped: false, queueIndex: 0, queueLength: 1 }));
    await audio.play();
  }, []);

  const logout = useCallback(() => {
    stoppedRef.current = true;
    demoAudioRef.current?.pause();
    queueRef.current = null;
    tokenManager.clear();
    setAuthenticated(false);
    setDemo(false);
    setDemoFinished(false);
    setProfile(null);
    setLibrary({ playlists: [], albums: [], artists: [], tracks: [] });
    setPlayback(initialPlayback);
  }, []);

  const playerReady = demo || Boolean(deviceId);
  const value = useMemo<SpotifyContextValue>(() => ({ authenticated, demo, ready, playerReady, profile, demoFinished, playback, deviceId, library, login: beginSpotifyLogin, enterDemo, restartDemo, logout, loadLibrary, loadDetails, search, playItem, activateDevice, toggle, stop, previous, next, seek, setVolume, setShuffle, setRepeat, toggleLike, liked, error, clearError: () => setError("") }), [authenticated, demo, ready, playerReady, profile, demoFinished, playback, deviceId, library, enterDemo, restartDemo, logout, loadLibrary, loadDetails, search, playItem, activateDevice, toggle, stop, previous, next, seek, setVolume, setShuffle, setRepeat, toggleLike, liked, error]);
  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
}
