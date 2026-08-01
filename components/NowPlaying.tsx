"use client";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import { PlaybackControls } from "./PlaybackControls";
import { ProgressBar } from "./ProgressBar";

export function NowPlaying() {
  const { playback, seek, toggleLike, liked } = useSpotifyAuth();
  const track = playback.track;
  return <aside className="now-playing">
    <div className="panel-heading"><div><p className="eyebrow">NOW PLAYING</p><h2>Tocando agora</h2></div><span className="signal"><i /> HI-FI</span></div>
    <div className={`album-art ${track?.album.images?.[0]?.url ? "has-image" : ""}`}>
      {track?.album.images?.[0]?.url ? <img src={track.album.images[0].url} alt={`Capa de ${track.album.name}`} /> : <><div className="fallback-art"><span>VISUAL</span><b>♫</b><small>SPOTYMUSIC SESSIONS</small></div></>}
      <span className="album-sleeve-edge" />
    </div>
    <div className="track-info"><div><h3 title={track?.name || "Nenhuma faixa selecionada"}>{track?.name || "Escolha uma faixa"}</h3><p title={track?.artists.map(a => a.name).join(", ")}>{track?.artists.map(a => a.name).join(", ") || "Sua biblioteca está pronta"}</p><small>{track?.album.name || "Conecte o som e solte a agulha"}</small></div><button disabled={!track} className={liked ? "liked" : ""} onClick={toggleLike} aria-label={liked ? "Remover das curtidas" : "Curtir faixa"}>{liked ? "♥" : "♡"}</button></div>
    <ProgressBar position={playback.position} duration={playback.duration} onChange={seek} />
    <PlaybackControls />
    <div className="hi-fi-system" aria-label="Status do sistema Hi-Fi">
      <span className={`hi-fi-system-light ${playback.isPlaying ? "active" : ""}`} aria-hidden="true" />
      <div>
        <small>HI-FI SYSTEM</small>
        <strong title={track ? `${track.name} · ${track.album.name}` : "Aguardando seleção"}>
          {track ? `${track.name} · ${track.album.name}` : "Aguardando seleção"}
        </strong>
      </div>
    </div>
  </aside>;
}
