import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { decks } from "@/db/schema";
import { getOwnedDeck, getPersistenceContext, getPublicDeck, parseDeck, PersistenceUnavailableError, toDeckRow, unavailableResponse } from "@/lib/deck-persistence";

type RouteContext = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    try {
      const ctx = await getPersistenceContext();
      const owned = await getOwnedDeck(ctx, id);
      if (owned) return Response.json({ ok: true, persistence: true, deck: owned });
    } catch (error) {
      if (!(error instanceof PersistenceUnavailableError)) throw error;
      if (error.reason === "database_not_configured") return unavailableResponse(error);
      // Auth can be missing for public share links; continue to public lookup.
    }

    const deck = await getPublicDeck(id);
    if (!deck) return Response.json({ ok: false, error: "Deck not found" }, { status: 404 });
    return Response.json({ ok: true, persistence: true, deck });
  } catch (error) {
    if (error instanceof PersistenceUnavailableError) return unavailableResponse(error);
    console.error("Failed to load deck", error);
    return Response.json({ ok: false, error: "Failed to load deck" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const ctx = await getPersistenceContext();
    const deck = parseDeck(await request.json());
    if (deck.id !== id) return Response.json({ ok: false, error: "Deck id mismatch" }, { status: 400 });

    const existing = await getOwnedDeck(ctx, id);
    if (!existing) return Response.json({ ok: false, error: "Deck not found" }, { status: 404 });

    await ctx.db.update(decks).set(toDeckRow(deck, ctx.userId)).where(and(eq(decks.id, id), eq(decks.userId, ctx.userId)));
    return Response.json({ ok: true, persistence: true, deck });
  } catch (error) {
    if (error instanceof PersistenceUnavailableError) return unavailableResponse(error);
    if (error instanceof z.ZodError) return Response.json({ ok: false, error: error.message }, { status: 400 });
    console.error("Failed to update deck", error);
    return Response.json({ ok: false, error: "Failed to update deck" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const ctx = await getPersistenceContext();
    await ctx.db.delete(decks).where(and(eq(decks.id, id), eq(decks.userId, ctx.userId)));
    return Response.json({ ok: true, persistence: true });
  } catch (error) {
    if (error instanceof PersistenceUnavailableError) return unavailableResponse(error);
    console.error("Failed to delete deck", error);
    return Response.json({ ok: false, error: "Failed to delete deck" }, { status: 500 });
  }
}
