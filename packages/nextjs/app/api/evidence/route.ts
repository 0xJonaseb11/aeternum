import { NextRequest, NextResponse } from "next/server";
import { logger } from "~~/lib/logger";
import { getMembership } from "~~/lib/rbac/getMembership";
import { canEditEvidence } from "~~/lib/rbac/roles";
import { getSupabase } from "~~/lib/supabase";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";
import { evidencePostSchema } from "~~/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const fileHash = searchParams.get("fileHash");
  const userIdParam = searchParams.get("userId");
  const organizationIdParam = searchParams.get("organizationId");

  if (!fileHash) {
    return NextResponse.json({ error: "Missing fileHash" }, { status: 400 });
  }

  let userId: string | null = userIdParam;
  let organizationId: string | null = organizationIdParam;
  if (userIdParam != null || (organizationIdParam != null && organizationIdParam !== "")) {
    const user = await getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (organizationIdParam != null && organizationIdParam !== "") {
      const membership = await getMembership(user.id, organizationIdParam);
      if (!membership) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      userId = user.id;
      organizationId = organizationIdParam;
    } else {
      userId = user.id;
      organizationId = null;
    }
  }

  let query = supabase.from("evidence").select("*").eq("file_hash", fileHash).limit(1);
  if (userId) {
    query = query.eq("user_id", userId);
  }
  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data, error } = await query.maybeSingle();

  if (error && error.code !== "PGRST116") {
    logger.error("Supabase evidence GET error", { error: error.message });
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
  let { userId, organizationId } = parsed.data;
  const { fileHash, title, description, caseId, tags, notes, folderId } = parsed.data;

  if (userId != null || (organizationId != null && organizationId !== "")) {
    const user = await getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = user.id;
    if (organizationId != null && organizationId !== "") {
      const membership = await getMembership(user.id, organizationId);
      if (!membership) {
        return NextResponse.json({ error: "Not a member of this organization" }, { status: 403 });
      }
      if (!canEditEvidence(membership.role)) {
        return NextResponse.json({ error: "Insufficient role for organization-scoped evidence" }, { status: 403 });
      }
    } else {
      organizationId = null;
    }
  }

  if (folderId != null && folderId !== "" && (userId != null || organizationId != null)) {
    const { data: folder } = await supabase
      .from("folders")
      .select("id, user_id, organization_id")
      .eq("id", folderId)
      .maybeSingle();
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }
    const folderUserMatch = folder.user_id === userId;
    const folderOrgMatch =
      (organizationId != null && folder.organization_id === organizationId) ||
      (organizationId == null && folder.organization_id == null);
    if (!folderUserMatch || !folderOrgMatch) {
      return NextResponse.json({ error: "Folder not in your scope" }, { status: 403 });
    }
  }

  const payload = {
    title: title ?? null,
    description: description ?? null,
    case_id: caseId ?? null,
    tags: tags ?? null,
    notes: notes ?? null,
    folder_id: folderId ?? null,
    updated_at: new Date().toISOString(),
  };

  let existingQuery = supabase.from("evidence").select("id").eq("file_hash", fileHash).limit(1);
  if (userId != null) existingQuery = existingQuery.eq("user_id", userId);
  if (organizationId != null) existingQuery = existingQuery.eq("organization_id", organizationId);
  else if (userId != null) existingQuery = existingQuery.is("organization_id", null);
  const { data: existing } = await existingQuery.maybeSingle();

  if (existing?.id) {
    const { data: updated, error } = await supabase
      .from("evidence")
      .update(payload)
      .eq("id", existing.id)
      .select("*")
      .maybeSingle();
    if (error) {
      logger.error("Supabase POST /api/evidence update error", { error: error.message });
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
      folder_id: folderId ?? null,
      title: payload.title,
      description: payload.description,
      case_id: payload.case_id,
      tags: payload.tags,
      notes: payload.notes,
      updated_at: payload.updated_at,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    logger.error("Supabase POST /api/evidence insert error", { error: error.message });
    return NextResponse.json({ error: "Failed to save evidence" }, { status: 500 });
  }

  return NextResponse.json({ item: inserted });
}
