"use client";

import { useEffect, useRef, useState } from "react";

type RadioStation = {
  stationuuid: string;
  name: string;
  url_resolved: string;
  favicon?: string;
  country?: string;
  tags?: string;
};

const genres = ["rock", "pop", "jazz", "blues", "classical", "electronic"] as const;

export function RadioConsole() {
  const [genre, setGenre] = useState<(typeof genres)[number]>("rock");
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState<RadioStation | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetch(`https://de1.api.radio-browser.info/json/stations/bytag/${encodeURIComponent(genre)}?hidebroken=true&order=votes&reverse=true&limit=18`)
      .then(response => {
        if (!response.ok) throw new Error("Não foi possível carregar as rádios agora.");
        return response.json();
      })
      .then((data: RadioStation[]) => {
        if (!active) return;
        setStations(data.filter(station => station.url_resolved));
      })
      .catch(reason => {
        if (!active) return;
        setStations([]);
        setError(reason instanceof Error ? reason.message : "Não foi possível carregar as rádios agora.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [genre]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const playStation = async (station: RadioStation) => {
    try {
      if (current?.stationuuid === station.stationuuid && audioRef.current) {
        if (playing) {
          audioRef.current.pause();
          setPlaying(false);
        } else {
          await audioRef.current.play();
          setPlaying(true);
        }
        return;
      }

      audioRef.current?.pause();
      const audio = new Audio(station.url_resolved);
      audio.preload = "none";
      audioRef.current = audio;
      setCurrent(station);
      setPlaying(true);
      setError("");
      audio.addEventListener("pause", () => setPlaying(false));
      audio.addEventListener("playing", () => setPlaying(true));
      audio.addEventListener("error", () => {
        setPlaying(false);
        setError("Esta estação não respondeu. Tente outra rádio.");
      });
      await audio.play();
    } catch {
      setPlaying(false);
      setError("Esta estação não pôde ser reproduzida. Tente outra rádio.");
    }
  };

  const stop = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setPlaying(false);
    setCurrent(null);
  };

  return (
    <section className="library-console" aria-label="Rádio online">
      <header className="library-console-heading">
        <div>
          <p className="eyebrow">RÁDIO ONLINE</p>
          <h2>Rádio</h2>
          <p className="library-console-category">Acesso livre para visitantes</p>
        </div>
        <span>{stations.length || "—"} estações</span>
      </header>

      <div className="category-tabs" style={{ marginBottom: 14 }}>
        {genres.map(item => (
          <button
            key={item}
            type="button"
            className={genre === item ? "active" : ""}
            onClick={() => setGenre(item)}
          >
            <span>{item.charAt(0).toUpperCase() + item.slice(1)}</span>
          </button>
        ))}
      </div>

      {current && (
        <div className="library-console-detail-actions">
          <button type="button" className="library-console-play-all" onClick={() => void playStation(current)}>
            {playing ? "❚❚ Pausar" : "▶ Continuar"}
          </button>
          <button type="button" className="library-console-back" onClick={stop}>■ Parar</button>
          <span style={{ alignSelf: "center" }}>No ar: <strong>{current.name}</strong></span>
        </div>
      )}

      {error && <p role="alert" style={{ margin: "10px 0" }}>{error}</p>}

      <div className="library-console-list">
        {loading ? (
          <div className="library-console-empty">
            <span>◌</span>
            <strong>Carregando rádios…</strong>
            <small>Buscando estações disponíveis.</small>
          </div>
        ) : stations.length ? stations.map(station => (
          <button
            key={station.stationuuid}
            type="button"
            className={current?.stationuuid === station.stationuuid ? "featured" : ""}
            onClick={() => void playStation(station)}
          >
            <span className="library-console-cover">
              {station.favicon ? <img src={station.favicon} alt="" /> : <i aria-hidden="true">◉</i>}
            </span>
            <span>
              <strong>{station.name}</strong>
              <small>{station.country || "Rádio online"}{station.tags ? ` · ${station.tags.split(",").slice(0, 2).join(", ")}` : ""}</small>
            </span>
            <b aria-hidden="true">{current?.stationuuid === station.stationuuid && playing ? "❚❚" : "▶"}</b>
          </button>
        )) : (
          <div className="library-console-empty">
            <span>◉</span>
            <strong>Nenhuma estação disponível</strong>
            <small>Tente outro estilo musical.</small>
          </div>
        )}
      </div>
    </section>
  );
}
