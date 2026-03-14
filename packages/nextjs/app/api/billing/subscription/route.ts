import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionForUser } from "~~/lib/billing/getSubscription";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

/** GET: current user's subscription (plan, status, period end). Requires Supabase session. */
export async function GET(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sub = await getSubscriptionForUser(user.id);
  return NextResponse.json({
    plan: sub.plan,
    status: sub.status,
    currentPeriodEnd: sub.currentPeriodEnd,
    stripeCustomerId: sub.stripeCustomerId ? `${sub.stripeCustomerId.slice(0, 12)}…` : null,
  });
}
