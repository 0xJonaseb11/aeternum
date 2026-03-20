import { NextRequest, NextResponse } from "next/server";
import { countProofsThisMonthForUser } from "~~/lib/billing/checkLimits";
import { getSubscriptionForUser } from "~~/lib/billing/getSubscription";
import { getPlanLimits } from "~~/lib/billing/plans";
import { getSupabase } from "~~/lib/supabase";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

function currentMonthStart(): string {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const sub = await getSubscriptionForUser(user.id);
  const limits = getPlanLimits(sub.plan);

  const proofsUsed = await countProofsThisMonthForUser(user.id);

  const periodStart = currentMonthStart();
  const { data: apiRow } = await supabase
    .from("api_usage")
    .select("requests_count")
    .eq("user_id", user.id)
    .eq("period_start", periodStart)
    .maybeSingle();
  const apiUsed = apiRow?.requests_count ?? 0;

  return NextResponse.json({
    plan: sub.plan,
    proofs: {
      used: proofsUsed,
      limit: limits.proofsPerMonth,
    },
    apiRequests: {
      used: apiUsed,
      limit: limits.apiRequestsPerMonth,
    },
  });
}
