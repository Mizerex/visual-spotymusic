import { AppShell } from "@/components/AppShell";
import { SpotifyProvider } from "@/context/SpotifyProvider";
import { JamendoProvider } from "@/context/JamendoProvider";

export default function Home() {
  return (
    <SpotifyProvider>
      <JamendoProvider>
        <AppShell />
      </JamendoProvider>
    </SpotifyProvider>
  );
}
