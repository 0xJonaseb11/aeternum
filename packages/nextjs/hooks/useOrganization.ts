"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

export type OrgMember = {
  id: string;
  user_id: string;
  role: "owner" | "admin" | "contributor" | "viewer";
  created_at: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export type OrganizationDetail = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  logo_url: string | null;
  myRole: string;
  created_at: string;
  updated_at: string;
};

export function useOrganization(orgId: string | undefined) {
  const { session } = useSupabaseAuth();
  const [organization, setOrganization] = useState<OrganizationDetail | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!orgId || !session?.access_token) return;

    setIsLoading(true);
    setError(null);
    try {
      const authHeader = { Authorization: `Bearer ${session?.access_token}` };

      const [orgRes, membersRes] = await Promise.all([
        fetch(`/api/organizations/${orgId}`, { headers: authHeader }),
        fetch(`/api/organizations/${orgId}/members`, { headers: authHeader }),
      ]);

      if (!orgRes.ok) throw new Error("Failed to fetch organization");
      if (!membersRes.ok) throw new Error("Failed to fetch members");

      const orgData = await orgRes.json();
      const membersData = await membersRes.json();

      setOrganization(orgData.organization);
      setMembers(membersData.members);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [orgId, session?.access_token]);

  useEffect(() => {
    if (orgId && session?.access_token) {
      void fetchData();
    }
  }, [orgId, session?.access_token, fetchData]);

  const updateOrg = async (updates: Partial<OrganizationDetail>) => {
    if (!orgId || !session?.access_token) return;
    const res = await fetch(`/api/organizations/${orgId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || "Failed to update organization");
    }
    const d = await res.json();
    setOrganization(d.organization);
    return d.organization;
  };

  const addMember = async (userId: string, role: string) => {
    if (!orgId || !session?.access_token) return;
    const res = await fetch(`/api/organizations/${orgId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ user_id: userId, role }),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || "Failed to add member");
    }
    const d = await res.json();
    setMembers(prev => [...prev, d.member]);
    return d.member;
  };

  return {
    organization,
    members,
    isLoading,
    error,
    refresh: fetchData,
    updateOrg,
    addMember,
  };
}
