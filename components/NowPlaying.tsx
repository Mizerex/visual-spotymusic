"use client";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import { PlaybackControls } from "./PlaybackControls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";

export function NowPlaying() {
  const { playback, seek, setVolume, toggleLike, liked } = useSpotifyAuth();
  const track = playback.track;
  return <aside className="now-playing">
    <div className="panel-heading"><div><p className="eyebrow">NOW PLAYING</p><h2>Tocando agora</h2></div><span className="signal"><i /> HI-FI</span></div>
    <div className={`album-art ${track?.album.images?.[0]?.url ? "has-image" : ""}`}>
      {track?.album.images?.[0]?.url ? <img src={track.album.images[0].url} alt={`Capa de ${track.album.name}`} /> : <><div className="fallback-art"><span>VISUAL</span><b>♫</b><small>SPOTYMUSIC SESSIONS</small></div></>}
      <span className="album-sleeve-edge" />
    </div>
    <div className="track-info"><div><h3 title={track?.name || "Nenhuma faixa selecionada"}>{track?.name || "Escolha uma faixa"}</h3><p title={track?.artists.map(a => a.name).join(", ")}>{track?.artists.map(a => a.name).join(", ") || "Sua biblioteca está pronta"}</p><small>{track?.album.name || "Conecte o som e solte a agulha"}</small></div><button className={liked ? "liked" : ""} onClick={toggleLike} aria-label={liked ? "Remover das curtidas" : "Curtir faixa"}>{liked ? "♥" : "♡"}</button></div>
    {track?.external_urls?.spotify && <a className="open-spotify" href={track.external_urls.spotify} target="_blank" rel="noreferrer">Abrir faixa no Spotify ↗</a>}
    <ProgressBar position={playback.position} duration={playback.duration} onChange={seek} />
    <PlaybackControls />
    <div className="now-footer"><span>VOLUME</span><VolumeControl value={playback.volume} onChange={setVolume} /></div>
    <div className="track-details"><p>TRACK INFO <span>›</span></p><div><small>ÁLBUM</small><strong>{track?.album.name || "—"}</strong><small>ARTISTA</small><strong>{track?.artists.map(a => a.name).join(", ") || "—"}</strong></div></div>
  </aside>;
}
