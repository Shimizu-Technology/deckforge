import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

export const pricing = {
  proMonthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
  proYearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
};
