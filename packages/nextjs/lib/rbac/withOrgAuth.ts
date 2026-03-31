import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { type MembershipRow, getMembership } from "~~/lib/rbac/getMembership";
import { type OrgRole, hasRoleAtLeast } from "~~/lib/rbac/roles";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

export type OrgAuthResult = {
  user: User;
  membership: { role: OrgRole; row: MembershipRow };
};

export async function withOrgAuth(
  req: NextRequest,
  organizationId: string,
  minRole: OrgRole = "viewer",
): Promise<OrgAuthResult | NextResponse> {
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

export function isOrgAuthError(result: OrgAuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
