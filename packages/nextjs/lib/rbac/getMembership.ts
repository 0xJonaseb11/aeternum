import type { OrgRole } from "~~/lib/rbac/roles";
import { getSupabase } from "~~/lib/supabase";

export type MembershipRow = {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  created_at: string;
};

/** Get the current user's membership in an org, if any. */
export async function getMembership(
  userId: string,
  organizationId: string,
): Promise<{
  role: OrgRole;
  row: MembershipRow;
} | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("memberships")
    .select("id, organization_id, user_id, role, created_at")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  const role = data.role as OrgRole;
  if (!["owner", "admin", "contributor", "viewer"].includes(role)) return null;
  return { role, row: data as MembershipRow };
}

/** List all org IDs the user is a member of (for list-my-orgs). */
export async function getOrganizationIdsForUser(userId: string): Promise<string[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from("memberships").select("organization_id").eq("user_id", userId);
  if (error || !data?.length) return [];
  return [...new Set(data.map(r => r.organization_id))];
}
