import type { Metadata } from "next";
import { SpotifyProvider } from "@/context/SpotifyProvider";
import { MobileCassettePlayer } from "./MobileCassettePlayer";
import "./cassette-overlay.css";

export const metadata: Metadata = {
  title: "Visual SpotyMusic — Interface mobile",
  description: "Versão funcional da interface mobile do Visual SpotyMusic.",
};

export default function MobileConceptPage() {
  return (
    <SpotifyProvider>
      <MobileCassettePlayer />
    </SpotifyProvider>
  );
}
