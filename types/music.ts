export type MusicSource = "spotify" | "jamendo" | "subsonic" | "local";

export type MusicArtist = {
  id?: string;
  name: string;
};

export type MusicAlbum = {
  id?: string;
  name?: string;
  image?: string;
};

export type MusicTrack = {
  id: string;
  source: MusicSource;
  name: string;
  durationMs: number;
  artists: MusicArtist[];
  album?: MusicAlbum;
  image?: string;
  streamUrl?: string;
  externalUrl?: string;
};

export type MusicPlaybackSnapshot = {
  track: MusicTrack | null;
  isPlaying: boolean;
  stopped: boolean;
  position: number;
  duration: number;
  volume: number;
};
