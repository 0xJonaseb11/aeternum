import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import type { PlanId } from "~~/lib/billing/plans";
import { getStripe } from "~~/lib/billing/stripe";
import { logger } from "~~/lib/logger";
import { getSupabase } from "~~/lib/supabase";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function stripeStatusToOur(status: Stripe.Subscription.Status): string {
  switch (status) {
    case "active":
    case "trialing":
      return status;
    case "past_due":
    case "canceled":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
    case "paused":
      return status === "canceled" ? "canceled" : "past_due";
    default:
      return "active";
  }
}

function planFromPriceId(priceId: string): PlanId {
  if (process.env.STRIPE_PRICE_PRO && priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (process.env.STRIPE_PRICE_BUSINESS && priceId === process.env.STRIPE_PRICE_BUSINESS) return "business";
  if (process.env.STRIPE_PRICE_ENTERPRISE && priceId === process.env.STRIPE_PRICE_ENTERPRISE) return "enterprise";
  return "pro";
}

export async function POST(req: NextRequest) {
  if (!webhookSecret || !getStripe()) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }
  let event: Stripe.Event;
  try {
    event = getStripe()!.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    logger.error("Stripe webhook construction failed", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      if (!userId) break;
      const plan =
        (sub.metadata?.plan as PlanId) ||
        (sub.items?.data?.[0]?.price?.id ? planFromPriceId(sub.items.data[0].price.id) : ("pro" as PlanId));
      const status = stripeStatusToOur(sub.status);
      const periodEnd = (sub as any).current_period_end ? new Date((sub as any).current_period_end * 1000).toISOString() : null;
      const amount = sub.items?.data?.[0]?.price?.unit_amount || 0;

      const { data: existing, error: fetchError } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        logger.error("Failed to fetch existing subscription in webhook", { userId, error: fetchError.message });
        break;
      }

      if (existing) {
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            plan,
            status,
            stripe_subscription_id: sub.id,
            current_period_end: periodEnd,
            amount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateError) {
          logger.error("Failed to update subscription in webhook", { userId, error: updateError.message });
        }
      } else {
        const { error: insertError } = await supabase.from("subscriptions").insert({
          user_id: userId,
          plan,
          status,
          stripe_subscription_id: sub.id,
          current_period_end: periodEnd,
          amount,
        });

        if (insertError) {
          logger.error("Failed to insert subscription in webhook", { userId, error: insertError.message });
        }
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      if (!userId) break;
      const { error: deleteError } = await supabase
        .from("subscriptions")
        .update({
          plan: "free",
          status: "canceled",
          stripe_subscription_id: null,
          current_period_end: null,
          amount: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (deleteError) {
        logger.error("Failed to process subscription deletion in webhook", { userId, error: deleteError.message });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
