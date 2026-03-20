import { NextRequest, NextResponse } from "next/server";
import { getOrganizationIdsForUser } from "~~/lib/rbac/getMembership";
import { type OrgRole } from "~~/lib/rbac/roles";
import { getSupabase } from "~~/lib/supabase";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgIds = await getOrganizationIdsForUser(user.id);
  if (orgIds.length === 0) return NextResponse.json({ organizations: [] });
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Server error" }, { status: 500 });
  const { data: orgs, error } = await supabase
    .from("organizations")
    .select("id, name, slug, created_at, updated_at")
    .in("id", orgIds)
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: memberships } = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .in("organization_id", orgIds);
  const roleByOrg = (memberships ?? []).reduce<Record<string, OrgRole>>((acc, m) => {
    acc[m.organization_id] = m.role as OrgRole;
    return acc;
  }, {});
  const list = (orgs ?? []).map(o => ({ ...o, myRole: roleByOrg[o.id] ?? "viewer" }));
  return NextResponse.json({ organizations: list });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { name?: string; slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  const slug = typeof body.slug === "string" ? body.slug.trim() || null : null;
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Server error" }, { status: 500 });
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name, slug, updated_at: new Date().toISOString() })
    .select("id, name, slug, created_at, updated_at")
    .single();
  if (orgError) return NextResponse.json({ error: orgError.message }, { status: 500 });
  const { error: memError } = await supabase.from("memberships").insert({
    organization_id: org.id,
    user_id: user.id,
    role: "owner",
  });
  if (memError) {
    await supabase.from("organizations").delete().eq("id", org.id);
    return NextResponse.json({ error: memError.message }, { status: 500 });
  }
  return NextResponse.json({ organization: { ...org, myRole: "owner" as OrgRole } });
}
