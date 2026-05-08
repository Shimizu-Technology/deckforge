"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Deck } from "@/lib/deck-schema";
import { getDeck } from "@/lib/storage";
import { SlideRenderer } from "./slide-renderer";

export function PresentDeck({ id }: { id: string }) {
  const [deck, setDeck] = useState<Deck | null>(null);

  useEffect(() => {
    let mounted = true;
    void getDeck(id).then((result) => {
      if (mounted) setDeck(result.deck);
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!deck) {
    return <main className="min-h-screen bg-slate-950 p-8 text-white"><Link href="/app" className="text-cyan-200">← Back</Link><h1 className="mt-8 text-4xl font-black">Deck not found: {id}</h1></main>;
  }

  return (
    <main className="bg-slate-950 p-6 text-white">
      <div className="no-print sticky top-0 z-20 mb-6 flex items-center justify-between rounded-full border border-white/10 bg-slate-900/90 px-5 py-3 backdrop-blur">
        <Link href={`/app/decks/${deck.id}`} className="text-sm text-cyan-200">← Edit</Link>
        <button onClick={() => window.print()} className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950">Print / PDF</button>
      </div>
      <div className="mx-auto max-w-6xl space-y-8">
        {deck.slides.map((slide) => <SlideRenderer key={slide.id} slide={slide} deck={deck} />)}
      </div>
    </main>
  );
}
