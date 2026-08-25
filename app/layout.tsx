import type { Metadata } from "next";
import Script from "next/script";
import { isValidAdSenseClientId, isValidAdSenseSlotId } from "@/lib/adsense";
import "./globals.css";
import "./responsive-desktop.css";

const title = "Visual SpotyMusic — Seu Spotify em uma experiência visual e analógica";
const description = "Uma experiência visual retrô premium para ouvir e enxergar sua biblioteca Spotify de um jeito mais tátil.";

export const metadata: Metadata = {
  metadataBase: new URL("https://visual-spotymusic-live.manomizer.chatgpt.site"),
  title,
  description,
  manifest: "/site.webmanifest",
  openGraph: { title, description, type: "website", images: [{ url: "/og.png", width: 1734, height: 907, alt: "Visual SpotyMusic em um toca-discos de madeira escura" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();
  const hasConfiguredSlot = [
    process.env.NEXT_PUBLIC_ADSENSE_LOGIN_RECTANGLE_SLOT,
    process.env.NEXT_PUBLIC_ADSENSE_LOGIN_BANNER_SLOT,
  ].some(isValidAdSenseSlotId);
  const shouldLoadAdsense = isValidAdSenseClientId(adsenseClientId) && hasConfiguredSlot;

  return <html lang="pt-BR"><body>
    {shouldLoadAdsense && <Script
      id="google-adsense"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
    />}
    {children}
  </body></html>;
}
