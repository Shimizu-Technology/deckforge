export type DeckTheme = {
  id: string;
  name: string;
  description: string;
  background: string;
  card: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
};

export const themes: DeckTheme[] = [
  {
    id: "aurora",
    name: "Aurora",
    description: "Modern gradient for startup and product decks.",
    background: "from-slate-950 via-indigo-950 to-slate-900",
    card: "bg-white/10 border-white/15",
    text: "text-white",
    muted: "text-indigo-100/80",
    accent: "bg-cyan-300",
    accentText: "text-slate-950",
  },
  {
    id: "classroom",
    name: "Classroom",
    description: "Friendly, readable, and education-focused.",
    background: "from-amber-50 via-orange-50 to-rose-50",
    card: "bg-white/80 border-orange-200",
    text: "text-slate-950",
    muted: "text-slate-600",
    accent: "bg-orange-500",
    accentText: "text-white",
  },
  {
    id: "boardroom",
    name: "Boardroom",
    description: "Clean business deck with restrained contrast.",
    background: "from-zinc-50 via-white to-slate-100",
    card: "bg-white border-slate-200",
    text: "text-slate-950",
    muted: "text-slate-600",
    accent: "bg-slate-950",
    accentText: "text-white",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark technical style for engineering and AI topics.",
    background: "from-black via-zinc-950 to-blue-950",
    card: "bg-zinc-900/80 border-blue-400/20",
    text: "text-zinc-50",
    muted: "text-zinc-300",
    accent: "bg-blue-400",
    accentText: "text-black",
  },
];

export function getTheme(id?: string) {
  return themes.find((theme) => theme.id === id) ?? themes[0];
}
