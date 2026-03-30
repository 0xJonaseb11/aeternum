import { NextResponse } from "next/server";
import { getSupabase } from "~~/lib/supabase";
import { SystemHealth } from "~~/types/admin";

export async function GET() {
  const details: SystemHealth["details"] = {
    supabase: "unconfigured",
    stripe: "unconfigured",
    arweave: "unconfigured",
    ipfs: "unconfigured",
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { count, error } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      details.supabase = error ? "error" : "ok";
      if (!error) details.userCount = count;
    } catch {
      details.supabase = "error";
    }
  }

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

  if (process.env.IRYS_PRIVATE_KEY) {
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
    { status: 200 },
  );
}
