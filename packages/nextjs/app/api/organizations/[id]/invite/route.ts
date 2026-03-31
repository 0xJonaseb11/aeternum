import { NextRequest, NextResponse } from "next/server";
import { getMembership } from "~~/lib/rbac/getMembership";
import { canManageMembers } from "~~/lib/rbac/roles";
import { getSupabase } from "~~/lib/supabase";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { user, status } = await getCurrentUserFromRequest(req);
  if (status === "maintenance") {
    return NextResponse.json({ error: "System under maintenance. Please try again later." }, { status: 503 });
  }
  if (status === "blocked") {
    return NextResponse.json({ error: "Account blocked." }, { status: 403 });
  }
  if (!user || status === "unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: orgId } = await params;
  const membership = await getMembership(user.id, orgId);
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });
  if (!canManageMembers(membership.role))
    return NextResponse.json({ error: "Admin or owner required" }, { status: 403 });
  let body: { email?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });
  const allowedRoles = ["admin", "contributor", "viewer"] as const;
  type InviteRole = (typeof allowedRoles)[number];
  const role: InviteRole = allowedRoles.includes(body.role as InviteRole) ? (body.role as InviteRole) : "viewer";

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Server error" }, { status: 500 });
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .limit(1)
    .maybeSingle();
  if (profileError || !profile) {
    return NextResponse.json({ error: "No account found with that email" }, { status: 404 });
  }
  const userId = profile.id;
  if (userId === user.id) {
    return NextResponse.json({ error: "You are already a member" }, { status: 400 });
  }

  const { error: insertError } = await supabase.from("memberships").insert({
    organization_id: orgId,
    user_id: userId,
    role,
  });
  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "User is already a member" }, { status: 409 });
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }
  const { data: row } = await supabase
    .from("memberships")
    .select("id, user_id, role, created_at")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .single();
  const { data: profile2 } = await supabase.from("profiles").select("id, email").eq("id", userId).maybeSingle();
  return NextResponse.json({
    member: {
      id: row?.id,
      user_id: userId,
      role: row?.role ?? role,
      created_at: row?.created_at,
      email: profile2?.email ?? email,
    },
  });
}
