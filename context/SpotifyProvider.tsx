"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { beginSpotifyLogin } from "@/services/spotifyAuth";
import { spotifyApi } from "@/services/spotifyApi";
import { loadSpotifySdk } from "@/services/spotifyPlayer";
import { tokenManager } from "@/services/tokenManager";
import type { LibraryItem, PlaybackSnapshot, SpotifyPlayer, SpotifyTrack } from "@/types/spotify";

type Profile = { display_name?: string; product?: string; images?: { url: string }[] };
type Category = "playlists" | "albums" | "artists" | "tracks";

type SpotifyContextValue = {
  authenticated: boolean; demo: boolean; ready: boolean; playerReady: boolean; profile: Profile | null;
  playback: PlaybackSnapshot; deviceId: string; library: Record<Category, LibraryItem[]>;
  login: () => Promise<void>; enterDemo: () => void; logout: () => void;
  loadLibrary: (category: Category) => Promise<void>; loadDetails: (item: LibraryItem) => Promise<LibraryItem[]>; search: (query: string) => Promise<Record<Category, LibraryItem[]>>;
  playItem: (item: LibraryItem) => Promise<void>; toggle: () => Promise<void>; stop: () => Promise<void>; previous: () => Promise<void>; next: () => Promise<void>;
  activateDevice: () => Promise<void>;
  seek: (ms: number) => Promise<void>; setVolume: (value: number) => Promise<void>;
  setShuffle: (value: boolean) => Promise<void>; setRepeat: (value: "off" | "context" | "track") => Promise<void>;
  toggleLike: () => Promise<void>; liked: boolean; error: string; clearError: () => void;
};

const initialPlayback: PlaybackSnapshot = { track: null, isPlaying: false, stopped: true, position: 0, duration: 0, volume: 0.72, shuffle: false, repeat: "off" };
export const SpotifyContext = createContext<SpotifyContextValue | null>(null);

const demoTracks: SpotifyTrack[] = [
  { id: "demo-1", uri: "spotify:track:demo-1", name: "Midnight in Ipanema", duration_ms: 238000, album: { name: "Veludo Elétrico", images: [] }, artists: [{ name: "Visual Ensemble" }] },
  { id: "demo-2", uri: "spotify:track:demo-2", name: "Bronze & Chuva", duration_ms: 196000, album: { name: "Sessões Analógicas", images: [] }, artists: [{ name: "Aurora 77" }] },
  { id: "demo-3", uri: "spotify:track:demo-3", name: "Último Trem", duration_ms: 261000, album: { name: "Depois da Meia-Noite", images: [] }, artists: [{ name: "Clube Magnético" }] },
];

