import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq, or } from "drizzle-orm";
import { getDb } from "@/db";
import { decks, users } from "@/db/schema";
import { DeckSchema, type Deck } from "./deck-schema";

type PersistenceContext = {
  db: NonNullable<ReturnType<typeof getDb>>;
  userId: string;
  email: string | null;
};

export type PersistenceUnavailableReason = "database_not_configured" | "auth_not_configured" | "unauthenticated";

export class PersistenceUnavailableError extends Error {
  constructor(public reason: PersistenceUnavailableReason) {
    super(reason);
  }
}

export async function getPersistenceContext(): Promise<PersistenceContext> {
  const db = getDb();
  if (!db) throw new PersistenceUnavailableError("database_not_configured");
  if (!process.env.CLERK_SECRET_KEY) throw new PersistenceUnavailableError("auth_not_configured");

  const user = await currentUser();
  if (!user) throw new PersistenceUnavailableError("unauthenticated");

  const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
  await db
    .insert(users)
    .values({ id: user.id, email, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: users.id,
      set: { email, updatedAt: new Date() },
    });

  return { db, userId: user.id, email };
}

export function unavailableResponse(error: PersistenceUnavailableError) {
  const status = error.reason === "unauthenticated" ? 401 : 503;
  return Response.json({ ok: false, persistence: false, reason: error.reason }, { status });
}

export function toDeckRow(deck: Deck, userId: string) {
  const now = new Date();
  return {
    id: deck.id,
    userId,
    title: deck.title,
    prompt: deck.prompt ?? null,
    themeId: deck.themeId,
    content: deck,
    isPublic: deck.isPublic ?? false,
    updatedAt: now,
  };
}

export function parseDeck(input: unknown): Deck {
  const deck = DeckSchema.parse(input);
  return {
    ...deck,
    updatedAt: new Date().toISOString(),
  };
}

export async function listUserDecks(ctx: PersistenceContext) {
  const rows = await ctx.db
    .select({ content: decks.content })
    .from(decks)
    .where(eq(decks.userId, ctx.userId))
    .orderBy(desc(decks.updatedAt));

  return rows.map((row) => DeckSchema.parse(row.content));
}

export async function getOwnedDeck(ctx: PersistenceContext, id: string) {
  const [row] = await ctx.db
    .select({ content: decks.content })
    .from(decks)
    .where(and(eq(decks.id, id), eq(decks.userId, ctx.userId)))
    .limit(1);

  return row ? DeckSchema.parse(row.content) : null;
}

export async function getPublicDeck(idOrShareId: string) {
  const db = getDb();
  if (!db) throw new PersistenceUnavailableError("database_not_configured");

  const [row] = await db
    .select({ content: decks.content })
    .from(decks)
    .where(and(eq(decks.isPublic, true), or(eq(decks.id, idOrShareId), eq(decks.shareId, idOrShareId))))
    .limit(1);

  return row ? DeckSchema.parse(row.content) : null;
}

export async function getReadableDeck(ctx: PersistenceContext, id: string) {
  const [row] = await ctx.db
    .select({ content: decks.content })
    .from(decks)
    .where(and(eq(decks.id, id), or(eq(decks.userId, ctx.userId), eq(decks.isPublic, true))))
    .limit(1);

  return row ? DeckSchema.parse(row.content) : null;
}
