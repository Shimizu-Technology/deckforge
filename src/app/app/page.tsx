"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Deck } from "@/lib/deck-schema";
import { getLocalDecks } from "@/lib/storage";

export default function DashboardPage() {
  const [decks, setDecks] = useState<Deck[]>([]);

  useEffect(() => {
    queueMicrotask(() => setDecks(getLocalDecks()));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 py-8">
          <div>
            <Link href="/" className="text-sm text-cyan-200">← DeckForge</Link>
            <h1 className="mt-2 text-4xl font-black">Your decks</h1>
            <p className="mt-2 text-slate-300">Local MVP dashboard. Neon persistence is documented and ready to wire with env vars.</p>
          </div>
          <Link href="/app/new" className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 font-black text-slate-950"><Plus size={18} /> New deck</Link>
        </header>

        {decks.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <Link key={deck.id} href={`/app/decks/${deck.id}`} className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-300/60">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-200">{deck.slides.length} slides</p>
                <h2 className="mt-4 text-2xl font-black">{deck.title}</h2>
                <p className="mt-3 line-clamp-3 text-slate-300">{deck.description}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/20 bg-white/5 p-12 text-center">
            <h2 className="text-3xl font-black">No decks yet</h2>
            <p className="mt-3 text-slate-300">Create one from a prompt, lesson, proposal, or pasted notes.</p>
            <Link href="/app/new" className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-3 font-black text-slate-950">Create first deck</Link>
          </div>
        )}
      </div>
    </main>
  );
}
