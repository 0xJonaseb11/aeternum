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
        headers: { Authorization: `Bearer ${session?.access_token}` },
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
      <section className="flex flex-col grow items-center justify-center min-h-[50vh] px-4 py-8">
        <div className="glass p-8 md:p-10 rounded-[2.5rem] border border-primary/20 text-center max-w-lg shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <UserGroupIcon className="h-16 w-16 text-primary mx-auto mb-6 animate-bounce-slow" />
          <h1 className="text-2xl md:text-3xl font-black mb-3 tracking-tight">Teams & organizations</h1>
          <p className="text-base text-base-content/60 mb-8 leading-relaxed max-w-sm mx-auto">
            Create organizations, invite members, and manage roles. Sign in to your vault to continue.
          </p>
          <Link
            href="/login"
            className="btn btn-primary btn-lg rounded-2xl px-10 h-14 text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            Enter your vault
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col grow w-full min-w-0">
      <section className="relative pt-8 pb-10 lg:pt-12 lg:pb-16 overflow-hidden border-b border-base-300/50">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(var(--color-primary-rgb),0.08),transparent_70%)]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight text-base-content">
              Teams & <br />
              <span className="text-primary italic drop-shadow-sm">organizations</span>
            </h1>

            <p className="text-lg md:text-xl text-base-content/60 max-w-2xl mx-auto font-medium leading-relaxed">
              Scale your security by inviting team members. <br />
              Manage shared evidence vaults and role-based access.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-base-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="h-1 w-8 bg-primary rounded-full"></div>
              <h3 className="text-sm font-black uppercase tracking-widest text-base-content/40">
                Active Organizations
              </h3>
            </div>
            <Link
              href="/team/new"
              className="btn btn-primary btn-sm rounded-xl gap-1.5 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              <PlusIcon className="h-4 w-4" />
              New organization
            </Link>
          </div>

          {error && (
            <div className="rounded-2xl bg-error/10 text-error text-sm p-4 mb-8 border border-error/20 flex items-center gap-3 font-semibold">
              <div className="h-2 w-2 rounded-full bg-error animate-pulse" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-4 py-12">
              <span className="loading loading-spinner text-primary"></span>
              <p className="text-lg font-bold text-base-content/40 uppercase tracking-widest">Loading history…</p>
            </div>
          ) : organizations.length === 0 ? (
            <div className="rounded-[2.5rem] bg-base-200/30 glass p-16 border border-base-300/50 text-center max-w-2xl mx-auto shadow-sm">
              <div className="bg-primary/5 p-6 rounded-full w-fit mx-auto mb-8">
                <UserGroupIcon className="h-12 w-12 text-primary/30" />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">Expand your horizon</h3>
              <p className="text-lg text-base-content/60 mb-10 leading-relaxed">
                You haven&apos;t joined or created any organizations yet. Start collaborating by creating your first
                team.
              </p>
              <Link
                href="/team/new"
                className="btn btn-primary btn-lg rounded-2xl px-12 h-16 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all"
              >
                Create first organization
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {organizations.map(org => (
                <li key={org.id}>
                  <Link
                    href={`/team/${org.id}`}
                    className="group relative flex flex-col p-8 rounded-[2rem] bg-base-100 border border-base-300 shadow-sm hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex items-center gap-6">
                      <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10 group-hover:bg-primary group-hover:text-primary-content group-hover:scale-110 transition-all duration-500">
                        <UserGroupIcon className="h-8 w-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-black text-base-content mb-1 tracking-tight group-hover:text-primary transition-colors">
                          {org.name}
                        </h2>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-widest text-base-content/40">
                            {org.slug ? `@${org.slug}` : org.id.slice(0, 8)}
                          </span>
                          <div className="h-1 w-1 bg-current opacity-20 rounded-full" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                            {org.myRole}
                          </span>
                        </div>
                      </div>
                      <div className="text-base-content/20 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300">
                        <PlusIcon className="h-6 w-6 rotate-45" />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
