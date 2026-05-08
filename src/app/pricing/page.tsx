"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2, Sparkles } from "lucide-react";

const features = [
  "Unlimited deck generation",
  "PPTX export",
  "AI slide visuals",
  "Private decks and public share links",
  "Future doc/PDF uploads",
];

async function startCheckout(interval: "monthly" | "yearly") {
  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interval }),
  });
  const payload = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !payload.url) throw new Error(payload.error ?? "Checkout failed");
  window.location.href = payload.url;
}

export default function PricingPage() {
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(interval: "monthly" | "yearly") {
    setLoading(interval);
    setError(null);
    try {
      await startCheckout(interval);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-xl font-black">DeckForge</Link>
          <Link href="/app/new" className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950">Create deck</Link>
        </nav>

        <section className="py-20 text-center">
          <p className="mx-auto mb-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100"><Sparkles size={16} />&nbsp; Free-ish now, SaaS-ready next</p>
          <h1 className="text-5xl font-black tracking-tight md:text-7xl">Simple pricing for fast decks.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">Keep the free tier generous for students and teachers. Pro unlocks heavier usage, exports, private decks, and image-heavy workflows.</p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-black">Free</h2>
            <p className="mt-2 text-slate-300">For trying it and occasional classroom/business decks.</p>
            <p className="mt-8 text-5xl font-black">$0</p>
            <ul className="mt-8 space-y-3 text-slate-200">
              <li className="flex gap-3"><Check className="text-cyan-300" /> 3 decks/month target</li>
              <li className="flex gap-3"><Check className="text-cyan-300" /> PDF/present mode</li>
              <li className="flex gap-3"><Check className="text-cyan-300" /> Local demo mode</li>
            </ul>
            <Link href="/app/new" className="mt-8 inline-flex rounded-full border border-white/15 px-5 py-3 font-bold">Start free</Link>
          </div>

          <div className="rounded-[2rem] border border-cyan-300/40 bg-cyan-300 p-8 text-slate-950 shadow-2xl shadow-cyan-950/40">
            <h2 className="text-3xl font-black">Pro</h2>
            <p className="mt-2 text-slate-800">For people who actually use this weekly.</p>
            <p className="mt-8 text-5xl font-black">$8<span className="text-xl">/mo</span></p>
            <ul className="mt-8 space-y-3">
              {features.map((feature) => <li key={feature} className="flex gap-3"><Check /> {feature}</li>)}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => void checkout("monthly")} disabled={loading !== null} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-black text-white disabled:opacity-60">{loading === "monthly" ? <Loader2 className="animate-spin" /> : null} Monthly</button>
              <button onClick={() => void checkout("yearly")} disabled={loading !== null} className="inline-flex items-center gap-2 rounded-full border border-slate-950/20 px-5 py-3 font-black disabled:opacity-60">{loading === "yearly" ? <Loader2 className="animate-spin" /> : null} Yearly</button>
            </div>
          </div>
        </div>

        {error ? <p className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-100">{error}</p> : null}
      </div>
    </main>
  );
}
