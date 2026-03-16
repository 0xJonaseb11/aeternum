import { getSubscriptionForUser } from "~~/lib/billing/getSubscription";
import { type PlanId, getPlanLimits, isWithinLimit } from "~~/lib/billing/plans";
import { getSupabase } from "~~/lib/supabase";

/** Proofs-per-month limits only. API requests-per-month is in apiUsage.ts (api_usage table, v1 routes). */

/** Start of current month (UTC) for proofs-per-month window. */
function startOfCurrentMonth(): string {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Count proofs created this month for user (by user_id). */
export async function countProofsThisMonthForUser(userId: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;
  const from = startOfCurrentMonth();
  const { count, error } = await supabase
    .from("proofs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", from);
  if (error) return 0;
  return count ?? 0;
}

/** Check if user can create one more proof. Returns { allowed, reason }. */
export async function checkProofLimit(userId: string | null): Promise<{
  allowed: boolean;
  reason?: string;
  plan?: PlanId;
}> {
  if (!userId) return { allowed: true };
  const sub = await getSubscriptionForUser(userId);
  const count = await countProofsThisMonthForUser(userId);
  const limits = getPlanLimits(sub.plan);
  const allowed = isWithinLimit(sub.plan, "proofsPerMonth", count);
  if (!allowed) {
    return {
      allowed: false,
      reason: `Proof limit reached for ${sub.plan} plan (${limits.proofsPerMonth} per month). Upgrade to add more.`,
      plan: sub.plan,
    };
  }
  return { allowed: true, plan: sub.plan };
}
