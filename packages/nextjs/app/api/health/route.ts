import { NextResponse } from "next/server";
import { getSupabase } from "~~/lib/supabase";

/**
 * Health check endpoint for monitoring and deployment verification.
 * Returns service status and basic connectivity checks.
 */
export async function GET() {
  const details: any = {
    supabase: "unconfigured",
    stripe: "unconfigured",
    arweave: "unconfigured",
    ipfs: "unconfigured",
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { count, error } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
      details.supabase = error ? "error" : "ok";
      if (!error) details.userCount = count;
    } catch {
      details.supabase = "error";
    }
  }

  // Stripe connectivity
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const res = await fetch("https://api.stripe.com/v1/plans?limit=1", {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      });
      details.stripe = res.ok ? "ok" : "error";
    } catch {
      details.stripe = "error";
    }
  }

  // Arweave (Irys) check
  if (process.env.IRYS_PRIVATE_KEY) {
    // We already do this in stats, but here we just check presence + basic ping if possible
    details.arweave = "ok"; 
  }

  details.ipfs = process.env.PINATA_JWT ? "ok" : "unconfigured";

  const allOk = ["supabase", "stripe", "arweave"].every(k => details[k] === "ok");

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      service: "aeternum",
      details,
    },
    { status: 200 }, // Always 200 for internal dashboard consumption
  );
}
