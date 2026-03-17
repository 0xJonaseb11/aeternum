import { NextRequest, NextResponse } from "next/server";
import { isPlatformAdmin } from "~~/lib/rbac/isAdmin";
import { getSupabase } from "~~/lib/supabase";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req);
  if (!isPlatformAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "DB error" }, { status: 500 });

  // Parallel counts for efficiency
  const [{ count: totalProofs }, { count: totalOrgs }, { data: activeSubs }] = await Promise.all([
    supabase.from("proofs").select("*", { count: "exact", head: true }),
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("plan, status"),
  ]);

  const stats = {
    totalProofs: totalProofs || 0,
    totalOrgs: totalOrgs || 0,
    activeSubscriptions: activeSubs?.filter(s => s.status === "active").length || 0,
    planDistribution:
      activeSubs?.reduce((acc: any, curr) => {
        acc[curr.plan] = (acc[curr.plan] || 0) + 1;
        return acc;
      }, {}) || {},
  };

  return NextResponse.json(stats);
}
