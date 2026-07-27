import { useSpotifyAuth } from "./useSpotifyAuth";
export function useLibrary() { const { library, loadLibrary, search } = useSpotifyAuth(); return { library, loadLibrary, search }; }
