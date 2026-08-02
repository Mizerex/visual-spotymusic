import type { Metadata } from "next";
import styles from "./mobile-concept.module.css";

export const metadata: Metadata = {
  title: "Visual SpotyMusic — Interface mobile",
  description: "Versão consolidada da interface mobile do Visual SpotyMusic.",
};

const officialAssets = [
  { src: "/mobile-controls-official.png", alt: "Botões oficiais do player" },
  { src: "/mobile-vu-meter-official.png", alt: "VU meter oficial" },
  { src: "/mobile-volume-official.png", alt: "Controle de volume oficial" },
  { src: "/mobile-equalizer-official.png", alt: "Equalizador oficial" },
];

export default function MobileConceptPage() {
  return (
    <main className={styles.previewPage}>
      <section className={styles.interfaceFrame} aria-label="Interface mobile do Visual SpotyMusic">
        <img
          className={styles.interfaceImage}
          src="/mobile-interface-current.png"
          alt="Interface mobile do Visual SpotyMusic com fita cassete, música atual, VU meter, botões, equalizador, volume e navegação"
          width="422"
          height="725"
          decoding="sync"
        />

        <div className={styles.assetArchive} aria-hidden="true">
          {officialAssets.map((asset) => (
            <img key={asset.src} src={asset.src} alt={asset.alt} />
          ))}
        </div>
      </section>
    </main>
  );
}
