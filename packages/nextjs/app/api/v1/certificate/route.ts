import { NextRequest, NextResponse } from "next/server";
import { getApiKeyAuth } from "~~/lib/api/withApiKey";

/**
 * Developer API v1 — Certificate retrieval.
 * Planned: get certificate data or PDF for a proof (with API key auth and rate limiting).
 */
export async function GET(req: NextRequest) {
  const auth = await getApiKeyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const proofId = searchParams.get("proofId");
  if (!proofId) {
    return NextResponse.json({ error: "Missing proofId" }, { status: 400 });
  }
  // TODO: fetch proof, return certificate JSON or PDF
  return NextResponse.json({ message: "Developer API v1 certificate — not yet implemented" }, { status: 501 });
}
