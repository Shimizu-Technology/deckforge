# DeckForge

AI-powered presentation maker by Shimizu Technology.

> Prompt, notes, markdown, or source docs → clean editable deck → PDF/PPTX/share link.

DeckForge is a practical, free-ish alternative to tools like Gamma, Canva Presentations, Beautiful.ai, SlidesAI, and Plus AI. The wedge is simple: fast source-to-deck generation with lightweight editing and good exports.

## Current MVP

- Next.js App Router + TypeScript + Tailwind.
- OpenRouter-powered deck generation with fallback demo generation.
- Structured slide editor.
- Four starter themes.
- Browser presentation mode.
- Print/PDF export flow.
- PPTX export route using PPTXGenJS.
- Clerk provider installed.
- Neon/Drizzle schema documented.

## Getting Started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For real AI generation, set:

```bash
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=google/gemini-2.5-flash-lite
```

Without an OpenRouter key, DeckForge returns a deterministic sample deck so the app is still demoable.

## Docs

- [Product Plan](docs/PRODUCT.md)
- [Technical Plan](docs/TECHNICAL_PLAN.md)

## Development scripts

```bash
npm run dev
npm run build
npm run lint
```

## Database

Neon + Drizzle is the chosen persistence layer. The schema lives in `src/db/schema.ts`.

Set `DATABASE_URL`, then run Drizzle migrations after adding migration scripts.

## Why not build PowerPoint?

Because that is the trap. DeckForge is content-first and template-driven. Users should edit meaning and structure, while themes handle presentation quality.
