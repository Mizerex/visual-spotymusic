import type { Metadata } from "next";
import Script from "next/script";
import { isValidAdSenseClientId, isValidAdSenseSlotId } from "@/lib/adsense";
import "./globals.css";
import "./responsive-desktop.css";

const title = "Visual Music — Sua música em uma experiência visual e analógica";
const description = "Uma experiência visual retrô premium para ouvir e enxergar sua música de um jeito mais tátil.";

export const metadata: Metadata = {
  metadataBase: new URL("https://visual-spotymusic-live.manomizer.chatgpt.site"),
  title,
  description,
  manifest: "/site.webmanifest",
  openGraph: { title, description, type: "website", images: [{ url: "/og.png", width: 1734, height: 907, alt: "Visual Music em um toca-discos de madeira escura" }] },
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
    <Script id="visual-music-brand-normalizer" strategy="afterInteractive">{`
      (() => {
        const replacements = [
          [/Visual SpotyMusic/g, 'Visual Music'],
          [/VISUAL SPOTYMUSIC/g, 'VISUAL MUSIC'],
          [/SpotyMusic/g, 'Visual Music']
        ];
        const replaceValue = value => replacements.reduce((text, [pattern, next]) => text.replace(pattern, next), value || '');
        const normalizeElement = element => {
          if (!(element instanceof Element)) return;
          for (const attribute of ['alt', 'aria-label', 'title']) {
            const value = element.getAttribute(attribute);
            if (value) element.setAttribute(attribute, replaceValue(value));
          }
        };
        const normalizeTree = root => {
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          let node;
          while ((node = walker.nextNode())) {
            const next = replaceValue(node.nodeValue);
            if (next !== node.nodeValue) node.nodeValue = next;
          }
          if (root instanceof Element) normalizeElement(root);
          if (root.querySelectorAll) root.querySelectorAll('[alt],[aria-label],[title]').forEach(normalizeElement);
        };
        normalizeTree(document.body);
        new MutationObserver(mutations => {
          for (const mutation of mutations) {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.TEXT_NODE) {
                const next = replaceValue(node.nodeValue);
                if (next !== node.nodeValue) node.nodeValue = next;
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                normalizeTree(node);
              }
            });
          }
        }).observe(document.body, { childList: true, subtree: true });
      })();
    `}</Script>
    {children}
  </body></html>;
}
