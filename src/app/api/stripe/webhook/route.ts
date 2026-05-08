import Stripe from "stripe";
import { getDb } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

function asDate(timestamp?: number | null) {
  return timestamp ? new Date(timestamp * 1000) : null;
}

async function upsertSubscription(subscription: Stripe.Subscription) {
  const db = getDb();
  if (!db) throw new Error("Database is not configured");

  const userId = subscription.metadata.clerkUserId;
  if (!userId) throw new Error("Missing Clerk user id on subscription metadata");

  await db.insert(users).values({ id: userId, updatedAt: new Date() }).onConflictDoNothing();

  const record = {
    userId,
    stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    priceId: subscription.items.data[0]?.price.id ?? null,
    currentPeriodEnd: asDate(subscription.items.data[0]?.current_period_end),
    updatedAt: new Date(),
  };

  await db
    .insert(subscriptions)
    .values(record)
    .onConflictDoUpdate({
      target: subscriptions.stripeSubscriptionId,
      set: record,
    });
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const db = getDb();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !db || !secret) return Response.json({ ok: false, error: "Stripe webhook is not configured" }, { status: 503 });

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ ok: false, error: "Missing Stripe signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await upsertSubscription(event.data.object);
      break;
    default:
      break;
  }

  return Response.json({ ok: true, received: true });
}
