import type { Metadata } from "next";
import { cassetteImageSrc } from "./cassetteImage";
import styles from "./mobile-concept.module.css";

export const metadata: Metadata = {
  title: "Visual SpotyMusic — Conceito mobile",
  description: "Prévia isolada da interface mobile inspirada em toca-fitas.",
};

const controls = [
  { label: "Faixa anterior", icon: "◀◀" },
  { label: "Pausar", icon: "Ⅱ" },
  { label: "Reproduzir", icon: "▶", featured: true },
  { label: "Parar", icon: "■" },
  { label: "Próxima faixa", icon: "▶▶" },
];

export default function MobileConceptPage() {
  return (
    <main className={styles.previewPage}>
      <section className={styles.phone} aria-label="Prévia mobile do Visual SpotyMusic">
        <header className={styles.topBar}>
          <button type="button" aria-label="Abrir menu">☰</button>
          <div>
            <p>Visual SpotyMusic</p>
            <span>Mobile concept</span>
          </div>
          <button type="button" aria-label="Abrir equalizador">≋</button>
        </header>

        <section className={styles.cassetteDeck} aria-label="Fita cassete oficial do modo mobile">
          <img
            src={cassetteImageSrc}
            alt="Fita cassete preta com faixas retrô em creme, laranja, vermelho e amarelo"
            width="400"
            height="400"
            decoding="async"
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        </section>

        <section className={styles.nowPlaying}>
          <div>
            <span className={styles.status}><i /> Now playing</span>
            <h1>Visual Sessions</h1>
            <p>Visual SpotyMusic</p>
          </div>
          <div className={styles.vuMeter} aria-label="Medidor VU">
            <span>-20</span><span>-10</span><span>-3</span><span>0</span><span>3</span>
            <i />
            <strong>VU</strong>
          </div>
        </section>

        <section className={styles.progress} aria-label="Progresso da música">
          <span>01:24</span>
          <div><i /></div>
          <span>03:58</span>
        </section>

        <section className={styles.transport} aria-label="Controles de reprodução">
          {controls.map(control => (
            <button
              type="button"
              key={control.label}
              className={control.featured ? styles.featuredControl : undefined}
              aria-label={control.label}
            >
              {control.icon}
            </button>
          ))}
        </section>

        <section className={styles.mixer} aria-label="Controles analógicos">
          <div className={styles.knobBlock}>
            <span>Volume</span>
            <button type="button" className={styles.knob} aria-label="Volume"><i /></button>
            <small><b>Min</b><b>Max</b></small>
          </div>
          <div className={styles.faders}>
            <label><span>L</span><input type="range" min="0" max="100" defaultValue="58" aria-label="Canal esquerdo" /></label>
            <label><span>R</span><input type="range" min="0" max="100" defaultValue="58" aria-label="Canal direito" /></label>
          </div>
          <div className={styles.knobBlock}>
            <span>Tom</span>
            <button type="button" className={styles.knob} aria-label="Tom"><i /></button>
            <small><b>Low</b><b>High</b></small>
          </div>
        </section>

        <nav className={styles.bottomNav} aria-label="Navegação mobile">
          <button type="button" aria-label="Biblioteca">♫</button>
          <button type="button" className={styles.activeTab} aria-label="Toca-fitas">▣</button>
          <button type="button" aria-label="Playlists">☷</button>
          <button type="button" aria-label="Mais opções">•••</button>
        </nav>
      </section>

      <aside className={styles.note}>
        <span>Prévia protegida</span>
        <strong>Esta tela está isolada da versão oficial.</strong>
        <p>Primeiro aprovamos o visual. Depois conectamos os controles ao Spotify existente.</p>
      </aside>
    </main>
  );
}