const mapTrack = (track: SpotifyTrack): LibraryItem => ({ id: track.id, uri: track.uri, name: track.name, subtitle: `${track.artists.map(a => a.name).join(", ")} · ${track.album.name}`, image: track.album.images?.[0]?.url, kind: "track", track });
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
  const [playback, setPlayback] = useState(initialPlayback);
  const [deviceId, setDeviceId] = useState("");
  const [library, setLibrary] = useState<Record<Category, LibraryItem[]>>({ playlists: [], albums: [], artists: [], tracks: [] });
  const [liked, setLiked] = useState(false);
  const [error, setError] = useState("");
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const demoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stoppedRef = useRef(true);

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
        if (stoppedRef.current && state.paused) {
          setPlayback(previous => ({ ...previous, isPlaying: false, stopped: true, position: 0 }));
          return;
        }
        if (!state.paused) stoppedRef.current = false;
        const sdkTrack = state.track_window.current_track;
        const track: SpotifyTrack = { id: sdkTrack.id, uri: sdkTrack.uri, name: sdkTrack.name, duration_ms: sdkTrack.duration_ms, album: { id: sdkTrack.album.id, name: sdkTrack.album.name, images: sdkTrack.album.images || [], total_tracks: sdkTrack.album.total_tracks }, artists: sdkTrack.artists || [], external_urls: sdkTrack.external_urls, track_number: sdkTrack.track_number };
        setPlayback(previous => ({ ...previous, track, isPlaying: !state.paused, stopped: false, position: state.position, duration: state.duration, shuffle: state.shuffle, repeat: ["off", "context", "track"][state.repeat_mode] as PlaybackSnapshot["repeat"] }));
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
        if (stoppedRef.current && !current.is_playing) return;
        if (current.is_playing) stoppedRef.current = false;
        setPlayback(previous => ({ ...previous, track: current.item, isPlaying: Boolean(current.is_playing), stopped: false, position: current.progress_ms || 0, duration: current.item.duration_ms || 0, shuffle: Boolean(current.shuffle_state), repeat: current.repeat_state || "off" }));
      } catch { /* O SDK continua sendo a fonte principal. */ }
    };
    void syncPlayback();
    const timer = setInterval(syncPlayback, 6000);
    return () => clearInterval(timer);
  }, [authenticated, demo]);

  useEffect(() => {
    if (!demo || !playback.isPlaying) { if (demoTimer.current) clearInterval(demoTimer.current); return; }
    demoTimer.current = setInterval(() => setPlayback(previous => {
      const position = previous.position + 500;
      if (position >= previous.duration) return { ...previous, isPlaying: false, position: previous.duration };
      return { ...previous, position };
    }), 500);
    return () => { if (demoTimer.current) clearInterval(demoTimer.current); };
  }, [demo, playback.isPlaying]);

  const loadLibrary = useCallback(async (category: Category) => {
    if (demo) {
      const tracks = demoTracks.map(mapTrack);
      const mock: Record<Category, LibraryItem[]> = {
        tracks,
        playlists: [{ id: "p1", uri: "spotify:playlist:demo", name: "Noite de Vinil", subtitle: "12 faixas", kind: "playlist" }],
        albums: [{ id: "a1", uri: "spotify:album:demo", name: "Veludo Elétrico", subtitle: "Visual Ensemble · 2026", kind: "album" }],
        artists: [{ id: "r1", uri: "spotify:artist:demo", name: "Visual Ensemble", subtitle: "Artista", kind: "artist" }],
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

  const playItem = useCallback(async (item: LibraryItem) => {
    try {
      if (demo) {
        const track = item.track || demoTracks[0];
        stoppedRef.current = false;
        setPlayback(previous => ({ ...previous, track, duration: track.duration_ms, position: 0, isPlaying: true, stopped: false })); return;
      }
      if (!playerRef.current || !deviceId) throw new Error("O toca-discos ainda está iniciando. Aguarde alguns segundos.");
      stoppedRef.current = false;
      await playerRef.current.activateElement();
      await spotifyApi("/me/player", { method: "PUT", body: JSON.stringify({ device_ids: [deviceId], play: false }) });
      await wait(300);
      await spotifyApi(`/me/player/play?device_id=${deviceId}`, { method: "PUT", body: JSON.stringify(item.kind === "track" ? { uris: [item.uri] } : { context_uri: item.uri }) });
    } catch (reason) { fail(reason); }
  }, [demo, deviceId, fail]);

  const toggle = useCallback(async () => {
    try {
      if (!playback.track) throw new Error("Escolha uma música antes de apertar Play.");
      stoppedRef.current = false;
      setPlayback(previous => ({ ...previous, stopped: false }));
      if (demo) setPlayback(previous => ({ ...previous, isPlaying: !previous.isPlaying, stopped: false }));
      else {
        await playerRef.current?.activateElement();
        await playerRef.current?.togglePlay();
      }
    } catch (reason) { fail(reason); }
  }, [demo, playback.track, fail]);

  const stop = useCallback(async () => {
    if (!playback.track) return;
    stoppedRef.current = true;
    setPlayback(previous => ({ ...previous, isPlaying: false, stopped: true, position: 0 }));
    try {
      if (!demo) {
        await playerRef.current?.activateElement();
        await spotifyApi(`/me/player/pause${deviceId ? `?device_id=${deviceId}` : ""}`, { method: "PUT" });
        await playerRef.current?.seek(0);
      }
    } catch (reason) {
      stoppedRef.current = false;
      fail(reason);
    }
  }, [demo, deviceId, playback.track, fail]);

  const previous = useCallback(async () => {
    try {
      stoppedRef.current = false;
      if (demo) {
        const i = Math.max(0, demoTracks.findIndex(track => track.id === playback.track?.id));
        const track = demoTracks[(i - 1 + demoTracks.length) % demoTracks.length];
        setPlayback(previousState => ({ ...previousState, track, duration: track.duration_ms, position: 0, isPlaying: true, stopped: false }));
      } else await playerRef.current?.previousTrack();
    } catch (reason) { fail(reason); }
  }, [demo, playback.track, fail]);

  const next = useCallback(async () => {
    try {
      stoppedRef.current = false;
      if (demo) {
        const i = Math.max(0, demoTracks.findIndex(track => track.id === playback.track?.id));
        const track = demoTracks[(i + 1) % demoTracks.length];
        setPlayback(previousState => ({ ...previousState, track, duration: track.duration_ms, position: 0, isPlaying: true, stopped: false }));
      } else await playerRef.current?.nextTrack();
    } catch (reason) { fail(reason); }
  }, [demo, playback.track, fail]);

  const seek = useCallback(async (ms: number) => {
    try {
      setPlayback(previous => ({ ...previous, position: ms }));
      if (!demo) await playerRef.current?.seek(ms);
    } catch (reason) { fail(reason); }
  }, [demo, fail]);

  const setVolume = useCallback(async (value: number) => {
    try {
      setPlayback(previous => ({ ...previous, volume: value }));
      if (!demo) await playerRef.current?.setVolume(value);
    } catch (reason) { fail(reason); }
  }, [demo, fail]);

  const setShuffle = useCallback(async (value: boolean) => {
    try {
      setPlayback(previous => ({ ...previous, shuffle: value }));
      if (!demo) await spotifyApi(`/me/player/shuffle?state=${value}`, { method: "PUT" });
    } catch (reason) { fail(reason); }
  }, [demo, fail]);

  const setRepeat = useCallback(async (value: PlaybackSnapshot["repeat"]) => {
    try {
      setPlayback(previous => ({ ...previous, repeat: value }));
      if (!demo) await spotifyApi(`/me/player/repeat?state=${value}`, { method: "PUT" });
    } catch (reason) { fail(reason); }
  }, [demo, fail]);
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

  const playerReady = demo || Boolean(deviceId);
  const value = useMemo<SpotifyContextValue>(() => ({ authenticated, demo, ready, playerReady, profile, playback, deviceId, library, login: beginSpotifyLogin, enterDemo: () => { stoppedRef.current = true; setDemo(true); setAuthenticated(true); setProfile({ display_name: "Visitante" }); }, logout: () => { stoppedRef.current = true; tokenManager.clear(); setAuthenticated(false); setDemo(false); setProfile(null); setPlayback(initialPlayback); }, loadLibrary, loadDetails, search, playItem, activateDevice, toggle, stop, previous, next, seek, setVolume, setShuffle, setRepeat, toggleLike, liked, error, clearError: () => setError("") }), [authenticated, demo, ready, playerReady, profile, playback, deviceId, library, loadLibrary, loadDetails, search, playItem, activateDevice, toggle, stop, previous, next, seek, setVolume, setShuffle, setRepeat, toggleLike, liked, error]);
  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
}
