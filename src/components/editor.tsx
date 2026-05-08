"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, FileText, ImageIcon, Loader2, MonitorPlay, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import type { Deck, Slide } from "@/lib/deck-schema";
import { getLocalDeck, saveLocalDeck } from "@/lib/storage";
import { themes } from "@/lib/themes";
import { SlideRenderer } from "./slide-renderer";

function emptySlide(): Slide {
  return {
    id: nanoid(),
    type: "bullets",
    title: "New slide",
    bullets: ["First point", "Second point"],
    columns: [],
    speakerNotes: "",
  };
}

export function DeckEditor({ id }: { id: string }) {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingAllImages, setGeneratingAllImages] = useState(false);
  const active = deck?.slides[activeIndex];

  useEffect(() => {
    queueMicrotask(() => setDeck(getLocalDeck(id)));
  }, [id]);

  const markdown = useMemo(() => {
    if (!deck) return "";
    return deck.slides
      .map((slide) => [`# ${slide.title}`, slide.subtitle, slide.body, ...(slide.bullets ?? []).map((b) => `- ${b}`), slide.speakerNotes ? `Notes: ${slide.speakerNotes}` : ""].filter(Boolean).join("\n"))
      .join("\n\n---\n\n");
  }, [deck]);

  function persist(next: Deck) {
    const updated = { ...next, updatedAt: new Date().toISOString() };
    setDeck(updated);
    saveLocalDeck(updated);
  }

  function updateActive(patch: Partial<Slide>) {
    if (!deck || !active) return;
    const slides = deck.slides.map((slide, index) => (index === activeIndex ? { ...slide, ...patch } : slide));
    persist({ ...deck, slides });
  }

  async function requestSlideImage(slide: Slide, themeId: string) {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: slide.visualPrompt || `${slide.title}. ${slide.subtitle || ""} ${(slide.bullets || []).join(", ")}`,
        title: slide.title,
        themeId,
      }),
    });
    if (!response.ok) throw new Error(await response.text());
    return (await response.json()) as { imageUrl: string; provider: string };
  }

  async function generateImageForSlide(index = activeIndex) {
    if (!deck) return;
    const slide = deck.slides[index];
    if (!slide) return;
    setGeneratingImage(true);
    try {
      const result = await requestSlideImage(slide, deck.themeId);
      const slides = deck.slides.map((item, slideIndex) =>
        slideIndex === index
          ? { ...item, imageUrl: result.imageUrl, imageAlt: item.visualPrompt || item.title }
          : item,
      );
      persist({ ...deck, slides });
    } finally {
      setGeneratingImage(false);
    }
  }

  async function generateImagesForAllSlides() {
    if (!deck) return;
    setGeneratingAllImages(true);
    try {
      let nextDeck = deck;
      for (let index = 0; index < nextDeck.slides.length; index += 1) {
        const slide = nextDeck.slides[index];
        if (!slide) continue;
        // Serialize image calls to avoid hammering OpenRouter/provider limits.
        const result = await requestSlideImage(slide, nextDeck.themeId);
        const slides = nextDeck.slides.map((item, slideIndex) =>
          slideIndex === index
            ? { ...item, imageUrl: result.imageUrl, imageAlt: item.visualPrompt || item.title }
            : item,
        );
        nextDeck = { ...nextDeck, slides };
        persist(nextDeck);
      }
    } finally {
      setGeneratingAllImages(false);
    }
  }

  async function exportPptx() {
    if (!deck) return;
    const response = await fetch("/api/export/pptx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deck),
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${deck.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "deck"}.pptx`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!deck) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold">Deck not found</h1>
          <p className="mt-3 text-slate-300">This MVP stores decks locally in your browser until Neon persistence is configured.</p>
          <Link className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950" href="/app/new">Create a deck</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <Link href="/app" className="text-sm text-cyan-200">← Dashboard</Link>
            <input className="block w-full bg-transparent text-2xl font-black outline-none" value={deck.title} onChange={(event) => persist({ ...deck, title: event.target.value })} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold"><FileText size={16} /> PDF</button>
            <button onClick={generateImagesForAllSlides} disabled={generatingAllImages} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold disabled:opacity-60">{generatingAllImages ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} Images</button>
            <button onClick={exportPptx} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold"><Download size={16} /> PPTX</button>
            <Link href={`/d/${deck.id}`} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold"><MonitorPlay size={16} /> Present</Link>
            <button onClick={() => persist(deck)} className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950"><Save size={16} /> Saved</button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-[220px_1fr_360px]">
        <aside className="space-y-3">
          {deck.slides.map((slide, index) => (
            <button key={slide.id} onClick={() => setActiveIndex(index)} className={`w-full rounded-2xl border p-3 text-left ${index === activeIndex ? "border-cyan-300 bg-cyan-300/10" : "border-white/10 bg-white/5"}`}>
              <p className="text-xs text-slate-400">Slide {index + 1}</p>
              <p className="line-clamp-2 font-bold">{slide.title}</p>
            </button>
          ))}
          <button onClick={() => persist({ ...deck, slides: [...deck.slides, emptySlide()] })} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 p-4 text-sm font-bold text-slate-300"><Plus size={16} /> Add slide</button>
        </aside>

        <section className="space-y-6">
          {active ? <SlideRenderer slide={active} deck={deck} /> : null}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-bold">Markdown/source view</h2>
            <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-2xl bg-black/30 p-4 text-sm text-slate-300">{markdown}</pre>
          </div>
        </section>

        {active ? (
          <aside className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Theme</label>
              <select className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 p-3" value={deck.themeId} onChange={(event) => persist({ ...deck, themeId: event.target.value })}>
                {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Layout</label>
              <select className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 p-3" value={active.type} onChange={(event) => updateActive({ type: event.target.value as Slide["type"] })}>
                {['title','section','bullets','twoColumn','quote','comparison','timeline','closing'].map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <label className="block"><span className="text-xs font-bold uppercase tracking-widest text-slate-400">Title</span><input className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 p-3" value={active.title} onChange={(e) => updateActive({ title: e.target.value })} /></label>
            <label className="block"><span className="text-xs font-bold uppercase tracking-widest text-slate-400">Subtitle</span><input className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 p-3" value={active.subtitle ?? ""} onChange={(e) => updateActive({ subtitle: e.target.value })} /></label>
            <label className="block"><span className="text-xs font-bold uppercase tracking-widest text-slate-400">Bullets</span><textarea className="mt-2 min-h-36 w-full rounded-xl border border-white/10 bg-slate-900 p-3" value={(active.bullets ?? []).join("\n")} onChange={(e) => updateActive({ bullets: e.target.value.split("\n").filter(Boolean) })} /></label>
            <label className="block"><span className="text-xs font-bold uppercase tracking-widest text-slate-400">Visual prompt</span><textarea className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-slate-900 p-3" value={active.visualPrompt ?? ""} onChange={(e) => updateActive({ visualPrompt: e.target.value })} /></label>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Slide image</span>
                <button onClick={() => generateImageForSlide()} disabled={generatingImage} className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-3 py-2 text-xs font-black text-slate-950 disabled:opacity-60">
                  {generatingImage ? <Loader2 className="animate-spin" size={14} /> : <ImageIcon size={14} />}
                  {active.imageUrl ? "Regenerate" : "Generate"}
                </button>
              </div>
              {active.imageUrl ? (
                <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={active.imageUrl} alt={active.imageAlt ?? active.title} className="aspect-video w-full object-cover" />
                </div>
              ) : <p className="mt-3 text-sm text-slate-400">No image yet. Generate from the visual prompt.</p>}
            </div>
            <label className="block"><span className="text-xs font-bold uppercase tracking-widest text-slate-400">Speaker notes</span><textarea className="mt-2 min-h-28 w-full rounded-xl border border-white/10 bg-slate-900 p-3" value={active.speakerNotes ?? ""} onChange={(e) => updateActive({ speakerNotes: e.target.value })} /></label>
            <button onClick={() => {
              if (!deck) return;
              const slides = deck.slides.filter((_, index) => index !== activeIndex);
              persist({ ...deck, slides: slides.length ? slides : [emptySlide()] });
              setActiveIndex(Math.max(0, activeIndex - 1));
            }} className="inline-flex items-center gap-2 rounded-full border border-red-400/30 px-4 py-2 text-sm font-bold text-red-200"><Trash2 size={16} /> Delete slide</button>
          </aside>
        ) : null}
      </div>
    </main>
  );
}
