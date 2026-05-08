import { z } from "zod";
import { decks } from "@/db/schema";
import { getPersistenceContext, listUserDecks, parseDeck, PersistenceUnavailableError, toDeckRow, unavailableResponse } from "@/lib/deck-persistence";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ctx = await getPersistenceContext();
    return Response.json({ ok: true, persistence: true, decks: await listUserDecks(ctx) });
  } catch (error) {
    if (error instanceof PersistenceUnavailableError) return unavailableResponse(error);
    console.error("Failed to list decks", error);
    return Response.json({ ok: false, error: "Failed to list decks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getPersistenceContext();
    const deck = parseDeck(await request.json());
    await ctx.db
      .insert(decks)
      .values({ ...toDeckRow(deck, ctx.userId), createdAt: new Date() })
      .onConflictDoUpdate({
        target: decks.id,
        set: toDeckRow(deck, ctx.userId),
      });

    return Response.json({ ok: true, persistence: true, deck });
  } catch (error) {
    if (error instanceof PersistenceUnavailableError) return unavailableResponse(error);
    if (error instanceof z.ZodError) return Response.json({ ok: false, error: error.message }, { status: 400 });
    console.error("Failed to save deck", error);
    return Response.json({ ok: false, error: "Failed to save deck" }, { status: 500 });
  }
}
