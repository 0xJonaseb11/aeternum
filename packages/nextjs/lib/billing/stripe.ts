import { NextRequest } from "next/server";
import Stripe from "stripe";
import type { PlanId } from "~~/lib/billing/plans";
import { getSupabase } from "~~/lib/supabase";

const secretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!secretKey) return null;
  if (!stripe) stripe = new Stripe(secretKey, { apiVersion: "2024-11-20.acacia" });
  return stripe;
}

export function getPriceId(plan: PlanId): string | null {
  switch (plan) {
    case "pro":
      return process.env.STRIPE_PRICE_PRO ?? null;
    case "business":
      return process.env.STRIPE_PRICE_BUSINESS ?? null;
    case "enterprise":
      return process.env.STRIPE_PRICE_ENTERPRISE ?? null;
    default:
      return null;
  }
}

/** Get or create Stripe customer for user; persist stripe_customer_id in subscriptions. */
export async function getOrCreateStripeCustomer(userId: string, email: string | null): Promise<string | null> {
  const s = getStripe();
  const supabase = getSupabase();
  if (!s || !supabase) return null;

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .not("stripe_customer_id", "is", null)
    .limit(1)
    .maybeSingle();

  if (sub?.stripe_customer_id) return sub.stripe_customer_id;

  const customer = await s.customers.create({
    email: email ?? undefined,
    metadata: { user_id: userId },
  });

  const { data: existingRow } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existingRow) {
    await supabase
      .from("subscriptions")
      .update({
        stripe_customer_id: customer.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingRow.id);
  } else {
    await supabase.from("subscriptions").insert({
      user_id: userId,
      plan: "free",
      status: "active",
      stripe_customer_id: customer.id,
    });
  }

  return customer.id;
}

/** Create Checkout session for upgrading to a plan. Returns session URL. */
export async function createCheckoutSession(
  userId: string,
  email: string | null,
  plan: PlanId,
  successUrl: string,
  cancelUrl: string,
): Promise<string | null> {
  const s = getStripe();
  const priceId = getPriceId(plan);
  if (!s || !priceId) return null;

  const customerId = await getOrCreateStripeCustomer(userId, email);
  if (!customerId) return null;

  const session = await s.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: { metadata: { user_id: userId, plan } },
    allow_promotion_codes: true,
  });

  return session.url;
}

/** Create Customer Portal session for managing subscription. Returns URL. */
export async function createPortalSession(customerId: string, returnUrl: string): Promise<string | null> {
  const s = getStripe();
  if (!s) return null;

  const session = await s.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}
