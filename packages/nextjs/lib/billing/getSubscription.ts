import type { PlanId } from "~~/lib/billing/plans";
import { getSupabase } from "~~/lib/supabase";

export type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: PlanId;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

/** Get effective plan for user. Returns plan and subscription row; if no row, effective plan is free. */
export async function getSubscriptionForUser(userId: string): Promise<{
  plan: PlanId;
  status: string;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  row: SubscriptionRow | null;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      plan: "free",
      status: "active",
      currentPeriodEnd: null,
      stripeCustomerId: null,
      row: null,
    };
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return {
      plan: "free",
      status: "active",
      currentPeriodEnd: null,
      stripeCustomerId: null,
      row: null,
    };
  }

  const plan = (["free", "pro", "business", "enterprise"].includes(data.plan) ? data.plan : "free") as PlanId;
  return {
    plan,
    status: data.status ?? "active",
    currentPeriodEnd: data.current_period_end,
    stripeCustomerId: data.stripe_customer_id,
    row: data as SubscriptionRow,
  };
}
