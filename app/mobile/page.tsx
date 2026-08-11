import type { Metadata } from "next";
import { SpotifyProvider } from "@/context/SpotifyProvider";
import { MobileCassettePlayer } from "../mobile-concept/MobileCassettePlayer";
import { CassetteArtistLabel } from "./CassetteArtistLabel";

export const metadata: Metadata = {
  title: "Visual SpotyMusic Mobile",
  description: "Versão mobile funcional do Visual SpotyMusic.",
};

export default function MobilePage() {
  return (
    <SpotifyProvider>
      <MobileCassettePlayer />
      <CassetteArtistLabel />
    </SpotifyProvider>
  );
}
