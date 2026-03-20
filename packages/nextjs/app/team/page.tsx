"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PlusIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

type OrgItem = {
  id: string;
  name: string;
  slug: string | null;
  created_at: string;
  updated_at: string;
  myRole: string;
};

export default function TeamPage() {
  const { session, user } = useSupabaseAuth();
  const [organizations, setOrganizations] = useState<OrgItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrgs = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/organizations", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError((j as { error?: string }).error ?? "Failed to load");
        return;
      }
      const data = (await res.json()) as { organizations: OrgItem[] };
      setOrganizations(data.organizations ?? []);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (user && session?.access_token) void fetchOrgs();
  }, [user, session?.access_token, fetchOrgs]);

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="rounded-2xl bg-primary/10 p-8 border border-primary/20">
          <UserGroupIcon className="h-12 w-12 text-primary mx-auto mb-3" />
          <h1 className="text-xl font-bold text-base-content mb-2">Teams & organizations</h1>
          <p className="text-sm text-base-content/70 max-w-sm mb-4">
            Create organizations, invite members, and manage roles. Sign in to continue.
          </p>
          <Link href="/login" className="btn btn-primary btn-sm">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-base-content">Teams & organizations</h1>
        <Link href="/team/new" className="btn btn-primary btn-sm gap-1">
          <PlusIcon className="h-4 w-4" />
          New organization
        </Link>
      </div>
      {error && <div className="rounded-lg bg-error/10 text-error text-sm p-3 mb-4">{error}</div>}
      {loading ? (
        <p className="text-sm text-base-content/60">Loading…</p>
      ) : organizations.length === 0 ? (
        <div className="rounded-2xl bg-base-200/50 p-8 border border-base-300 text-center">
          <p className="text-base-content/70 mb-4">You’re not in any organization yet.</p>
          <Link href="/team/new" className="btn btn-primary btn-sm">
            Create your first organization
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {organizations.map(org => (
            <li key={org.id}>
              <Link
                href={`/team/${org.id}`}
                className="card bg-base-100 border border-base-300 shadow-sm hover:border-primary/30 transition-colors block"
              >
                <div className="card-body flex-row items-center gap-4 py-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <UserGroupIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-base-content">{org.name}</h2>
                    <p className="text-xs text-base-content/60">
                      {org.slug ? `/${org.slug}` : org.id.slice(0, 8)} · You: {org.myRole}
                    </p>
                  </div>
                  <span className="text-base-content/40">→</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
