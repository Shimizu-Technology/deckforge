import Link from "next/link";
import { ArrowRight, FileDown, PenLine, Sparkles } from "lucide-react";

const features = [
  [Sparkles, "Prompt/docs to deck", "Generate structured slides with speaker notes from a topic, notes, or pasted source material."],
  [PenLine, "Actually editable", "Edit titles, bullets, layouts, notes, and themes without touching a complex design canvas."],
  [FileDown, "Export practical files", "Present in the browser, print to PDF, or export PPTX for PowerPoint and Google Slides workflows."],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#22d3ee33,transparent_30%),radial-gradient(circle_at_70%_20%,#a78bfa33,transparent_25%)]" />
        <nav className="flex items-center justify-between">
          <div className="text-xl font-black tracking-tight">DeckForge</div>
          <div className="flex items-center gap-3">
            <Link href="/app" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-slate-200">Dashboard</Link>
            <Link href="/app/new" className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950">Create deck</Link>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-20 lg:grid-cols-[1fr_520px]">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">Gamma-lite, source-first, export-friendly.</p>
            <h1 className="max-w-4xl text-6xl font-black tracking-tight md:text-8xl">Make clean presentations in sixty seconds.</h1>
            <p className="mt-7 max-w-2xl text-xl leading-8 text-slate-300">DeckForge turns prompts, docs, notes, and markdown into practical presentations that are easy to edit and export. Built for teachers, students, and small businesses — not enterprise slide bureaucracy.</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/app/new" className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-4 font-black text-slate-950">Build the first deck <ArrowRight size={18} /></Link>
              <a href="https://github.com/Shimizu-Technology/deckforge" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-4 font-bold text-white">View GitHub</a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8">
              <div className="mb-20 inline-flex rounded-full bg-cyan-300 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-slate-950">AI deck</div>
              <h2 className="text-5xl font-black">Guam History for 8th Graders</h2>
              <ul className="mt-8 space-y-4 text-xl text-indigo-100">
                <li>• Ancient CHamoru navigation</li>
                <li>• Spanish colonial period</li>
                <li>• Modern identity and culture</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid gap-4 pb-10 md:grid-cols-3">
          {features.map(([Icon, title, body]) => (
            <div key={title as string} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <Icon className="mb-4 text-cyan-300" />
              <h3 className="text-xl font-black">{title as string}</h3>
              <p className="mt-2 text-slate-300">{body as string}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
