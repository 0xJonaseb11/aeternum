import { NextRequest, NextResponse } from "next/server";
import { getMembership } from "~~/lib/rbac/getMembership";
import { type OrgRole, canManageMembers } from "~~/lib/rbac/roles";
import { getSupabase } from "~~/lib/supabase";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

type Params = { params: Promise<{ id: string }> };

/** GET: list members of the organization. Requires membership. */
export async function GET(req: NextRequest, { params }: Params) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: orgId } = await params;
  const membership = await getMembership(user.id, orgId);
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Server error" }, { status: 500 });
  const { data: rows, error } = await supabase
    .from("memberships")
    .select("id, user_id, role, created_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const userIds = [...new Set((rows ?? []).map(r => r.user_id))];
  const { data: profiles } = await supabase.from("profiles").select("id, email").in("id", userIds);
  const profileBy = (profiles ?? []).reduce<Record<string, { email: string | null }>>((acc, p) => {
    acc[p.id] = { email: p.email ?? null };
    return acc;
  }, {});
  const members = (rows ?? []).map(r => ({
    id: r.id,
    user_id: r.user_id,
    role: r.role as OrgRole,
    created_at: r.created_at,
    email: profileBy[r.user_id]?.email ?? null,
  }));
  return NextResponse.json({ members });
}

/** POST: add a member. Body: { user_id: string, role: OrgRole }. Requires admin or owner. */
export async function POST(req: NextRequest, { params }: Params) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: orgId } = await params;
  const membership = await getMembership(user.id, orgId);
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });
  if (!canManageMembers(membership.role))
    return NextResponse.json({ error: "Admin or owner required" }, { status: 403 });
  let body: { user_id?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const userId = typeof body.user_id === "string" ? body.user_id.trim() : "";
  if (!userId) return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  const role = (["owner", "admin", "contributor", "viewer"] as const).includes(body.role as OrgRole)
    ? (body.role as OrgRole)
    : "viewer";
  if (role === "owner") return NextResponse.json({ error: "Use transfer to add another owner" }, { status: 400 });
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Server error" }, { status: 500 });
  const { error: insertError } = await supabase.from("memberships").insert({
    organization_id: orgId,
    user_id: userId,
    role,
  });
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  const { data: row } = await supabase
    .from("memberships")
    .select("id, user_id, role, created_at")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .single();
  const { data: profile } = await supabase.from("profiles").select("id, email").eq("id", userId).maybeSingle();
  return NextResponse.json({
    member: {
      id: row?.id,
      user_id: userId,
      role: row?.role ?? role,
      created_at: row?.created_at,
      email: profile?.email ?? null,
    },
  });
}
