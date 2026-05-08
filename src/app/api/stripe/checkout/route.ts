import { currentUser } from "@clerk/nextjs/server";
import { getStripe, pricing } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) return Response.json({ ok: false, error: "Stripe is not configured" }, { status: 503 });

  const user = await currentUser();
  if (!user) return Response.json({ ok: false, error: "Sign in required" }, { status: 401 });

  const { interval = "monthly" } = (await request.json().catch(() => ({}))) as { interval?: "monthly" | "yearly" };
  const priceId = interval === "yearly" ? pricing.proYearlyPriceId : pricing.proMonthlyPriceId;
  if (!priceId) return Response.json({ ok: false, error: `Missing Stripe ${interval} price id` }, { status: 503 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/app?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancelled`,
    metadata: { clerkUserId: user.id },
    subscription_data: { metadata: { clerkUserId: user.id } },
  });

  return Response.json({ ok: true, url: session.url });
}
