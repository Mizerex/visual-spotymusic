"use client";
import type { LibraryItem } from "@/types/spotify";

export function LibraryList({ items, selected, onPlay, emptyText = "Nada por aqui ainda." }: { items: LibraryItem[]; selected?: string; onPlay: (item: LibraryItem) => void; emptyText?: string }) {
  if (!items.length) return <div className="library-empty"><span>♫</span><p>{emptyText}</p></div>;
  return <div className="library-list">{items.map(item => <button key={`${item.kind}-${item.id}`} className={`library-item ${selected === item.id ? "selected" : ""}`} onClick={() => onPlay(item)}>
    <span className="thumb">{item.image ? <img src={item.image} alt="" onError={e => { e.currentTarget.style.display = "none"; }} /> : null}<i aria-hidden="true">♫</i></span>
    <span className="library-copy"><strong title={item.name}>{item.name}</strong><small>{item.subtitle}</small></span>
    <span className="row-play" aria-hidden="true">▶</span>
  </button>)}</div>;
}
