import { useSpotifyAuth } from "./useSpotifyAuth";
export function usePlaybackState() { return useSpotifyAuth().playback; }
