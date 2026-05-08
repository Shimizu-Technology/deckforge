"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";
import type { Deck } from "@/lib/deck-schema";
import { saveLocalDeck } from "@/lib/storage";
import { themes } from "@/lib/themes";

export default function NewDeckPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("Create an 8-slide presentation about Guam history for middle school students.");
  const [sourceText, setSourceText] = useState("");
  const [audience, setAudience] = useState("teachers, students, and small business users");
  const [tone, setTone] = useState("clear, practical, polished");
  const [slideCount, setSlideCount] = useState(8);
  const [themeId, setThemeId] = useState("aurora");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, sourceText, audience, tone, slideCount, themeId }),
      });
      if (!response.ok) throw new Error(await response.text());
      const deck = (await response.json()) as Deck;
      saveLocalDeck(deck);
      router.push(`/app/decks/${deck.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-4xl py-8">
        <Link href="/app" className="text-sm text-cyan-200">← Dashboard</Link>
        <h1 className="mt-6 text-5xl font-black">Generate a deck</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">Tell DeckForge the topic, audience, tone, and optional source material. OpenRouter powers real generation when configured; otherwise the app falls back to a deterministic demo deck.</p>

        <form onSubmit={submit} className="mt-10 space-y-5 rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <label className="block">
            <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Prompt</span>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} required minLength={10} className="mt-2 min-h-32 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-lg outline-none focus:border-cyan-300" />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block"><span className="text-sm font-bold uppercase tracking-widest text-slate-400">Audience</span><input value={audience} onChange={(e) => setAudience(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 outline-none focus:border-cyan-300" /></label>
            <label className="block"><span className="text-sm font-bold uppercase tracking-widest text-slate-400">Tone</span><input value={tone} onChange={(e) => setTone(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 outline-none focus:border-cyan-300" /></label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block"><span className="text-sm font-bold uppercase tracking-widest text-slate-400">Slides</span><input type="number" min={3} max={16} value={slideCount} onChange={(e) => setSlideCount(Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 outline-none focus:border-cyan-300" /></label>
            <label className="block"><span className="text-sm font-bold uppercase tracking-widest text-slate-400">Theme</span><select value={themeId} onChange={(e) => setThemeId(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 outline-none focus:border-cyan-300">{themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name} — {theme.description}</option>)}</select></label>
          </div>

          <label className="block">
            <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Optional source text / notes</span>
            <textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} className="mt-2 min-h-40 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 outline-none focus:border-cyan-300" placeholder="Paste a proposal, lesson plan, meeting notes, markdown, etc." />
          </label>

          {error ? <p className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-100">{error}</p> : null}

          <button disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-4 font-black text-slate-950 disabled:opacity-60">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {loading ? "Generating..." : "Generate deck"}
          </button>
        </form>
      </div>
    </main>
  );
}
