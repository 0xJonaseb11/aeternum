import { NextRequest, NextResponse } from "next/server";
import { Uploader } from "@irys/upload";
import { BaseEth } from "@irys/upload-ethereum";
import { logger } from "~~/lib/logger";
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
  const [
    { count: totalProofs },
    { count: totalOrgs },
    { count: totalProfiles },
    { data: allSubs },
    { data: recentEvents },
    { data: activeInvites },
  ] = await Promise.all([
    supabase.from("proofs").select("*", { count: "exact", head: true }),
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("plan, status"),
    supabase.from("events").select("*").order("at", { ascending: false }).limit(5),
    supabase.from("team_invites").select("*", { count: "exact", head: true }).is("accepted_at", null),
  ]);

  // Active subscriptions are those that are not 'canceled' or 'incomplete_expired'
  const activeSubs = allSubs?.filter(s => !["canceled", "incomplete_expired"].includes(s.status)) || [];

  // Calculate MRR (estimated based on plan prices)
  const MRR_VALUES: Record<string, number> = {
    pro: 20,
    business: 100,
    enterprise: 150, // Standard monthly
  };

  const mrr = activeSubs.reduce((acc, sub) => acc + (MRR_VALUES[sub.plan] || 0), 0);

  // Check Irys balance (optional/cached-style)
  let irysBalance = "0";
  try {
    const privateKey = process.env.IRYS_PRIVATE_KEY;
    if (privateKey) {
      const rpcUrl = process.env.IRYS_RPC_URL ?? "https://sepolia.base.org";
      const uploader = await Uploader(BaseEth).withWallet(privateKey).withRpc(rpcUrl).devnet();
      const balance = await uploader.getBalance(uploader.address);
      irysBalance = (Number(balance) / 1e18).toFixed(4); // Convert to ETH-like unit
    }
  } catch (err) {
    logger.error("Failed to fetch Irys balance in admin stats", { error: String(err) });
  }

  const stats = {
    totalProofs: totalProofs || 0,
    totalOrgs: totalOrgs || 0,
    totalUsers: totalProfiles || 0,
    activeSubscriptions: activeSubs.length,
    mrr,
    irysBalance,
    pendingInvites: activeInvites?.length || 0,
    planDistribution:
      activeSubs.reduce((acc: any, curr) => {
        acc[curr.plan] = (acc[curr.plan] || 0) + 1;
        return acc;
      }, {}) || {},
    recentActivity: recentEvents || [],
  };

  return NextResponse.json(stats);
}
