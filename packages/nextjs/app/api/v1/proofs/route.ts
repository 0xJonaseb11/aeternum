import { NextRequest, NextResponse } from "next/server";
import { getApiKeyAuth } from "~~/lib/api/withApiKey";
import { checkAndIncrementApiUsage } from "~~/lib/billing/apiUsage";
import { getClientIdentifier, rateLimit } from "~~/lib/rateLimit";
import { getSupabase } from "~~/lib/supabase";

export async function GET(req: NextRequest) {
  const auth = await getApiKeyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }
  const clientId = getClientIdentifier(req);
  if (!(await rateLimit(clientId, "v1"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const usage = await checkAndIncrementApiUsage(auth.userId);
  if (!usage.allowed) {
    return NextResponse.json({ error: usage.reason ?? "API limit exceeded" }, { status: 429 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
  const { searchParams } = new URL(req.url);
  const chainIdParam = searchParams.get("chainId");
  let chainId: number | undefined;
  if (chainIdParam != null) {
    const parsed = parseInt(chainIdParam, 10);
    if (!Number.isNaN(parsed) && parsed >= 0) chainId = parsed;
  }
  let query = supabase
    .from("proofs")
    .select("id, chain_id, owner_address, file_hash, timestamp, block_number, arweave_tx_id, ipfs_cid, revoked")
    .eq("user_id", auth.userId)
    .eq("revoked", false)
    .order("timestamp", { ascending: false })
    .limit(100);
  if (chainId != null) query = query.eq("chain_id", chainId);
  const { data, error } = await query;
  if (error) {
    console.error("v1 proofs GET error:", error);
    return NextResponse.json({ error: "Failed to fetch proofs" }, { status: 500 });
  }
  const items = (data ?? []).map(row => ({
    proofId: row.id,
    chainId: row.chain_id,
    owner: row.owner_address,
    fileHash: row.file_hash,
    timestamp: row.timestamp,
    blockNumber: row.block_number,
    arweaveTxId: row.arweave_tx_id,
    ipfsCid: row.ipfs_cid,
    revoked: row.revoked,
  }));
  return NextResponse.json({ items });
}
