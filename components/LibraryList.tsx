"use client";
import { useEffect, useState } from "react";
import type { LibraryItem } from "@/types/spotify";

function LibraryThumbnail({ image, name }: { image?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [image]);
  const showImage = Boolean(image?.trim()) && !failed;
  return <span className={`thumb ${showImage ? "" : "thumb--fallback"}`}>
    {showImage ? <img src={image} alt={`Capa de ${name}`} onError={() => setFailed(true)} /> : null}
    <i aria-hidden="true">♫</i>
  </span>;
}

export function LibraryList({ items, selected, onPlay, emptyText = "Nada por aqui ainda." }: { items: LibraryItem[]; selected?: string; onPlay: (item: LibraryItem) => void; emptyText?: string }) {
  if (!items.length) return <div className="library-empty"><span>♫</span><p>{emptyText}</p></div>;
  return <div className="library-list">{items.map(item => <button key={`${item.kind}-${item.id}`} className={`library-item ${selected === item.id ? "selected" : ""}`} onClick={() => onPlay(item)}>
    <LibraryThumbnail image={item.image} name={item.name} />
    <span className="library-copy"><strong title={item.name}>{item.name}</strong><small>{item.subtitle}</small></span>
    <span className="row-play" aria-hidden="true">▶</span>
  </button>)}</div>;
}
