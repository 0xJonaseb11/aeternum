import { NextRequest, NextResponse } from "next/server";
import { getApiKeyAuth } from "~~/lib/api/withApiKey";

/**
 * Developer API v1 — Proofs.
 * Planned: list proofs for user, trigger proof generation (with API key auth and rate limiting).
 */
export async function GET(req: NextRequest) {
  const auth = await getApiKeyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }
  // TODO: call existing GET /api/proofs?userId=auth.userId
  return NextResponse.json({ message: "Developer API v1 proofs list — use userId from API key", items: [] });
}
