import { NextRequest, NextResponse } from "next/server";
import { Uploader } from "@irys/upload";
import { BaseEth } from "@irys/upload-ethereum";
import { logger } from "~~/lib/logger";
import { isPlatformAdmin } from "~~/lib/rbac/isAdmin";
import { getSupabase } from "~~/lib/supabase";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const { user } = await getCurrentUserFromRequest(req);
  const walletAddress = req.headers.get("x-wallet-address") || undefined;

  if (!isPlatformAdmin(user, walletAddress)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "DB error" }, { status: 500 });

  const results = await Promise.all([
    supabase.from("proofs").select("*", { count: "exact", head: true }),
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("plan, status, amount"),
    supabase.from("events").select("*").order("at", { ascending: false }).limit(5),
    supabase.from("team_invites").select("*", { count: "exact", head: true }).is("accepted_at", null),
  ]);

  const [
    { count: totalProofs, error: proofsErr },
    { count: totalOrgs, error: orgsErr },
    { count: totalProfiles, error: profilesErr },
    { data: allSubs, error: subsErr },
    { data: recentEvents, error: eventsErr },
    { data: activeInvites, error: invitesErr },
  ] = results;

  if (proofsErr || orgsErr || profilesErr || subsErr || eventsErr || invitesErr) {
    logger.error("Database error in admin stats", {
      errors: { proofsErr, orgsErr, profilesErr, subsErr, eventsErr, invitesErr },
    });
  }

  const activeSubs = allSubs?.filter(s => !["canceled", "incomplete_expired"].includes(s.status)) || [];

  const planDistribution: Record<string, number> = {
    free: 0,
    pro: 0,
    business: 0,
    enterprise: 0,
  };

  activeSubs.forEach(sub => {
    if (sub.plan in planDistribution) {
      planDistribution[sub.plan]++;
    } else {
      planDistribution[sub.plan] = 1;
    }
  });

  const MRR_VALUES: Record<string, number> = {
    pro: 20,
    business: 100,
    enterprise: 150,
  };

  const mrr = activeSubs.reduce((acc, sub) => {
    // If we have an exact tracked amount from Stripe (in cents), convert to dollars
    if (sub.amount !== undefined && sub.amount !== null && sub.amount > 0) {
      return acc + sub.amount / 100;
    }
    // Fallback securely for legacy subscriptions using hardcoded averages
    return acc + (MRR_VALUES[sub.plan] || 0);
  }, 0);

  let irysBalance = "0";
  try {
    const privateKey = process.env.IRYS_PRIVATE_KEY;
    if (privateKey) {
      const rpcUrl = process.env.IRYS_RPC_URL ?? "https://sepolia.base.org";
      const uploader = await Uploader(BaseEth).withWallet(privateKey).withRpc(rpcUrl).devnet();
      const balance = await uploader.getBalance(uploader.address);
      irysBalance = (Number(balance) / 1e18).toFixed(4);
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
    planDistribution,
    recentActivity: recentEvents || [],
  };

  return NextResponse.json(stats);
}
