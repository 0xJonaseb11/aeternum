/**
 * Organization membership roles for SaaS RBAC.
 * Enforce in API and UI when org-scoped evidence and shared vaults are implemented.
 */

export const ORG_ROLES = ["owner", "admin", "contributor", "viewer"] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

/** Role hierarchy: owner > admin > contributor > viewer */
export const ROLE_ORDER: Record<OrgRole, number> = {
  owner: 4,
  admin: 3,
  contributor: 2,
  viewer: 1,
};

export function hasRoleAtLeast(userRole: OrgRole, required: OrgRole): boolean {
  return ROLE_ORDER[userRole] >= ROLE_ORDER[required];
}

export function canManageMembers(role: OrgRole): boolean {
  return hasRoleAtLeast(role, "admin");
}

export function canEditEvidence(role: OrgRole): boolean {
  return hasRoleAtLeast(role, "contributor");
}

export function canViewEvidence(role: OrgRole): boolean {
  return hasRoleAtLeast(role, "viewer");
}
