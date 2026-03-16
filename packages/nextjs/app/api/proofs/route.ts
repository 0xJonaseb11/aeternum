import { NextRequest, NextResponse } from "next/server";
import { checkProofLimit } from "~~/lib/billing/checkLimits";
import { getClientIdentifier, rateLimit } from "~~/lib/rateLimit";
import { getMembership } from "~~/lib/rbac/getMembership";
import { hasRoleAtLeast } from "~~/lib/rbac/roles";
import { getSupabase } from "~~/lib/supabase";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";
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
  const userIdParam = searchParams.get("userId");
  const organizationId = searchParams.get("organizationId");
  const fileHash = searchParams.get("fileHash");
  const chainIdParam = searchParams.get("chainId");
  const search = searchParams.get("search");
  const caseId = searchParams.get("caseId");
  const tagsParam = searchParams.get("tags");
  const folderIdParam = searchParams.get("folderId");
  const dateFromParam = searchParams.get("dateFrom");
  const dateToParam = searchParams.get("dateTo");

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

  if (!owner && !userIdParam) {
    return NextResponse.json({ error: "Missing owner, userId, or fileHash" }, { status: 400 });
  }
  if (owner && !/^0x[a-fA-F0-9]{40}$/.test(owner)) {
    return NextResponse.json({ error: "Invalid owner" }, { status: 400 });
  }

  // When listing by userId/org, require session and enforce scope (ignore client-supplied userId).
  let userId: string | null = userIdParam;
  if (userIdParam != null || (organizationId != null && organizationId !== "")) {
    const user = await getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (organizationId != null && organizationId !== "") {
      const membership = await getMembership(user.id, organizationId);
      if (!membership) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      userId = user.id;
    } else {
      userId = user.id;
    }
  }

  let chainId: number | undefined;
  if (chainIdParam != null) {
    const parsed = parseInt(chainIdParam, 10);
    if (Number.isNaN(parsed) || parsed < 0) {
      return NextResponse.json({ error: "Invalid chainId" }, { status: 400 });
    }
    chainId = parsed;
  }

  // Optional evidence-based filters: get file_hashes from evidence table then filter proofs.
  let evidenceFileHashes: string[] | null = null;
  const hasEvidenceFilters =
    (search != null && search.trim() !== "") ||
    (caseId != null && caseId.trim() !== "") ||
    (tagsParam != null && tagsParam.trim() !== "") ||
    (folderIdParam != null && folderIdParam !== "");
  if (userId != null && hasEvidenceFilters) {
    let evidenceQuery = supabase.from("evidence").select("file_hash").eq("user_id", userId);
    if (organizationId != null && organizationId !== "") {
      evidenceQuery = evidenceQuery.eq("organization_id", organizationId);
    } else {
      evidenceQuery = evidenceQuery.is("organization_id", null);
    }
    if (folderIdParam != null && folderIdParam !== "") {
      evidenceQuery = evidenceQuery.eq("folder_id", folderIdParam);
    }
    if (search != null && search.trim() !== "") {
      const raw = search.trim().replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
      const term = `%${raw}%`;
      evidenceQuery = evidenceQuery.or(`title.ilike.${term},description.ilike.${term}`);
    }
    if (caseId != null && caseId.trim() !== "") {
      evidenceQuery = evidenceQuery.eq("case_id", caseId.trim());
    }
    if (tagsParam != null && tagsParam.trim() !== "") {
      const tags = tagsParam
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);
      if (tags.length > 0) {
        evidenceQuery = evidenceQuery.overlaps("tags", tags);
      }
    }
    const { data: evidenceRows, error: evidenceError } = await evidenceQuery.limit(500);
    if (evidenceError) {
      console.error("Supabase evidence filter error:", evidenceError);
      return NextResponse.json({ error: "Failed to apply filters" }, { status: 500 });
    }
    evidenceFileHashes = (evidenceRows ?? []).map(r => r.file_hash);
    if (evidenceFileHashes.length === 0) {
      return NextResponse.json({ items: [] });
    }
    // Optional date filter on proofs.timestamp (apply when we have proof rows)
    if (dateFromParam != null || dateToParam != null) {
      // will filter proofs by timestamp below after fetch
    }
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

  const { data: queryData, error } = await query;
  if (error) {
    console.error("Supabase proofs GET error:", error);
    return NextResponse.json({ error: "Failed to fetch proofs" }, { status: 500 });
  }
  let data = queryData ?? null;

  // Apply evidence file_hash filter (and optional date filter) in memory
  if (data != null && data.length > 0 && evidenceFileHashes != null && evidenceFileHashes.length > 0) {
    const set = new Set(evidenceFileHashes);
    data = data.filter(row => set.has(row.file_hash));
  }
  if (data != null && (dateFromParam != null || dateToParam != null)) {
    const from = dateFromParam != null ? parseInt(dateFromParam, 10) : null;
    const to = dateToParam != null ? parseInt(dateToParam, 10) : null;
    if (from != null && !Number.isNaN(from)) {
      data = data.filter(row => row.timestamp >= from);
    }
    if (to != null && !Number.isNaN(to)) {
      data = data.filter(row => row.timestamp <= to);
    }
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
