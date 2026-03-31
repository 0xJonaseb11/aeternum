"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useOrganization } from "~~/hooks/useOrganization";
import { notification } from "~~/utils/scaffold-eth";

export default function OrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { organization, members, isLoading, error, updateOrg, addMember } = useOrganization(id);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [newMemberId, setNewMemberId] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("viewer");

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
        <div className="text-error font-bold">Error loading organization</div>
        <div className="text-base-content/60">{error}</div>
        <Link href="/vault" className="btn btn-ghost btn-sm">
          <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to Vault
        </Link>
      </div>
    );
  }

  if (!organization) return null;

  const canManage = organization.myRole === "owner" || organization.myRole === "admin";

  const handleUpdate = async () => {
    try {
      await updateOrg({ name: name || organization.name, description: description || organization.description });
      setIsEditing(false);
      notification.success("Organization updated");
    } catch (err: unknown) {
      notification.error(err instanceof Error ? err.message : String(err));
    }
  };

  const handleInvite = async () => {
    if (!newMemberId.trim()) return;
    try {
      await addMember(newMemberId, newMemberRole);
      setNewMemberId("");
      notification.success("Member added");
    } catch (err: unknown) {
      notification.error(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 bg-pattern">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 glass p-8 rounded-3xl border border-primary/10 shadow-xl">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shrink-0">
              <BuildingOfficeIcon className="w-10 h-10 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight truncate">{organization.name}</h1>
                <div className="badge badge-primary badge-outline font-bold uppercase tracking-wider text-[10px] px-3 py-2">
                  {organization.myRole}
                </div>
              </div>
              <p className="text-base-content/60 mt-1 max-w-md line-clamp-2">
                {organization.description || "Secure collaborative evidence vault for professional teams."}
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Link href="/vault" className="btn btn-primary grow sm:grow-0 rounded-xl gap-2 h-12">
              <MagnifyingGlassIcon className="w-5 h-5" />
              Open Vault
            </Link>
            {canManage && (
              <button
                onClick={() => {
                  setName(organization.name);
                  setDescription(organization.description || "");
                  setIsEditing(!isEditing);
                }}
                className={`btn btn-ghost rounded-xl h-12 w-12 p-0 ${isEditing ? "text-primary" : ""}`}
              >
                <Cog6ToothIcon className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="glass p-8 rounded-3xl border border-primary/20 shadow-xl animate-in fade-in slide-in-from-top duration-300">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Cog6ToothIcon className="w-5 h-5 text-primary" />
              Organization Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold uppercase text-[10px] tracking-widest text-base-content/60">
                    Organization Name
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full rounded-xl bg-base-100/50"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold uppercase text-[10px] tracking-widest text-base-content/60">
                    Description
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full rounded-xl bg-base-100/50"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsEditing(false)} className="btn btn-ghost rounded-xl">
                Cancel
              </button>
              <button onClick={handleUpdate} className="btn btn-primary rounded-xl px-8">
                Save Changes
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Members List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-3xl overflow-hidden border border-primary/10 shadow-lg">
              <div className="p-6 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <UserGroupIcon className="w-5 h-5 text-primary" />
                  Team Members
                </h2>
                <span className="badge badge-primary badge-sm font-bold">{members.length} Total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-base-300/10 border-b border-base-300">
                      <th className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-base-content/40 pl-6">
                        Member
                      </th>
                      <th className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-base-content/40">
                        Role
                      </th>
                      <th className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-base-content/40">
                        Joined
                      </th>
                      {canManage && <th className="bg-transparent pr-6"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-300/50">
                    {members.map(member => (
                      <tr key={member.id} className="hover:bg-primary/5 transition-colors group">
                        <td className="bg-transparent py-4 pl-6">
                          <div className="flex items-center gap-4">
                            <div className="avatar placeholder">
                              <div className="bg-primary/10 text-primary rounded-xl w-10 border border-primary/10">
                                {member.avatar_url ? (
                                  <Image
                                    src={member.avatar_url}
                                    alt={member.full_name || ""}
                                    width={40}
                                    height={40}
                                    className="rounded-xl"
                                  />
                                ) : (
                                  <span className="text-sm font-bold">
                                    {(member.full_name || member.email || "M")[0].toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-sm">{member.full_name || "New Member"}</div>
                              <div className="text-[10px] text-base-content/40 font-mono">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="bg-transparent">
                          <span
                            className={`badge badge-sm font-bold uppercase tracking-wider text-[9px] px-2 py-2 border-0 ${
                              member.role === "owner"
                                ? "bg-primary/20 text-primary"
                                : member.role === "admin"
                                  ? "bg-secondary/20 text-secondary-content"
                                  : "bg-base-200 text-base-content/60"
                            }`}
                          >
                            {member.role}
                          </span>
                        </td>
                        <td className="bg-transparent text-xs text-base-content/40">
                          {new Date(member.created_at).toLocaleDateString()}
                        </td>
                        {canManage && (
                          <td className="bg-transparent pr-6 text-right">
                            {member.role !== "owner" && (
                              <button className="btn btn-ghost btn-xs btn-circle text-error opacity-0 group-hover:opacity-100 transition-opacity">
                                &times;
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {canManage && (
              <div className="glass p-8 rounded-3xl border border-primary/10 shadow-lg">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <PlusIcon className="w-5 h-5 text-primary" />
                  Invite Member
                </h3>
                <p className="text-xs text-base-content/60 mb-6 font-medium">
                  Add team members by their unique user ID to grant them access to this secure vault.
                </p>
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label p-1">
                      <span className="label-text text-[10px] font-bold uppercase tracking-widest text-base-content/50">
                        User ID
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Paste User ID here"
                      className="input input-bordered w-full rounded-xl bg-base-100/50 text-xs font-mono h-11"
                      value={newMemberId}
                      onChange={e => setNewMemberId(e.target.value)}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label p-1">
                      <span className="label-text text-[10px] font-bold uppercase tracking-widest text-base-content/50">
                        Role
                      </span>
                    </label>
                    <select
                      className="select select-bordered w-full rounded-xl bg-base-100/50 text-xs h-11"
                      value={newMemberRole}
                      onChange={e => setNewMemberRole(e.target.value)}
                    >
                      <option value="viewer">Viewer (Read-only)</option>
                      <option value="contributor">Contributor (Upload)</option>
                      <option value="admin">Admin (Manage)</option>
                    </select>
                  </div>
                  <button
                    onClick={handleInvite}
                    disabled={!newMemberId.trim()}
                    className="btn btn-primary w-full rounded-xl mt-4 h-11"
                  >
                    Add to Team
                  </button>
                </div>
              </div>
            )}

            <div className="glass p-8 rounded-3xl border border-primary/5 shadow-md bg-gradient-to-br from-primary/5 to-transparent">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-primary" />
                Security Notice
              </h3>
              <p className="text-xs text-base-content/50 leading-relaxed font-medium">
                Organization vaults inherit the same end-to-end encryption principles. All evidence is encrypted
                client-side. Team members MUST hold individual secret keys or share them securely off-app.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
