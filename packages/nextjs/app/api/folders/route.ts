import { NextRequest, NextResponse } from "next/server";
import { getMembership } from "~~/lib/rbac/getMembership";
import { canEditEvidence } from "~~/lib/rbac/roles";
import { getSupabase } from "~~/lib/supabase";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";
import { folderPostSchema } from "~~/lib/validation/schemas";

/** GET: list folders for the current user (personal or org). Query: organizationId (optional). */
export async function GET(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Server error" }, { status: 500 });
  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get("organizationId");

  let query = supabase.from("folders").select("id, name, created_at").eq("user_id", user.id);
  if (organizationId != null && organizationId !== "") {
    const membership = await getMembership(user.id, organizationId);
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    query = query.eq("organization_id", organizationId);
  } else {
    query = query.is("organization_id", null);
  }
  query = query.order("name", { ascending: true });
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ folders: data ?? [] });
}

/** POST: create folder. Body: { name, organizationId? }. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Server error" }, { status: 500 });
  let body: { name?: string; organizationId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = folderPostSchema.safeParse({ name: body.name });
  if (!parsed.success) {
    return NextResponse.json({ error: "name is required (1–200 chars)" }, { status: 400 });
  }
  const organizationId =
    typeof body.organizationId === "string" && body.organizationId.trim() !== "" ? body.organizationId.trim() : null;
  if (organizationId) {
    const membership = await getMembership(user.id, organizationId);
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!canEditEvidence(membership.role)) return NextResponse.json({ error: "Insufficient role" }, { status: 403 });
  }
  const { data: folder, error } = await supabase
    .from("folders")
    .insert({
      user_id: user.id,
      organization_id: organizationId,
      name: parsed.data.name.trim(),
    })
    .select("id, name, created_at")
    .single();
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Folder with this name already exists" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ folder });
}
