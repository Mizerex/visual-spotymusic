type IconName = "home" | "compass" | "radio" | "search" | "playlist" | "album" | "artist" | "music" | "heart" | "menu" | "close" | "user" | "logout";
const icons: Record<IconName, string> = { home: "⌂", compass: "✥", radio: "◉", search: "⌕", playlist: "≡", album: "▣", artist: "♟", music: "♪", heart: "♡", menu: "☰", close: "×", user: "●", logout: "↗" };
export function Icon({ name }: { name: IconName }) { return <span className="icon" aria-hidden="true">{icons[name]}</span>; }
