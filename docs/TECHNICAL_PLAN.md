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

Current schema lives in `src/db/schema.ts`.

MVP uses localStorage for immediate demo usability because no Neon env vars are committed. The next step is to replace localStorage reads/writes with route handlers backed by `decks.content` JSONB.

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

Required for persistence:

- `DATABASE_URL`

Required for auth:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

## Image generation

Route: `POST /api/generate-image`

DeckForge now uses slide `visualPrompt` fields to generate 16:9 slide visuals.

Flow:

1. User clicks **Generate** on a slide, or **Images** in the toolbar for the whole deck.
2. The app calls `/api/generate-image` with slide title, theme, and visual prompt.
3. The server calls OpenRouter with `modalities: ["image", "text"]`.
4. The route extracts a returned base64 image data URL.
5. If OpenRouter image generation is unavailable, the route returns a deterministic SVG fallback visual.
6. The image is stored in the slide JSON as `imageUrl` and rendered in web/PPTX exports.

Environment variable:

```bash
OPENROUTER_IMAGE_MODEL=openai/gpt-5.4-image-2
```

Because generated images can be large, the localStorage MVP can hit browser storage limits for image-heavy decks. Neon/S3/R2 storage should be added before production image-heavy usage.
