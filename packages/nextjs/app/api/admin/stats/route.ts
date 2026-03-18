import { NextRequest, NextResponse } from "next/server";
import { isPlatformAdmin } from "~~/lib/rbac/isAdmin";
import { getSupabase } from "~~/lib/supabase";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req);
  const walletAddress = req.headers.get("x-wallet-address") || undefined;

  if (!isPlatformAdmin(user, walletAddress)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "DB error" }, { status: 500 });

  // Parallel counts for efficiency
  const [{ count: totalProofs }, { count: totalOrgs }, { data: allSubs }] = await Promise.all([
    supabase.from("proofs").select("*", { count: "exact", head: true }),
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("plan, status"),
  ]);

  // Active subscriptions are those that are not 'canceled' or 'incomplete_expired'
  const activeSubs = allSubs?.filter(s => !["canceled", "incomplete_expired"].includes(s.status)) || [];

  const stats = {
    totalProofs: totalProofs || 0,
    totalOrgs: totalOrgs || 0,
    activeSubscriptions: activeSubs.length,
    planDistribution:
      activeSubs.reduce((acc: any, curr) => {
        acc[curr.plan] = (acc[curr.plan] || 0) + 1;
        return acc;
      }, {}) || {},
  };

  return NextResponse.json(stats);
}
