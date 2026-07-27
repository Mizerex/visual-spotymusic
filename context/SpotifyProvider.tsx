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
  playItem: (item: LibraryItem) => Promise<void>; toggle: () => Promise<void>; previous: () => Promise<void>; next: () => Promise<void>;
  activateDevice: () => Promise<void>;
  seek: (ms: number) => Promise<void>; setVolume: (value: number) => Promise<void>;
  setShuffle: (value: boolean) => Promise<void>; setRepeat: (value: "off" | "context" | "track") => Promise<void>;
  toggleLike: () => Promise<void>; liked: boolean; error: string; clearError: () => void;
};

const initialPlayback: PlaybackSnapshot = { track: null, isPlaying: false, position: 0, duration: 0, volume: 0.72, shuffle: false, repeat: "off" };
export const SpotifyContext = createContext<SpotifyContextValue | null>(null);

const demoTracks: SpotifyTrack[] = [
  { id: "demo-1", uri: "spotify:track:demo-1", name: "Midnight in Ipanema", duration_ms: 238000, album: { name: "Veludo Elétrico", images: [] }, artists: [{ name: "Visual Ensemble" }] },
  { id: "demo-2", uri: "spotify:track:demo-2", name: "Bronze & Chuva", duration_ms: 196000, album: { name: "Sessões Analógicas", images: [] }, artists: [{ name: "Aurora 77" }] },
  { id: "demo-3", uri: "spotify:track:demo-3", name: "Último Trem", duration_ms: 261000, album: { name: "Depois da Meia-Noite", images: [] }, artists: [{ name: "Clube Magnético" }] },
];

