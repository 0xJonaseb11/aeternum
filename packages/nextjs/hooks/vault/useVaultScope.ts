"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

export type VaultScope = { type: "personal" } | { type: "org"; orgId: string; name: string };

type OrgItem = {
  id: string;
  name: string;
  slug: string | null;
  myRole: string;
};

const STORAGE_KEY = "aeternum_vault_scope_org_id";

export function useVaultScope() {
  const { session, user } = useSupabaseAuth();
  const [organizations, setOrganizations] = useState<OrgItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [scope, setScopeState] = useState<VaultScope>({ type: "personal" });

  const fetchOrgs = useCallback(async () => {
    if (!session?.access_token) {
      setOrganizations([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/organizations", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        setOrganizations([]);
        return;
      }
      const data = (await res.json()) as { organizations?: OrgItem[] };
      setOrganizations(data.organizations ?? []);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (user && session?.access_token) void fetchOrgs();
    else setOrganizations([]);
  }, [user, session?.access_token, fetchOrgs]);

  useEffect(() => {
    if (organizations.length === 0) return;
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved) {
        const org = organizations.find(o => o.id === saved);
        if (org) setScopeState({ type: "org", orgId: org.id, name: org.name });
      }
    } catch {}
  }, [organizations]);

  const setScope = useCallback((next: VaultScope) => {
    setScopeState(next);
    if (next.type === "org") {
      try {
        if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, next.orgId);
      } catch {}
    } else {
      try {
        if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }, []);

  return {
    scope,
    setScope,
    organizations,
    loadingOrgs: loading,
  };
}
