import { NextRequest, NextResponse } from "next/server";
import { getApiKeyAuth } from "~~/lib/api/withApiKey";
import { getSupabase } from "~~/lib/supabase";

/**
 * Developer API v1 — Verification. Get verification result by proof ID or fileHash.
 */
export async function GET(req: NextRequest) {
  const auth = await getApiKeyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const proofId = searchParams.get("proofId");
  const fileHash = searchParams.get("fileHash");
  if (!proofId && !fileHash) {
    return NextResponse.json({ error: "Missing proofId or fileHash" }, { status: 400 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
  let query = supabase
    .from("proofs")
    .select("id, chain_id, owner_address, file_hash, timestamp, block_number, arweave_tx_id, ipfs_cid, revoked")
    .eq("revoked", false);
  if (proofId) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(proofId);
    if (isUuid) query = query.eq("id", proofId);
    else {
      const parts = proofId.split("-");
      if (parts.length >= 2) {
        const chainId = parseInt(parts[0], 10);
        const fh = parts.slice(1).join("-");
        if (!Number.isNaN(chainId) && fh.startsWith("0x")) query = query.eq("chain_id", chainId).eq("file_hash", fh);
      }
    }
  } else if (fileHash) {
    query = query.eq("file_hash", fileHash);
  }
  const { data, error } = await query.limit(1).maybeSingle();
  if (error) {
    console.error("v1 verify GET error:", error);
    return NextResponse.json({ error: "Failed to fetch proof" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Proof not found" }, { status: 404 });
  }
  return NextResponse.json({
    proofId: data.id,
    chainId: data.chain_id,
    owner: data.owner_address,
    fileHash: data.file_hash,
    timestamp: data.timestamp,
    blockNumber: data.block_number,
    arweaveTxId: data.arweave_tx_id,
    ipfsCid: data.ipfs_cid,
    verified: !data.revoked,
  });
}
