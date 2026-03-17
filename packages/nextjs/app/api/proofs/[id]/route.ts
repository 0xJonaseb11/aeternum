import { NextRequest, NextResponse } from "next/server";
import { logger } from "~~/lib/logger";
import { getSupabase } from "~~/lib/supabase";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/proofs/[id] — Fetch a single proof by UUID for shareable verification links.
 * Returns public-safe fields only (no user_id). Used by /evidence/[proofId].
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing proof id" }, { status: 400 });
  }

  const isUuid = UUID_REGEX.test(id);
  let query = supabase
    .from("proofs")
    .select("id, chain_id, owner_address, file_hash, timestamp, block_number, arweave_tx_id, ipfs_cid, revoked")
    .eq("revoked", false);

  if (isUuid) {
    query = query.eq("id", id);
  } else {
    // Support composite id "chainId-fileHash" for backward compatibility
    const parts = id.split("-");
    if (parts.length >= 2) {
      const chainId = parseInt(parts[0], 10);
      const fileHash = parts.slice(1).join("-");
      if (!Number.isNaN(chainId) && fileHash.startsWith("0x")) {
        query = query.eq("chain_id", chainId).eq("file_hash", fileHash);
      } else {
        return NextResponse.json({ error: "Invalid proof id format" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Invalid proof id format" }, { status: 400 });
    }
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    logger.error("Supabase individual proof GET error", { error: error.message, proofId: id });
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
    revoked: data.revoked,
  });
}
