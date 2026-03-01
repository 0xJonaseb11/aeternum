import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "~~/lib/supabase";

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const chainIdParam = searchParams.get("chainId");
  if (!owner || !/^0x[a-fA-F0-9]{40}$/.test(owner)) {
    return NextResponse.json({ error: "Missing or invalid owner" }, { status: 400 });
  }
  let chainId: number | undefined;
  if (chainIdParam != null) {
    const parsed = parseInt(chainIdParam, 10);
    if (Number.isNaN(parsed) || parsed < 0) {
      return NextResponse.json({ error: "Invalid chainId" }, { status: 400 });
    }
    chainId = parsed;
  }

  let query = supabase
    .from("proofs")
    .select("id, chain_id, owner_address, file_hash, timestamp, block_number, arweave_tx_id, ipfs_cid, revoked")
    .eq("owner_address", owner.toLowerCase())
    .eq("revoked", false)
    .order("timestamp", { ascending: false })
    .limit(100);

  if (chainId != null) {
    query = query.eq("chain_id", chainId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase proofs GET error:", error);
    return NextResponse.json({ error: "Failed to fetch proofs" }, { status: 500 });
  }

  const items = (data ?? []).map(row => ({
    id: `${row.chain_id}-${row.file_hash}`,
    fileHash: row.file_hash,
    owner: row.owner_address,
    timestamp: row.timestamp,
    blockNumber: row.block_number,
    arweaveTxId: row.arweave_tx_id,
    ipfsCid: row.ipfs_cid,
    revoked: row.revoked,
  }));

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  let body: {
    owner: string;
    fileHash: string;
    timestamp: number;
    blockNumber?: number;
    arweaveTxId: string;
    ipfsCid?: string;
    chainId?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { owner, fileHash, timestamp, arweaveTxId, ipfsCid, chainId = 84_532 } = body;
  const blockNumber = body.blockNumber ?? 0;
  if (!owner || !fileHash || timestamp == null || !arweaveTxId) {
    return NextResponse.json(
      { error: "Missing required fields: owner, fileHash, timestamp, arweaveTxId" },
      { status: 400 },
    );
  }
  if (!/^0x[a-fA-F0-9]{64}$/.test(fileHash)) {
    return NextResponse.json({ error: "Invalid fileHash" }, { status: 400 });
  }

  const { error } = await supabase.from("proofs").upsert(
    {
      chain_id: chainId,
      owner_address: owner.toLowerCase(),
      file_hash: fileHash,
      timestamp,
      block_number: blockNumber,
      arweave_tx_id: arweaveTxId,
      ipfs_cid: ipfsCid ?? null,
      revoked: false,
    },
    { onConflict: "chain_id,file_hash" },
  );

  if (error) {
    console.error("Supabase proofs POST error:", error);
    return NextResponse.json({ error: "Failed to save proof" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
