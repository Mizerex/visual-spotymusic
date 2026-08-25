"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MusicPlaybackSnapshot, MusicTrack } from "@/types/music";
import { getJamendoPopularTracks, getJamendoTracksByTag, searchJamendoTracks } from "@/services/jamendo";

type JamendoContextValue = {
  ready: boolean;
  playback: MusicPlaybackSnapshot;
  tracks: MusicTrack[];
  loading: boolean;
  error: string;
  loadPopular: (limit?: number) => Promise<void>;
  loadTag: (tag: string, limit?: number) => Promise<void>;
  search: (query: string, limit?: number) => Promise<void>;
  playTrack: (track: MusicTrack, queue?: MusicTrack[]) => Promise<void>;
  toggle: () => Promise<void>;
  stop: () => Promise<void>;
  previous: () => Promise<void>;
  next: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
};

export const JamendoContext = createContext<JamendoContextValue | null>(null);

const initialPlayback: MusicPlaybackSnapshot = {
  track: null,
  isPlaying: false,
  stopped: true,
  position: 0,
  duration: 0,
  volume: 0.75,
};

export function JamendoProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<MusicTrack[]>([]);
  const queueIndexRef = useRef(-1);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [playback, setPlayback] = useState<MusicPlaybackSnapshot>(initialPlayback);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.volume = initialPlayback.volume;
    audioRef.current = audio;

    const sync = () => {
      setPlayback(current => ({
        ...current,
        position: Number.isFinite(audio.currentTime) ? audio.currentTime * 1000 : 0,
        duration: Number.isFinite(audio.duration) ? audio.duration * 1000 : current.track?.durationMs || 0,
      }));
    };

    const onPlay = () => setPlayback(current => ({ ...current, isPlaying: true, stopped: false }));
    const onPause = () => setPlayback(current => ({ ...current, isPlaying: false }));
    const onEnded = () => void playQueueIndex(queueIndexRef.current + 1);
    const onError = () => setError("Não foi possível reproduzir esta faixa do Jamendo.");

    audio.addEventListener("timeupdate", sync);
    audio.addEventListener("loadedmetadata", sync);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    setReady(true);

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("timeupdate", sync);
      audio.removeEventListener("loadedmetadata", sync);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
    };
  }, []);

  const runLoad = useCallback(async (loader: () => Promise<MusicTrack[]>) => {
    setLoading(true);
    setError("");
    try {
      const result = await loader();
      setTracks(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível carregar músicas do Jamendo.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPopular = useCallback((limit = 30) => runLoad(() => getJamendoPopularTracks(limit)), [runLoad]);
  const loadTag = useCallback((tag: string, limit = 30) => runLoad(() => getJamendoTracksByTag(tag, limit)), [runLoad]);
  const search = useCallback((query: string, limit = 30) => runLoad(() => searchJamendoTracks(query, limit)), [runLoad]);

  const playQueueIndex = useCallback(async (index: number) => {
    const audio = audioRef.current;
    const queue = queueRef.current;
    if (!audio || !queue.length) return;

    const normalized = (index + queue.length) % queue.length;
    const track = queue[normalized];
    if (!track?.streamUrl) {
      setError("Esta faixa não possui uma URL de streaming disponível.");
      return;
    }

    queueIndexRef.current = normalized;
    setError("");
    setPlayback(current => ({
      ...current,
      track,
      position: 0,
      duration: track.durationMs,
      stopped: false,
    }));

    audio.src = track.streamUrl;
    audio.currentTime = 0;
    await audio.play();
  }, []);

  const playTrack = useCallback(async (track: MusicTrack, queue: MusicTrack[] = tracks) => {
    const effectiveQueue = queue.length ? queue : [track];
    queueRef.current = effectiveQueue;
    const index = effectiveQueue.findIndex(item => item.id === track.id && item.source === track.source);
    await playQueueIndex(index >= 0 ? index : 0);
  }, [playQueueIndex, tracks]);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !playback.track) return;
    if (audio.paused) await audio.play();
    else audio.pause();
  }, [playback.track]);

  const stop = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setPlayback(current => ({ ...current, isPlaying: false, stopped: true, position: 0 }));
  }, []);

  const previous = useCallback(async () => {
    await playQueueIndex(queueIndexRef.current - 1);
  }, [playQueueIndex]);

  const next = useCallback(async () => {
    await playQueueIndex(queueIndexRef.current + 1);
  }, [playQueueIndex]);

  const seek = useCallback(async (positionMs: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = Math.max(0, positionMs / 1000);
    audio.currentTime = Number.isFinite(audio.duration) ? Math.min(target, audio.duration) : target;
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    const audio = audioRef.current;
    const normalized = Math.max(0, Math.min(1, volume));
    if (audio) audio.volume = normalized;
    setPlayback(current => ({ ...current, volume: normalized }));
  }, []);

  const value = useMemo<JamendoContextValue>(() => ({
    ready,
    playback,
    tracks,
    loading,
    error,
    loadPopular,
    loadTag,
    search,
    playTrack,
    toggle,
    stop,
    previous,
    next,
    seek,
    setVolume,
  }), [error, loadPopular, loadTag, loading, next, playback, playTrack, previous, ready, search, seek, setVolume, stop, toggle, tracks]);

  return <JamendoContext.Provider value={value}>{children}</JamendoContext.Provider>;
}
