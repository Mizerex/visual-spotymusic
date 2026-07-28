import { AppShell } from "@/components/AppShell";
import { SpotifyProvider } from "@/context/SpotifyProvider";
export default function Home() { return <SpotifyProvider><AppShell /></SpotifyProvider>; }
