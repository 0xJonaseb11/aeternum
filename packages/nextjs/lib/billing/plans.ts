/**
 * SaaS billing plans foundation.
 * Limits can be enforced in API and UI once Stripe is integrated.
 */

export const PLAN_IDS = ["free", "pro", "business", "enterprise"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export interface PlanLimits {
  proofsPerMonth: number;
  storageBytes: number;
  apiRequestsPerMonth: number;
  teamMembers: number;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    proofsPerMonth: 10,
    storageBytes: 100 * 1024 * 1024, // 100 MB
    apiRequestsPerMonth: 100,
    teamMembers: 1,
  },
  pro: {
    proofsPerMonth: 100,
    storageBytes: 1024 * 1024 * 1024, // 1 GB
    apiRequestsPerMonth: 10_000,
    teamMembers: 1,
  },
  business: {
    proofsPerMonth: 1000,
    storageBytes: 10 * 1024 * 1024 * 1024, // 10 GB
    apiRequestsPerMonth: 100_000,
    teamMembers: 10,
  },
  enterprise: {
    proofsPerMonth: -1, // unlimited
    storageBytes: -1,
    apiRequestsPerMonth: -1,
    teamMembers: -1,
  },
};

export function getPlanLimits(plan: PlanId): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

export function isWithinLimit(plan: PlanId, key: keyof PlanLimits, current: number): boolean {
  const limits = getPlanLimits(plan);
  const max = limits[key];
  if (max === -1) return true;
  return current < max;
}
