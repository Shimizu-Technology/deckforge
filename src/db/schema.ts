import { boolean, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { Deck } from "@/lib/deck-schema";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user id
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const decks = pgTable(
  "decks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    prompt: text("prompt"),
    themeId: text("theme_id").notNull().default("aurora"),
    content: jsonb("content").$type<Deck>().notNull(),
    isPublic: boolean("is_public").notNull().default(false),
    shareId: text("share_id").unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("decks_user_id_idx").on(table.userId), index("decks_share_id_idx").on(table.shareId)],
);

export const usageEvents = pgTable(
  "usage_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    event: text("event").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("usage_events_user_id_idx").on(table.userId)],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id").unique(),
    status: text("status").notNull().default("inactive"),
    priceId: text("price_id"),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("subscriptions_user_id_idx").on(table.userId), index("subscriptions_customer_idx").on(table.stripeCustomerId)],
);
