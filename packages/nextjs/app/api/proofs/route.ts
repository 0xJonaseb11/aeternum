import { NextRequest, NextResponse } from "next/server";
import { checkProofLimit } from "~~/lib/billing/checkLimits";
import { getClientIdentifier, rateLimit } from "~~/lib/rateLimit";
import { getMembership } from "~~/lib/rbac/getMembership";
import { hasRoleAtLeast } from "~~/lib/rbac/roles";
import { getSupabase } from "~~/lib/supabase";
import { proofsPostSchema } from "~~/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const clientId = getClientIdentifier(req);
  if (!rateLimit(clientId, "proofs")) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const userId = searchParams.get("userId");
  const organizationId = searchParams.get("organizationId");
  const fileHash = searchParams.get("fileHash");
  const chainIdParam = searchParams.get("chainId");

  // Lookup by commitment (file) hash: return first matching proof for public verify flow
  if (fileHash) {
    if (!/^0x[a-fA-F0-9]{64}$/.test(fileHash)) {
      return NextResponse.json({ error: "Invalid fileHash" }, { status: 400 });
    }
    const { data: row, error } = await supabase
      .from("proofs")
      .select("id, chain_id, owner_address, file_hash, timestamp, block_number, arweave_tx_id, ipfs_cid, revoked")
      .eq("file_hash", fileHash)
      .eq("revoked", false)
      .order("timestamp", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error("Supabase proofs GET by fileHash error:", error);
      return NextResponse.json({ error: "Failed to fetch proof" }, { status: 500 });
    }
    if (!row) {
      return NextResponse.json({ error: "Proof not found for this commitment hash" }, { status: 404 });
    }
    return NextResponse.json({
      proofId: row.id,
      chainId: row.chain_id,
      owner: row.owner_address,
      fileHash: row.file_hash,
      timestamp: row.timestamp,
      blockNumber: row.block_number,
      arweaveTxId: row.arweave_tx_id,
      ipfsCid: row.ipfs_cid,
      revoked: row.revoked,
    });
  }

  if (!owner && !userId) {
    return NextResponse.json({ error: "Missing owner, userId, or fileHash" }, { status: 400 });
  }
  if (owner && !/^0x[a-fA-F0-9]{40}$/.test(owner)) {
    return NextResponse.json({ error: "Invalid owner" }, { status: 400 });
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
    .select(
      "id, chain_id, owner_address, user_id, file_hash, timestamp, block_number, arweave_tx_id, ipfs_cid, revoked",
    )
    .eq("revoked", false)
    .order("timestamp", { ascending: false })
    .limit(100);

  if (userId) {
    query = query.eq("user_id", userId);
    if (organizationId != null && organizationId !== "") {
      query = query.eq("organization_id", organizationId);
    } else {
      query = query.is("organization_id", null);
    }
  } else if (owner) {
    query = query.eq("owner_address", owner.toLowerCase());
  }

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
    proofId: row.id,
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
  const clientId = getClientIdentifier(req);
  if (!rateLimit(clientId, "upload")) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = proofsPostSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] ?? parsed.error.message;
    return NextResponse.json({ error: "Validation failed", details: msg }, { status: 400 });
  }
  const {
    owner,
    userId,
    organizationId,
    fileHash,
    timestamp,
    arweaveTxId,
    ipfsCid,
    chainId = 84_532,
    blockNumber = 0,
  } = parsed.data;

  if (organizationId) {
    if (!userId) {
      return NextResponse.json({ error: "userId is required for organization-scoped proofs" }, { status: 400 });
    }
    const membership = await getMembership(userId, organizationId);
    if (!membership) {
      return NextResponse.json({ error: "Not a member of this organization" }, { status: 403 });
    }
    if (!hasRoleAtLeast(membership.role, "contributor")) {
      return NextResponse.json({ error: "Insufficient role for organization-scoped proofs" }, { status: 403 });
    }
  }

  const limitCheck = await checkProofLimit(userId ?? null);
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: limitCheck.reason ?? "Proof limit reached" }, { status: 403 });
  }

  const { error } = await supabase.from("proofs").upsert(
    {
      chain_id: chainId,
      owner_address: owner.toLowerCase(),
      user_id: userId ?? null,
      organization_id: organizationId ?? null,
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
