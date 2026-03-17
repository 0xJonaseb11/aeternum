import { NextResponse } from "next/server";
import { getSupabase } from "~~/lib/supabase";

/**
 * Health check endpoint for monitoring and deployment verification.
 * Returns service status and basic connectivity checks.
 */
export async function GET() {
  const checks: Record<string, "ok" | "error" | "unconfigured"> = {};

  // Supabase connectivity
  const supabase = getSupabase();
  if (!supabase) {
    checks.supabase = "unconfigured";
  } else {
    try {
      const { error } = await supabase.from("profiles").select("id").limit(1);
      checks.supabase = error ? "error" : "ok";
    } catch {
      checks.supabase = "error";
    }
  }

  // Env vars presence (not values)
  checks.stripe = process.env.STRIPE_SECRET_KEY ? "ok" : "unconfigured";
  checks.arweave = process.env.IRYS_PRIVATE_KEY ? "ok" : "unconfigured";
  checks.ipfs = process.env.PINATA_JWT ? "ok" : "unconfigured";

  const allOk = Object.values(checks).every(v => v === "ok");

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      service: "aeternum",
      checks,
    },
    { status: allOk ? 200 : 503 },
  );
}
