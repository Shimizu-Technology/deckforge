# DeckForge Technical Plan

## Stack choices

- **Next.js App Router**: full-stack SaaS app, API routes, server/client split.
- **TypeScript**: structured deck data and safe exports.
- **Tailwind CSS**: fast styling for app UI and slide themes.
- **Clerk**: auth provider of choice.
- **Neon Postgres**: managed serverless Postgres.
- **Drizzle ORM**: lightweight typed database layer.
- **OpenRouter**: model gateway for easy switching across OpenAI, Anthropic, Gemini, etc.
- **Zod**: validate AI output and API inputs.
- **PPTXGenJS**: PowerPoint export.

## Data architecture

Decks are modeled as structured JSON, not HTML. This makes it easy to edit, validate AI output, render in React, export to PPTX, and regenerate individual slides later.

## Database

Current schema lives in `src/db/schema.ts`; the first generated migration is `drizzle/0000_left_jackpot.sql`.

Deck reads/writes now go through route handlers backed by `decks.content` JSONB when both Neon and Clerk are configured. The browser storage layer still falls back to `localStorage` if `DATABASE_URL`, Clerk env vars, or a user session are missing, keeping the app demoable without secrets.

Routes:

- `GET /api/decks` — list current user's decks.
- `POST /api/decks` — validate and upsert a generated deck.
- `GET /api/decks/:id` — load an owned deck, or a public deck.
- `PUT /api/decks/:id` — update an owned deck.
- `DELETE /api/decks/:id` — delete an owned deck.

Suggested commands after `DATABASE_URL` is set:

```bash
npm run db:generate
npm run db:migrate
```

## AI generation

Route: `POST /api/generate`

Flow:

1. Validate input with Zod.
2. If `OPENROUTER_API_KEY` exists, request JSON output from OpenRouter.
3. Parse and validate the deck.
4. If generation fails, return deterministic fallback deck so the app stays usable.

## Export architecture

### PDF

MVP uses browser print styles. Later: server-side Playwright PDF rendering for consistent output.

### PPTX

Route: `POST /api/export/pptx`

The client sends the deck JSON. The server validates it and maps slide layouts to PowerPoint primitives with PPTXGenJS.

## Environment variables

See `.env.example`.

Required for real AI:

- `OPENROUTER_API_KEY`

Required for cloud persistence:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Without all three plus an active Clerk session, DeckForge intentionally uses browser `localStorage`.

## Image generation

Route: `POST /api/generate-image`

DeckForge now uses slide `visualPrompt` fields to generate 16:9 slide visuals.

Flow:

1. User clicks **Generate** on a slide, or **Images** in the toolbar for the whole deck.
2. The app calls `/api/generate-image` with slide title, theme, and visual prompt.
3. The server calls OpenRouter with `modalities: ["image", "text"]` when `OPENROUTER_IMAGE_MODEL` is configured.
4. The route extracts a returned base64 image data URL.
5. If OpenRouter image generation is unavailable, the route returns a deterministic SVG fallback visual.
6. The image is stored in the slide JSON as `imageUrl` and rendered in web/PPTX exports.

Environment variable:

```bash
# Pick an OpenRouter image-capable model explicitly. If omitted, DeckForge uses SVG fallback visuals.
OPENROUTER_IMAGE_MODEL=openai/gpt-5.4-image-2
```

Because generated images can be large, the localStorage MVP can hit browser storage limits for image-heavy decks. Neon/S3/R2 storage should be added before production image-heavy usage.

## Cloud persistence

Routes:

- `GET /api/decks` lists authenticated user's decks.
- `POST /api/decks` creates/upserts a deck for the authenticated user.
- `GET /api/decks/:id` loads an owned deck, or a public deck by id/share id.
- `PUT /api/decks/:id` updates an owned deck.
- `DELETE /api/decks/:id` deletes an owned deck.

The client storage module now tries server persistence first. If Clerk, Neon, or auth is unavailable, it falls back to localStorage so the app remains demoable locally.

Decks can be toggled public/private in the editor. Public links use `/d/:id` and load from Neon when available; local demo decks still work in the same browser through localStorage fallback.


## Billing and limits

Stripe is scaffolded but not enforced yet. The first implementation includes:

- `/pricing` for Free/Pro positioning.
- `POST /api/stripe/checkout` for Clerk-authenticated users.
- `POST /api/stripe/webhook` for subscription created/updated/deleted events.
- `subscriptions` table in Drizzle/Neon.

Next enforcement step: add a server helper that checks active subscription status and gates high-cost actions like unlimited generation, PPTX export, and image generation.
