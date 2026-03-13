import { NextRequest, NextResponse } from "next/server";
import { getApiKeyAuth } from "~~/lib/api/withApiKey";

/**
 * Developer API v1 — Evidence.
 * Planned: evidence creation, list, update (with API key auth and rate limiting).
 */
export async function GET(req: NextRequest) {
  const auth = await getApiKeyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }
  // TODO: list evidence for auth.userId with pagination
  return NextResponse.json({ message: "Developer API v1 evidence list — implement with user scoping", items: [] });
}

export async function POST(req: NextRequest) {
  const auth = await getApiKeyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }
  // TODO: create evidence metadata; delegate to existing logic with userId from auth
  return NextResponse.json({ message: "Developer API v1 evidence create — not yet implemented" }, { status: 501 });
}
