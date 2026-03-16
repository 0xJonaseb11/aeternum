import { getSubscriptionForUser } from "~~/lib/billing/getSubscription";
import { getPlanLimits, isWithinLimit } from "~~/lib/billing/plans";
import { getSupabase } from "~~/lib/supabase";

/** First day of current month UTC (YYYY-MM-DD). */
function currentMonthStart(): string {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

/**
 * Check if user is within API requests limit for this month, then increment.
 * Returns { allowed: true } or { allowed: false, reason }.
 */
export async function checkAndIncrementApiUsage(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const supabase = getSupabase();
  if (!supabase) return { allowed: true };

  const sub = await getSubscriptionForUser(userId);
  const limits = getPlanLimits(sub.plan);
  const periodStart = currentMonthStart();

  const { data: row } = await supabase
    .from("api_usage")
    .select("requests_count")
    .eq("user_id", userId)
    .eq("period_start", periodStart)
    .maybeSingle();

  const current = row?.requests_count ?? 0;
  if (!isWithinLimit(sub.plan, "apiRequestsPerMonth", current)) {
    return {
      allowed: false,
      reason: `API request limit reached for ${sub.plan} plan (${limits.apiRequestsPerMonth} per month). Upgrade for more.`,
    };
  }

  // Increment: update existing row or insert new
  const { data: updated, error: updateError } = await supabase
    .from("api_usage")
    .update({ requests_count: current + 1 })
    .eq("user_id", userId)
    .eq("period_start", periodStart)
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error("api_usage update error:", updateError);
    return { allowed: true };
  }
  if (!updated) {
    const { error: insertError } = await supabase.from("api_usage").insert({
      user_id: userId,
      period_start: periodStart,
      requests_count: 1,
    });
    if (insertError) {
      console.error("api_usage insert error:", insertError);
      return { allowed: true };
    }
  }
  return { allowed: true };
}
