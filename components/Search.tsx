"use client";
export function Search({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <label className="search-box"><span aria-hidden="true">⌕</span><span className="sr-only">Buscar no Spotify</span><input value={value} onChange={e => onChange(e.target.value)} placeholder="Buscar no Spotify" /></label>;
}
