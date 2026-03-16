import { NextRequest, NextResponse } from "next/server";
import { getMembership } from "~~/lib/rbac/getMembership";
import { canEditEvidence } from "~~/lib/rbac/roles";
import { getSupabase } from "~~/lib/supabase";
import { evidencePostSchema } from "~~/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const fileHash = searchParams.get("fileHash");
  const userId = searchParams.get("userId");

  if (!fileHash) {
    return NextResponse.json({ error: "Missing fileHash" }, { status: 400 });
  }

  let query = supabase.from("evidence").select("*").eq("file_hash", fileHash).limit(1);
  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Supabase GET /api/evidence error:", error);
    return NextResponse.json({ error: "Failed to fetch evidence" }, { status: 500 });
  }

  return NextResponse.json({ item: data ?? null });
}

export async function POST(req: NextRequest) {
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
  const parsed = evidencePostSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] ?? parsed.error.message;
    return NextResponse.json({ error: "Validation failed", details: msg }, { status: 400 });
  }
  const { userId, organizationId, fileHash, title, description, caseId, tags, notes } = parsed.data;

  if (organizationId) {
    if (!userId) {
      return NextResponse.json({ error: "userId is required for organization-scoped evidence" }, { status: 400 });
    }
    const membership = await getMembership(userId, organizationId);
    if (!membership) {
      return NextResponse.json({ error: "Not a member of this organization" }, { status: 403 });
    }
    if (!canEditEvidence(membership.role)) {
      return NextResponse.json({ error: "Insufficient role for organization-scoped evidence" }, { status: 403 });
    }
  }

  const payload = {
    title: title ?? null,
    description: description ?? null,
    case_id: caseId ?? null,
    tags: tags ?? null,
    notes: notes ?? null,
    updated_at: new Date().toISOString(),
  };

  // Select-then-update-or-insert: evidence table has no UNIQUE(file_hash), so we can't use upsert.
  const { data: existing } = await supabase
    .from("evidence")
    .select("id")
    .eq("file_hash", fileHash)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { data: updated, error } = await supabase
      .from("evidence")
      .update(payload)
      .eq("id", existing.id)
      .select("*")
      .maybeSingle();
    if (error) {
      console.error("Supabase POST /api/evidence update error:", error);
      return NextResponse.json({ error: "Failed to save evidence" }, { status: 500 });
    }
    return NextResponse.json({ item: updated });
  }

  const { data: inserted, error } = await supabase
    .from("evidence")
    .insert({
      user_id: userId ?? null,
      organization_id: organizationId ?? null,
      file_hash: fileHash,
      ...payload,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Supabase POST /api/evidence insert error:", error);
    return NextResponse.json({ error: "Failed to save evidence" }, { status: 500 });
  }

  return NextResponse.json({ item: inserted });
}
