import type { Deck, Slide } from "@/lib/deck-schema";
import { getTheme } from "@/lib/themes";

function BulletList({ bullets }: { bullets?: string[] }) {
  if (!bullets?.length) return null;
  return (
    <ul className="mt-7 space-y-3 text-left text-xl leading-relaxed">
      {bullets.map((bullet, index) => (
        <li key={`${bullet}-${index}`} className="flex gap-3">
          <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-current opacity-70" />
          <span>{bullet}</span>
        </li>
      ))}
    </ul>
  );
}

export function SlideRenderer({ slide, deck, compact = false }: { slide: Slide; deck: Deck; compact?: boolean }) {
  const theme = getTheme(deck.themeId);
  const scale = compact ? "min-h-[360px] p-8" : "min-h-[720px] p-14";

  return (
    <article className={`slide-page relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${theme.background} ${theme.text} shadow-2xl ${scale}`}>
      <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="relative z-10 flex min-h-[inherit] flex-col justify-between">
        <div>
          <div className={`mb-8 inline-flex rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] ${theme.accent} ${theme.accentText}`}>
            {slide.type}
          </div>
          <h2 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">{slide.title}</h2>
          {slide.subtitle ? <p className={`mt-5 max-w-3xl text-2xl leading-relaxed ${theme.muted}`}>{slide.subtitle}</p> : null}
          {slide.body ? <p className={`mt-7 max-w-3xl text-2xl leading-relaxed ${theme.muted}`}>{slide.body}</p> : null}

          {slide.type === "quote" ? (
            <blockquote className="mt-12 max-w-4xl border-l-4 border-current pl-8 text-4xl font-semibold leading-tight">
              “{slide.quote}”
              {slide.attribution ? <footer className={`mt-6 text-xl font-normal ${theme.muted}`}>— {slide.attribution}</footer> : null}
            </blockquote>
          ) : null}

          {slide.columns?.length ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {slide.columns.map((column, index) => (
                <div key={`${column.title}-${index}`} className={`rounded-3xl border p-6 backdrop-blur ${theme.card}`}>
                  <h3 className="text-2xl font-bold">{column.title}</h3>
                  <BulletList bullets={column.bullets} />
                </div>
              ))}
            </div>
          ) : (
            <BulletList bullets={slide.bullets} />
          )}
        </div>

        <div className={`mt-10 flex items-center justify-between text-sm ${theme.muted}`}>
          <span>{deck.title}</span>
          {slide.visualPrompt ? <span className="max-w-sm truncate">Visual: {slide.visualPrompt}</span> : null}
        </div>
      </div>
    </article>
  );
}
