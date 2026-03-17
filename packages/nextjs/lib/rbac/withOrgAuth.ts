/**
 * Reusable org-scoped auth middleware.
 *
 * Validates the current request has a valid Supabase session and the user
 * holds at least the required role within the specified organization.
 * Returns the authenticated user and their membership, or an error response.
 */
import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { type MembershipRow, getMembership } from "~~/lib/rbac/getMembership";
import { type OrgRole, hasRoleAtLeast } from "~~/lib/rbac/roles";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

export type OrgAuthResult = {
  user: User;
  membership: { role: OrgRole; row: MembershipRow };
};

/**
 * Check org-scoped authorization.
 * Returns either an `OrgAuthResult` or a `NextResponse` (error).
 */
export async function withOrgAuth(
  req: NextRequest,
  organizationId: string,
  minRole: OrgRole = "viewer",
): Promise<OrgAuthResult | NextResponse> {
  const user = await getCurrentUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getMembership(user.id, organizationId);
  if (!membership) {
    return NextResponse.json({ error: "Not a member of this organization" }, { status: 403 });
  }

  if (!hasRoleAtLeast(membership.role, minRole)) {
    return NextResponse.json(
      { error: `Requires ${minRole} role or higher (you have ${membership.role})` },
      { status: 403 },
    );
  }

  return { user, membership };
}

/** Type guard to check if result is an error response. */
export function isOrgAuthError(result: OrgAuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
