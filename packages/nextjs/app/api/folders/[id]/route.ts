import { NextRequest, NextResponse } from "next/server";
import { getMembership } from "~~/lib/rbac/getMembership";
import { canEditEvidence } from "~~/lib/rbac/roles";
import { getSupabase } from "~~/lib/supabase";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: folderId } = await params;
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Server error" }, { status: 500 });
  const { data: folder, error: fetchErr } = await supabase
    .from("folders")
    .select("id, user_id, organization_id")
    .eq("id", folderId)
    .maybeSingle();
  if (fetchErr || !folder) return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  if (folder.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (folder.organization_id) {
    const membership = await getMembership(user.id, folder.organization_id);
    if (!membership || !canEditEvidence(membership.role))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 200) return NextResponse.json({ error: "name required (1–200 chars)" }, { status: 400 });
  const { error } = await supabase.from("folders").update({ name }).eq("id", folderId);
  if (error) {
    if (error.code === "23505")
      return NextResponse.json({ error: "Folder with this name already exists" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: folderId } = await params;
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Server error" }, { status: 500 });
  const { data: folder, error: fetchErr } = await supabase
    .from("folders")
    .select("id, user_id, organization_id")
    .eq("id", folderId)
    .maybeSingle();
  if (fetchErr || !folder) return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  if (folder.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (folder.organization_id) {
    const membership = await getMembership(user.id, folder.organization_id);
    if (!membership || !canEditEvidence(membership.role))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { error } = await supabase.from("folders").delete().eq("id", folderId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
