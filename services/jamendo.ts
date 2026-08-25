import type { MusicTrack } from "@/types/music";

const JAMENDO_API_BASE = "https://api.jamendo.com/v3.0";

export type JamendoTrack = {
  id: string;
  name: string;
  duration: number;
  artist_id?: string;
  artist_name: string;
  album_id?: string;
  album_name?: string;
  album_image?: string;
  image?: string;
  audio: string;
  shareurl?: string;
};

type JamendoResponse<T> = {
  headers?: {
    status?: string;
    code?: number;
    error_message?: string;
  };
  results: T[];
};

function getClientId() {
  const clientId = process.env.NEXT_PUBLIC_JAMENDO_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error("Jamendo ainda não foi configurado. Defina NEXT_PUBLIC_JAMENDO_CLIENT_ID.");
  }
  return clientId;
}

function toMusicTrack(track: JamendoTrack): MusicTrack {
  const image = track.image || track.album_image || undefined;

  return {
    id: track.id,
    source: "jamendo",
    name: track.name,
    durationMs: Math.round(Number(track.duration || 0) * 1000),
    artists: [{ id: track.artist_id, name: track.artist_name }],
    album: track.album_name
      ? { id: track.album_id, name: track.album_name, image }
      : undefined,
    image,
    streamUrl: track.audio,
    externalUrl: track.shareurl,
  };
}

async function jamendoGet<T>(path: string, params: Record<string, string | number | undefined> = {}) {
  const query = new URLSearchParams({
    client_id: getClientId(),
    format: "json",
    ...Object.fromEntries(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    ),
  });

  const response = await fetch(`${JAMENDO_API_BASE}/${path}/?${query.toString()}`);
  if (!response.ok) throw new Error(`Jamendo respondeu com HTTP ${response.status}.`);

  const payload = (await response.json()) as JamendoResponse<T>;
  if (payload.headers?.status === "failed") {
    throw new Error(payload.headers.error_message || "Não foi possível consultar o Jamendo.");
  }

  return payload.results ?? [];
}

export async function getJamendoPopularTracks(limit = 30): Promise<MusicTrack[]> {
  const tracks = await jamendoGet<JamendoTrack>("tracks", {
    limit: Math.min(Math.max(limit, 1), 200),
    order: "popularity_total",
    include: "musicinfo",
    audioformat: "mp32",
    type: "single albumtrack",
  });

  return tracks.filter(track => Boolean(track.audio)).map(toMusicTrack);
}

export async function searchJamendoTracks(query: string, limit = 30): Promise<MusicTrack[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const tracks = await jamendoGet<JamendoTrack>("tracks", {
    limit: Math.min(Math.max(limit, 1), 200),
    search: trimmed,
    include: "musicinfo",
    audioformat: "mp32",
    type: "single albumtrack",
  });

  return tracks.filter(track => Boolean(track.audio)).map(toMusicTrack);
}

export async function getJamendoTracksByTag(tag: string, limit = 30): Promise<MusicTrack[]> {
  const trimmed = tag.trim();
  if (!trimmed) return [];

  const tracks = await jamendoGet<JamendoTrack>("tracks", {
    limit: Math.min(Math.max(limit, 1), 200),
    tags: trimmed,
    order: "popularity_total",
    include: "musicinfo",
    audioformat: "mp32",
    type: "single albumtrack",
  });

  return tracks.filter(track => Boolean(track.audio)).map(toMusicTrack);
}
