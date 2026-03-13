import { NextRequest, NextResponse } from "next/server";
import { getApiKeyAuth } from "~~/lib/api/withApiKey";

/**
 * Developer API v1 — Verification.
 * Planned: verify by proof ID or commitment hash (with API key auth and rate limiting).
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
  // TODO: delegate to GET /api/proofs/[id] and return public verification result
  return NextResponse.json({ message: "Developer API v1 verify — implement via /api/proofs/[id]" }, { status: 501 });
}