const mapTrack = (track: SpotifyTrack): LibraryItem => ({ id: track.id, uri: track.uri, name: track.name, subtitle: `${track.artists.map(a => a.name).join(", ")} · ${track.album.name}`, image: track.album.images?.[0]?.url, kind: "track", track });
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
        const sdkTrack = state.track_window.current_track;
        const track: SpotifyTrack = { id: sdkTrack.id, uri: sdkTrack.uri, name: sdkTrack.name, duration_ms: sdkTrack.duration_ms, album: { id: sdkTrack.album.id, name: sdkTrack.album.name, images: sdkTrack.album.images || [], total_tracks: sdkTrack.album.total_tracks }, artists: sdkTrack.artists || [], external_urls: sdkTrack.external_urls, track_number: sdkTrack.track_number };
        setPlayback(previous => ({ ...previous, track, isPlaying: !state.paused, position: state.position, duration: state.duration, shuffle: state.shuffle, repeat: ["off", "context", "track"][state.repeat_mode] as PlaybackSnapshot["repeat"] }));
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
        setPlayback(previous => ({ ...previous, track: current.item, isPlaying: Boolean(current.is_playing), position: current.progress_ms || 0, duration: current.item.duration_ms || 0, shuffle: Boolean(current.shuffle_state), repeat: current.repeat_state || "off" }));
      } catch { /* O SDK continua sendo a fonte principal. */ }
    };
    void syncPlayback();
    const timer = setInterval(syncPlayback, 6000);
    return () => clearInterval(timer);
  }, [authenticated, demo]);

  useEffect(() => {
    if (!playback.isPlaying || !playback.track || playback.duration <= 0) { if (demoTimer.current) clearInterval(demoTimer.current); return; }
    demoTimer.current = setInterval(() => setPlayback(previous => {
      const position = previous.position + 500;
      if (position >= previous.duration) return { ...previous, isPlaying: false, position: previous.duration };
      return { ...previous, position };
    }), 500);
    return () => { if (demoTimer.current) clearInterval(demoTimer.current); };
  }, [playback.isPlaying, playback.track, playback.duration]);

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
      let data: any;
      if (category === "playlists") data = await spotifyApi<any>("/me/playlists?limit=30");
      if (category === "albums") data = await spotifyApi<any>("/me/albums?limit=30");
      if (category === "artists") data = await spotifyApi<any>("/me/following?type=artist&limit=30");
      if (category === "tracks") data = await spotifyApi<any>("/me/tracks?limit=30");
      const source = category === "artists" ? data.artists.items : data.items;
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
        const data = await spotifyApi<any>(`/playlists/${item.id}/items?limit=50`);
        return (data.items || []).map((entry: any) => entry.item || entry.track).filter((entry: any) => entry?.type !== "episode").map(mapTrack);
      }
      if (item.kind === "album") {
        const data = await spotifyApi<any>(`/albums/${item.id}`);
        const tracks = data.items?.items || data.tracks?.items || [];
        return tracks.map((track: any) => mapTrack({ ...track, album: { id: data.id || item.id, name: data.name || item.name, images: data.images || (item.image ? [{ url: item.image }] : []), total_tracks: data.total_tracks } }));
      }
      const data = await spotifyApi<any>(`/search?q=${encodeURIComponent(`artist:${item.name}`)}&type=track&limit=10`);
      return (data.tracks?.items || []).map(mapTrack);
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
        setPlayback(previous => ({ ...previous, track, duration: track.duration_ms, position: 0, isPlaying: true })); return;
      }
      if (!playerRef.current || !deviceId) throw new Error("O toca-discos ainda está iniciando. Aguarde alguns segundos.");
      await playerRef.current.activateElement();
      await spotifyApi("/me/player", { method: "PUT", body: JSON.stringify({ device_ids: [deviceId], play: false }) });
      await wait(300);
      await spotifyApi(`/me/player/play?device_id=${deviceId}`, { method: "PUT", body: JSON.stringify(item.kind === "track" ? { uris: [item.uri] } : { context_uri: item.uri }) });
    } catch (reason) { fail(reason); }
  }, [demo, deviceId, fail]);

  const toggle = useCallback(async () => { try { if (!playback.track) throw new Error("Escolha uma música antes de apertar Play."); if (demo) setPlayback(p => ({ ...p, isPlaying: !p.isPlaying })); else { await playerRef.current?.activateElement(); await playerRef.current?.togglePlay(); } } catch (reason) { fail(reason); } }, [demo, playback.track, fail]);
  const previous = useCallback(async () => { if (demo) { const i = Math.max(0, demoTracks.findIndex(t => t.id === playback.track?.id)); const t = demoTracks[(i - 1 + demoTracks.length) % demoTracks.length]; setPlayback(p => ({ ...p, track: t, duration: t.duration_ms, position: 0, isPlaying: true })); } else await playerRef.current?.previousTrack(); }, [demo, playback.track]);
  const next = useCallback(async () => { if (demo) { const i = Math.max(0, demoTracks.findIndex(t => t.id === playback.track?.id)); const t = demoTracks[(i + 1) % demoTracks.length]; setPlayback(p => ({ ...p, track: t, duration: t.duration_ms, position: 0, isPlaying: true })); } else await playerRef.current?.nextTrack(); }, [demo, playback.track]);
  const seek = useCallback(async (ms: number) => { if (demo) setPlayback(p => ({ ...p, position: ms })); else await playerRef.current?.seek(ms); }, [demo]);
  const setVolume = useCallback(async (value: number) => { setPlayback(p => ({ ...p, volume: value })); if (!demo) await playerRef.current?.setVolume(value); }, [demo]);
  const setShuffle = useCallback(async (value: boolean) => { setPlayback(p => ({ ...p, shuffle: value })); if (!demo) await spotifyApi(`/me/player/shuffle?state=${value}`, { method: "PUT" }); }, [demo]);
  const setRepeat = useCallback(async (value: PlaybackSnapshot["repeat"]) => { setPlayback(p => ({ ...p, repeat: value })); if (!demo) await spotifyApi(`/me/player/repeat?state=${value}`, { method: "PUT" }); }, [demo]);
  const toggleLike = useCallback(async () => { if (!playback.track) return; const value = !liked; setLiked(value); if (!demo) await spotifyApi(`/me/tracks?ids=${playback.track.id}`, { method: value ? "PUT" : "DELETE" }); }, [demo, liked, playback.track]);

  const playerReady = demo || Boolean(deviceId);
  const value = useMemo<SpotifyContextValue>(() => ({ authenticated, demo, ready, playerReady, profile, playback, deviceId, library, login: beginSpotifyLogin, enterDemo: () => { setDemo(true); setAuthenticated(true); setProfile({ display_name: "Visitante" }); }, logout: () => { tokenManager.clear(); setAuthenticated(false); setDemo(false); setProfile(null); setPlayback(initialPlayback); }, loadLibrary, loadDetails, search, playItem, activateDevice, toggle, previous, next, seek, setVolume, setShuffle, setRepeat, toggleLike, liked, error, clearError: () => setError("") }), [authenticated, demo, ready, playerReady, profile, playback, deviceId, library, loadLibrary, loadDetails, search, playItem, activateDevice, toggle, previous, next, seek, setVolume, setShuffle, setRepeat, toggleLike, liked, error]);
  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
}
