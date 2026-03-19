import { NextRequest, NextResponse } from "next/server";
import { getMembership } from "~~/lib/rbac/getMembership";
import { hasRoleAtLeast } from "~~/lib/rbac/roles";
import { getSupabase } from "~~/lib/supabase";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const membership = await getMembership(user.id, id);
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Server error" }, { status: 500 });
  const { data: org, error } = await supabase
    .from("organizations")
    .select("id, name, slug, created_at, updated_at")
    .eq("id", id)
    .single();
  if (error || !org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  return NextResponse.json({ organization: { ...org, myRole: membership.role } });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const membership = await getMembership(user.id, id);
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });
  if (!hasRoleAtLeast(membership.role, "admin"))
    return NextResponse.json({ error: "Admin or owner required" }, { status: 403 });
  let body: { name?: string; slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const updates: { name?: string; slug?: string | null; updated_at: string } = {
    updated_at: new Date().toISOString(),
  };
  if (typeof body.name === "string") updates.name = body.name.trim();
  if (typeof body.slug === "string") updates.slug = body.slug.trim() || null;
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Server error" }, { status: 500 });
  const { data: org, error } = await supabase
    .from("organizations")
    .update(updates)
    .eq("id", id)
    .select("id, name, slug, created_at, updated_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ organization: { ...org, myRole: membership.role } });
}
