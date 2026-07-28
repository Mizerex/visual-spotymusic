import type { Metadata } from "next";
import "./globals.css";

const title = "Visual SpotyMusic — Seu Spotify em uma experiência visual e analógica";
const description = "Uma experiência visual retrô premium para ouvir e enxergar sua biblioteca Spotify de um jeito mais tátil.";

export const metadata: Metadata = {
  metadataBase: new URL("https://visual-spotymusic.manomizer.chatgpt.site"),
  title,
  description,
  manifest: "/site.webmanifest",
  openGraph: { title, description, type: "website", images: [{ url: "/og.png", width: 1734, height: 907, alt: "Visual SpotyMusic em um toca-discos de madeira escura" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
