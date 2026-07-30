export type SpotifyImage = { url: string; width?: number; height?: number };
export type LibraryCategory = "playlists" | "albums" | "artists" | "tracks";

export type SpotifyTrack = {
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
  album: { id?: string; name: string; uri?: string; images: SpotifyImage[]; total_tracks?: number };
  artists: { name: string; uri?: string }[];
  external_urls?: { spotify?: string };
  track_number?: number;
  is_playable?: boolean;
};

export type LibraryItem = {
  id: string;
  uri: string;
  name: string;
  subtitle: string;
  image?: string;
  kind: "track" | "album" | "artist" | "playlist";
  track?: SpotifyTrack;
};

export type PlaybackSnapshot = {
  track: SpotifyTrack | null;
  isPlaying: boolean;
  stopped: boolean;
  queueIndex: number;
  queueLength: number;
  position: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: "off" | "context" | "track";
};

export type SpotifyTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

declare global {
  interface Window {
    Spotify?: {
      Player: new (config: {
        name: string;
        getOAuthToken: (callback: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayer;
    };
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

export type SpotifyPlayer = {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, callback: (payload: any) => void) => boolean;
  removeListener: (event?: string, callback?: (payload: any) => void) => boolean;
  togglePlay: () => Promise<void>;
  previousTrack: () => Promise<void>;
  nextTrack: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  activateElement: () => Promise<void>;
  getCurrentState: () => Promise<any | null>;
};
