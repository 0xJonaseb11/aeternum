import { NextRequest, NextResponse } from "next/server";
import { getMembership } from "~~/lib/rbac/getMembership";
import { type OrgRole, canManageMembers } from "~~/lib/rbac/roles";
import { getSupabase } from "~~/lib/supabase";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

type Params = { params: Promise<{ id: string; userId: string }> };

/** PATCH: set member role. Requires admin or owner. Body: { role: OrgRole }. */
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: orgId, userId: targetUserId } = await params;
  const membership = await getMembership(user.id, orgId);
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });
  if (!canManageMembers(membership.role))
    return NextResponse.json({ error: "Admin or owner required" }, { status: 403 });
  let body: { role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const role = (["owner", "admin", "contributor", "viewer"] as const).includes(body.role as OrgRole)
    ? (body.role as OrgRole)
    : null;
  if (!role) return NextResponse.json({ error: "role must be owner, admin, contributor, or viewer" }, { status: 400 });
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Server error" }, { status: 500 });
  const { error } = await supabase
    .from("memberships")
    .update({ role })
    .eq("organization_id", orgId)
    .eq("user_id", targetUserId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** DELETE: remove member. Requires admin or owner. Cannot remove last owner. */
export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: orgId, userId: targetUserId } = await params;
  const membership = await getMembership(user.id, orgId);
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });
  if (!canManageMembers(membership.role))
    return NextResponse.json({ error: "Admin or owner required" }, { status: 403 });
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Server error" }, { status: 500 });
  const { data: owners } = await supabase
    .from("memberships")
    .select("user_id")
    .eq("organization_id", orgId)
    .eq("role", "owner");
  const ownerIds = (owners ?? []).map(o => o.user_id);
  if (ownerIds.length === 1 && ownerIds[0] === targetUserId)
    return NextResponse.json({ error: "Cannot remove the last owner" }, { status: 400 });
  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("organization_id", orgId)
    .eq("user_id", targetUserId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
