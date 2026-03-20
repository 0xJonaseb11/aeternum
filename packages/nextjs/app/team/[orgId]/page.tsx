"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { TrashIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";
import { type OrgRole, canManageMembers } from "~~/lib/rbac/roles";

type Org = {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  description: string | null;
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
  full_name: string | null;
  avatar_url: string | null;
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
          <div className="flex items-start gap-4 mb-6">
            <div className="avatar">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center border border-base-300 relative overflow-hidden">
                {org.logo_url ? (
                  <Image src={org.logo_url} alt="Org Logo" className="object-cover" fill unoptimized />
                ) : (
                  <UserGroupIcon className="h-8 w-8 text-primary" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-base-content">{org.name}</h1>
              <p className="text-xs text-base-content/60 font-mono mt-1">
                {org.slug ? `/${org.slug}` : org.id} · Role: <span className="capitalize">{org.myRole}</span>
              </p>
              {org.description && <p className="text-sm text-base-content/80 mt-2 max-w-xl">{org.description}</p>}
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
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center relative overflow-hidden">
                        {m.avatar_url ? (
                          <Image src={m.avatar_url} alt="Avatar" className="object-cover" fill unoptimized />
                        ) : (
                          <span className="text-xs font-bold text-base-content/50 uppercase">
                            {m.full_name?.[0] || m.email?.[0] || "?"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-sm text-base-content/80 flex items-center gap-2">
                        {m.full_name || <span className="italic opacity-50">Unknown Name</span>}
                        {m.user_id === user.id && <span className="badge badge-primary badge-xs">You</span>}
                      </div>
                      <div className="text-xs text-base-content/50">{m.email || m.user_id.slice(0, 8)}</div>
                    </div>
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
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-base-content mb-3">Invite by email</h2>
              <p className="text-xs text-base-content/60 mb-2">
                They must have signed in at least once (have an account).
              </p>
              <form onSubmit={handleInviteByEmail} className="flex flex-wrap items-end gap-2">
                <input
                  type="email"
                  className="input input-bordered flex-1 min-w-[200px]"
                  placeholder="jonas@aeternum.io"
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
                <button type="submit" className="btn btn-primary btn-sm" disabled={inviting || !inviteEmail.trim()}>
                  {inviting ? "Inviting…" : "Invite"}
                </button>
              </form>
            </section>
          )}
          {canManage && <OrgSettingsEditor session={session as any} org={org} fetchOrg={fetchOrg} />}
        </>
      )}
    </>
  );
}

function OrgSettingsEditor({ session, org, fetchOrg }: Readonly<{ session: any; org: Org; fetchOrg: () => void }>) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: org.name || "",
    slug: org.slug || "",
    logo_url: org.logo_url || "",
    description: org.description || "",
  });

  useEffect(() => {
    setFormData({
      name: org.name || "",
      slug: org.slug || "",
      logo_url: org.logo_url || "",
      description: org.description || "",
    });
  }, [org]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/organizations/${org.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to update organization");
      }
      toast.success("Organization updated");
      setEditing(false);
      fetchOrg();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <section className="mb-8 border-t border-base-300 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-base-content">Organization Settings</h2>
            <p className="text-xs text-base-content/60">Update profile, logo, and metadata.</p>
          </div>
          <button className="btn btn-sm btn-outline" onClick={() => setEditing(true)}>
            Edit Details
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 border-t border-base-300 pt-6">
      <h2 className="text-lg font-semibold text-base-content mb-4">Edit Organization</h2>
      <div className="card bg-base-100 border border-base-300 shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label" htmlFor="org-name">
              <span className="label-text font-bold">Organization Name</span>
            </label>
            <input
              id="org-name"
              type="text"
              className="input input-bordered"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-control">
            <label className="label" htmlFor="org-slug">
              <span className="label-text font-bold">URL Slug</span>
            </label>
            <input
              id="org-slug"
              type="text"
              className="input input-bordered"
              placeholder="my-company"
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>
        </div>
        <div className="form-control">
          <label className="label" htmlFor="org-logo">
            <span className="label-text font-bold">Logo URL</span>
          </label>
          <input
            id="org-logo"
            type="url"
            className="input input-bordered"
            placeholder="https://..."
            value={formData.logo_url}
            onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
          />
        </div>
        <div className="form-control">
          <label className="label" htmlFor="org-desc">
            <span className="label-text font-bold">Description</span>
          </label>
          <textarea
            id="org-desc"
            className="textarea textarea-bordered h-24"
            placeholder="Tell us about the organization..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            className="btn btn-sm btn-ghost"
            disabled={saving}
            onClick={() => {
              setEditing(false);
              setFormData({
                name: org.name || "",
                slug: org.slug || "",
                logo_url: org.logo_url || "",
                description: org.description || "",
              });
            }}
          >
            Cancel
          </button>
          <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </section>
  );
}
