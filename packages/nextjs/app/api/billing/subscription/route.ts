import { NextRequest, NextResponse } from "next/server";
import { countProofsThisMonthForUser } from "~~/lib/billing/checkLimits";
import { getSubscriptionForUser } from "~~/lib/billing/getSubscription";
import { getPlanLimits } from "~~/lib/billing/plans";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const { user, status } = await getCurrentUserFromRequest(req);
  if (status === "maintenance") {
    return NextResponse.json({ error: "System under maintenance. Please try again later." }, { status: 503 });
  }
  if (status === "blocked") {
    return NextResponse.json({ error: "Account blocked." }, { status: 403 });
  }
  if (!user || status === "unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sub = await getSubscriptionForUser(user.id);
  const proofsThisMonth = await countProofsThisMonthForUser(user.id);
  const limits = getPlanLimits(sub.plan);
  const proofsLimit = limits.proofsPerMonth;
  return NextResponse.json({
    plan: sub.plan,
    status: sub.status,
    currentPeriodEnd: sub.currentPeriodEnd,
    stripeCustomerId: sub.stripeCustomerId ? `${sub.stripeCustomerId.slice(0, 12)}…` : null,
    proofsThisMonth,
    proofsLimit,
  });
}
