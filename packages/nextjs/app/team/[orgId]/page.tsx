"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TrashIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";
import { type OrgRole, canManageMembers } from "~~/lib/rbac/roles";

type Org = {
  id: string;
  name: string;
  slug: string | null;
  created_at: string;
  updated_at: string;
  myRole: OrgRole;
};

type Member = {
  id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
  email: string | null;
};

const ROLE_OPTIONS: OrgRole[] = ["viewer", "contributor", "admin", "owner"];

export default function TeamOrgPage() {
  const params = useParams();
  const orgId = params?.orgId as string | undefined;
  const { session, user } = useSupabaseAuth();
  const [org, setOrg] = useState<Org | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addUserId, setAddUserId] = useState("");
  const [addRole, setAddRole] = useState<OrgRole>("viewer");
  const [adding, setAdding] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("viewer");
  const [inviting, setInviting] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const fetchOrg = useCallback(async () => {
    if (!session?.access_token || !orgId) return;
    const res = await fetch(`/api/organizations/${orgId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) {
      setError("Organization not found or access denied");
      setOrg(null);
      return;
    }
    const data = (await res.json()) as { organization: Org };
    setOrg(data.organization);
  }, [session?.access_token, orgId]);

  const fetchMembers = useCallback(async () => {
    if (!session?.access_token || !orgId) return;
    const res = await fetch(`/api/organizations/${orgId}/members`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) return;
    const data = (await res.json()) as { members: Member[] };
    setMembers(data.members ?? []);
  }, [session?.access_token, orgId]);

  useEffect(() => {
    if (!orgId || !user) {
      setLoading(false);
      return;
    }
    if (!session?.access_token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([fetchOrg(), fetchMembers()]).finally(() => setLoading(false));
  }, [orgId, user, session?.access_token, fetchOrg, fetchMembers]);

  const handleInviteByEmail = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!session?.access_token || !orgId || !inviteEmail.trim()) return;
      setInviting(true);
      setError(null);
      try {
        const res = await fetch(`/api/organizations/${orgId}/invite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError((d as { error?: string }).error ?? "Failed to invite");
          return;
        }
        setInviteEmail("");
        setInviteRole("viewer");
        void fetchMembers();
      } finally {
        setInviting(false);
      }
    },
    [session?.access_token, orgId, inviteEmail, inviteRole, fetchMembers],
  );

  const handleAddMember = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!session?.access_token || !orgId || !addUserId.trim()) return;
      setAdding(true);
      setError(null);
      try {
        const res = await fetch(`/api/organizations/${orgId}/members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ user_id: addUserId.trim(), role: addRole }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setError((d as { error?: string }).error ?? "Failed to add");
          return;
        }
        setAddUserId("");
        setAddRole("viewer");
        void fetchMembers();
      } finally {
        setAdding(false);
      }
    },
    [session?.access_token, orgId, addUserId, addRole, fetchMembers],
  );

  const handleUpdateRole = useCallback(
    async (memberUserId: string, newRole: OrgRole) => {
      if (!session?.access_token || !orgId) return;
      setEditingRole(memberUserId);
      try {
        const res = await fetch(`/api/organizations/${orgId}/members/${memberUserId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ role: newRole }),
        });
        if (res.ok) void fetchMembers();
        setEditingRole(null);
      } finally {
        setEditingRole(null);
      }
    },
    [session?.access_token, orgId, fetchMembers],
  );

  const handleRemove = useCallback(
    async (memberUserId: string) => {
      if (!session?.access_token || !orgId || !confirm("Remove this member?")) return;
      setRemoving(memberUserId);
      try {
        const res = await fetch(`/api/organizations/${orgId}/members/${memberUserId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) void fetchMembers();
        else {
          const d = await res.json().catch(() => ({}));
          setError((d as { error?: string }).error ?? "Failed to remove");
        }
        setRemoving(null);
      } finally {
        setRemoving(null);
      }
    },
    [session?.access_token, orgId, fetchMembers],
  );

  if (!orgId) {
    return (
      <div>
        <p className="text-base-content/60">Invalid organization.</p>
        <Link href="/team" className="link link-hover text-sm mt-2 inline-block">
          Back to Team
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-base-content/70">Sign in to view this organization.</p>
        <Link href="/login" className="btn btn-primary btn-sm">
          Sign in
        </Link>
      </div>
    );
  }

  if (loading) return <p className="text-sm text-base-content/60">Loading…</p>;
  if (error && !org) {
    return (
      <div>
        <p className="text-error">{error}</p>
        <Link href="/team" className="link link-hover text-sm mt-2 inline-block">
          Back to Team
        </Link>
      </div>
    );
  }

  const canManage = org ? canManageMembers(org.myRole) : false;

  return (
    <>
      <div className="mb-6">
        <Link href="/team" className="text-xs font-medium text-base-content/60 hover:text-primary">
          ← Back to Team
        </Link>
      </div>
      {error && <div className="rounded-lg bg-error/10 text-error text-sm p-3 mb-4">{error}</div>}
      {org && (
        <>
          <div className="flex items-center gap-4 mb-6">
            <div className="rounded-lg bg-primary/10 p-3">
              <UserGroupIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-base-content">{org.name}</h1>
              <p className="text-xs text-base-content/60">
                {org.slug ? `/${org.slug}` : org.id} · Your role: <span className="capitalize">{org.myRole}</span>
              </p>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-base-content mb-3">Members</h2>
            <ul className="space-y-2">
              {members.map(m => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-base-300 bg-base-100 p-3"
                >
                  <div>
                    <span className="font-medium text-base-content/80">{m.email || m.user_id.slice(0, 8)}</span>
                    <span className="text-xs text-base-content/50 ml-2 capitalize">({m.role})</span>
                  </div>
                  {canManage && m.user_id !== user.id && (
                    <div className="flex items-center gap-2">
                      <select
                        className="select select-bordered select-xs"
                        value={m.role}
                        disabled={editingRole === m.user_id}
                        onChange={e => handleUpdateRole(m.user_id, e.target.value as OrgRole)}
                      >
                        {ROLE_OPTIONS.map(r => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs text-error"
                        disabled={removing === m.user_id}
                        onClick={() => handleRemove(m.user_id)}
                      >
                        {removing === m.user_id ? "…" : <TrashIcon className="h-4 w-4" />}
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {canManage && (
            <>
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-base-content mb-3">Invite by email</h2>
                <p className="text-xs text-base-content/60 mb-2">
                  They must have signed in at least once (have an account).
                </p>
                <form onSubmit={handleInviteByEmail} className="flex flex-wrap items-end gap-2">
                  <input
                    type="email"
                    className="input input-bordered flex-1 min-w-[200px]"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                  />
                  <select
                    className="select select-bordered"
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as OrgRole)}
                  >
                    {ROLE_OPTIONS.filter(r => r !== "owner").map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={inviting || !inviteEmail.trim()}
                  >
                    {inviting ? "Inviting…" : "Invite"}
                  </button>
                </form>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-base-content mb-3">Add by user ID</h2>
                <p className="text-xs text-base-content/60 mb-2">
                  Add by user ID (UUID) if you know it. Prefer inviting by email above.
                </p>
                <form onSubmit={handleAddMember} className="flex flex-wrap items-end gap-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1 min-w-[200px]"
                    placeholder="User ID (UUID)"
                    value={addUserId}
                    onChange={e => setAddUserId(e.target.value)}
                  />
                  <select
                    className="select select-bordered"
                    value={addRole}
                    onChange={e => setAddRole(e.target.value as OrgRole)}
                  >
                    {ROLE_OPTIONS.filter(r => r !== "owner").map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={adding || !addUserId.trim()}>
                    {adding ? "Adding…" : "Add"}
                  </button>
                </form>
              </section>
            </>
          )}
        </>
      )}
    </>
  );
}
