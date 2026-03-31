import Stripe from "stripe";
import type { PlanId } from "~~/lib/billing/plans";
import { getSupabase } from "~~/lib/supabase";

const secretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!secretKey) return null;
  if (!stripe) stripe = new Stripe(secretKey, { apiVersion: "2026-03-25.dahlia" });
  return stripe;
}

export function getPriceId(plan: PlanId, type?: "standard" | "discounted"): string | null {
  switch (plan) {
    case "pro":
      return process.env.STRIPE_PRICE_PRO ?? null;
    case "business":
      return process.env.STRIPE_PRICE_BUSINESS ?? null;
    case "enterprise":
      return type === "discounted"
        ? (process.env.STRIPE_PRICE_ENTERPRISE_DISCOUNTED ?? null)
        : (process.env.STRIPE_PRICE_ENTERPRISE ?? null);
    default:
      return null;
  }
}

export async function getOrCreateStripeCustomer(userId: string, email: string | null): Promise<string | null> {
  try {
    const s = getStripe();
    const supabase = getSupabase();
    if (!s || !supabase) {
      console.error("[Stripe] Stripe secret key or Supabase credentials missing");
      return null;
    }

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
  } catch (err) {
    console.error("[Stripe] Error in getOrCreateStripeCustomer:", err);
    throw err;
  }
}

export async function createCheckoutSession(
  userId: string,
  email: string | null,
  plan: PlanId,
  successUrl: string,
  cancelUrl: string,
  priceOption?: string,
): Promise<string | null> {
  try {
    const s = getStripe();

    let priceId: string | null = null;
    if (priceOption === "standard" || priceOption === "discounted") {
      priceId = getPriceId(plan, priceOption);
    } else if (priceOption?.startsWith("price_")) {
      priceId = priceOption;
    } else {
      priceId = getPriceId(plan);
    }

    if (!s || !priceId) {
      console.error(
        `[Stripe] stripe client (${!!s}) or priceId (${priceId}) missing for plan ${plan} (option: ${priceOption})`,
      );
      return null;
    }

    const customerId = await getOrCreateStripeCustomer(userId, email);
    if (!customerId) {
      console.error("[Stripe] Failed to get or create customerId");
      return null;
    }

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
  } catch (err) {
    console.error("[Stripe] Error in createCheckoutSession:", err);
    throw err;
  }
}

export async function createPortalSession(customerId: string, returnUrl: string): Promise<string | null> {
  const s = getStripe();
  if (!s) return null;

  const session = await s.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}
