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
- Neon/Drizzle persistence for authenticated users, with localStorage fallback when auth/database env vars are missing.

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

## Database + auth persistence

DeckForge saves decks through route handlers when both Clerk and Neon are configured:

- `GET /api/decks` lists the signed-in user's decks.
- `POST /api/decks` saves a generated deck.
- `GET /api/decks/:id` loads a deck owned by the signed-in user, or a public deck.
- `PUT /api/decks/:id` updates an owned deck.
- `DELETE /api/decks/:id` deletes an owned deck.

If `DATABASE_URL`, `CLERK_SECRET_KEY`, or a signed-in Clerk session is unavailable, the client automatically falls back to browser `localStorage` so demos still work.

Set `DATABASE_URL` and Clerk keys, then run:

```bash
npm run db:generate
npm run db:migrate
```

The initial migration lives in `drizzle/0000_left_jackpot.sql`.

## Why not build PowerPoint?

Because that is the trap. DeckForge is content-first and template-driven. Users should edit meaning and structure, while themes handle presentation quality.


## Billing

Stripe scaffolding is included:

- `POST /api/stripe/checkout` starts monthly/yearly Pro checkout.
- `POST /api/stripe/webhook` records subscription status changes.
- `/pricing` provides the initial pricing page.

Required env vars:

```bash
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_YEARLY_PRICE_ID=
```
