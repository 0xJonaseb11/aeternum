import { NextRequest, NextResponse } from "next/server";
import { getApiKeyAuth } from "~~/lib/api/withApiKey";
import { checkAndIncrementApiUsage } from "~~/lib/billing/apiUsage";
import { logger } from "~~/lib/logger";
import { getClientIdentifier, rateLimit } from "~~/lib/rateLimit";
import { getSupabase } from "~~/lib/supabase";

/**
 * Developer API v1 — Certificate. Returns certificate data (JSON) for a proof.
 */
export async function GET(req: NextRequest) {
  const auth = await getApiKeyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }
  const clientId = getClientIdentifier(req);
  if (!rateLimit(clientId, "v1")) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const usage = await checkAndIncrementApiUsage(auth.userId);
  if (!usage.allowed) {
    return NextResponse.json({ error: usage.reason ?? "API limit exceeded" }, { status: 429 });
  }
  const { searchParams } = new URL(req.url);
  const proofId = searchParams.get("proofId");
  if (!proofId) {
    return NextResponse.json({ error: "Missing proofId" }, { status: 400 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(proofId);
  let query = supabase
    .from("proofs")
    .select("id, chain_id, owner_address, file_hash, timestamp, block_number, arweave_tx_id, ipfs_cid, revoked")
    .eq("revoked", false);
  if (isUuid) query = query.eq("id", proofId);
  else {
    const parts = proofId.split("-");
    if (parts.length >= 2) {
      const chainId = parseInt(parts[0], 10);
      const fh = parts.slice(1).join("-");
      if (!Number.isNaN(chainId) && fh.startsWith("0x")) query = query.eq("chain_id", chainId).eq("file_hash", fh);
    }
  }
  const { data, error } = await query.limit(1).maybeSingle();
  if (error) {
    logger.error("v1 certificate GET error", { error: error.message });
    return NextResponse.json({ error: "Failed to fetch proof" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Proof not found" }, { status: 404 });
  }
  const baseUrl = req.nextUrl.origin;
  return NextResponse.json({
    proofId: data.id,
    fileHash: data.file_hash,
    timestamp: data.timestamp,
    owner: data.owner_address,
    blockNumber: data.block_number,
    arweaveTxId: data.arweave_tx_id,
    ipfsCid: data.ipfs_cid,
    verificationUrl: `${baseUrl}/evidence/${data.id}`,
    verified: !data.revoked,
  });
}
