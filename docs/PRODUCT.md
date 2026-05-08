# DeckForge Product Plan

DeckForge is a free-ish AI presentation maker for people who need a useful deck fast: teachers, students, small business owners, founders, and client-facing teams.

## Why this exists

The presentation category is crowded, but the mainstream tools split into two awkward camps:

- Full design suites like Canva that can do everything but are not optimized for fast source-to-deck workflows.
- AI deck generators like Gamma/SlidesAI that are useful, but often feel generic, expensive, or locked into their own editor.

DeckForge's wedge is practical:

> Prompt, notes, markdown, or source docs → clean editable deck → PDF/PPTX/share link.

We are explicitly **not** cloning PowerPoint. The product is content-first and template-driven.

## MVP promise

A user should be able to:

1. Enter a topic or paste source text.
2. Choose audience, tone, slide count, and theme.
3. Generate a structured deck through OpenRouter.
4. Edit slide content in a simple structured editor.
5. Present in the browser.
6. Export PDF via print flow.
7. Export PPTX for PowerPoint/Google Slides.

## Target users

- Teachers creating lesson decks.
- Students creating school presentations.
- Small businesses creating proposals, pitches, and reports.
- Founders and agencies turning notes into quick decks.

## Product principles

1. **Source-first**: The source structure matters more than pixel dragging.
2. **Templates over canvases**: Users edit content; templates make it look good.
3. **Exports are first-class**: PPTX and PDF cannot be afterthoughts.
4. **Cheap/free enough to matter**: Accessible to educators and small teams.
5. **No bloat before validation**: Collaboration, analytics, brand kits, and animation come later.

## MVP scope

Included:

- Landing page.
- Local dashboard.
- Prompt/source generation form.
- OpenRouter generation with deterministic fallback.
- Structured JSON deck model.
- Slide editor.
- Four starter themes.
- Browser present mode.
- Print/PDF flow.
- PPTX export route.
- Neon/Drizzle schema.
- Clerk provider setup.

Deferred:

- Full server persistence.
- Stripe billing.
- Uploading PDF/DOCX.
- Realtime collaboration.
- Brand kits.
- Analytics.
- Comments/version history.
- Image generation and stock search.

## V1 roadmap

1. Wire Clerk user identity into dashboard routes.
2. Persist decks to Neon instead of localStorage.
3. Add share IDs backed by database records.
4. Add Stripe limits: free decks/month, pro unlimited, PPTX gating if desired.
5. Improve PPTX fidelity per theme/layout.
6. Add PDF/DOCX upload parsing.
7. Add regenerate slide / shorten / expand actions.
8. Add 10 polished templates.
