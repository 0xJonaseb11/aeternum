"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  PaperAirplaneIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

export default function AdminBroadcast() {
  const { session, user } = useSupabaseAuth();
  const { address } = useAccount();
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"info" | "warning" | "error" | "success">("info");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchBroadcasts = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/broadcasts", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "x-wallet-address": address || "",
        },
      });
      if (!res.ok) throw new Error("Failed to load broadcasts");
      const data = await res.json();
      setBroadcasts(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, address]);

  useEffect(() => {
    if (user) void fetchBroadcasts();
  }, [user, fetchBroadcasts]);

  const handleSave = async (status: "draft" | "sent") => {
    if (!title || !content) {
      toast.error("Title and content are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/broadcasts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          "x-wallet-address": address || "",
        },
        body: JSON.stringify({
          id: editingId,
          title,
          content,
          status,
          type,
        }),
      });

      if (!res.ok) throw new Error("Failed to save broadcast");

      toast.success(status === "sent" ? "Broadcast sent live!" : "Draft saved successfully");

      // Reset form
      setTitle("");
      setContent("");
      setEditingId(null);
      setType("info");

      void fetchBroadcasts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error saving broadcast");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (b: any) => {
    setEditingId(b.id);
    setTitle(b.title);
    setContent(b.content);
    setType(b.type);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!user) return <div className="p-8 text-center mt-20">Sign in to access admin tools.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin" className="btn btn-ghost btn-circle">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <MegaphoneIcon className="h-8 w-8 text-secondary" />
            Broadcast Engine
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            Create system-wide alerts for maintenance, updates, or news.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              {editingId ? (
                <DocumentTextIcon className="h-5 w-5 text-primary" />
              ) : (
                <PlusIcon className="h-5 w-5 text-primary" />
              )}
              {editingId ? "Edit Broadcast" : "New Broadcast"}
            </h2>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-xs uppercase opacity-60">Broadcast Title</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Scheduled Maintenance"
                  className="input input-bordered w-full font-medium"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-xs uppercase opacity-60">Message Content</span>
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="textarea textarea-bordered h-32 w-full leading-relaxed"
                  placeholder="Describe the update cleanly for all users..."
                ></textarea>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-xs uppercase opacity-60">Alert Type</span>
                </label>
                <div className="flex gap-2">
                  {(["info", "warning", "error", "success"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`btn btn-sm capitalize flex-1 ${type === t ? (t === "info" ? "btn-primary" : t === "warning" ? "btn-warning" : t === "error" ? "btn-error" : "btn-success") : "btn-ghost border-base-300"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-base-200">
                <button className="btn btn-primary px-8 gap-2" onClick={() => handleSave("sent")} disabled={saving}>
                  {saving ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <PaperAirplaneIcon className="h-4 w-4" />
                  )}
                  Send Live
                </button>
                <button className="btn btn-outline gap-2" onClick={() => handleSave("draft")} disabled={saving}>
                  <DocumentTextIcon className="h-4 w-4" />
                  Save as Draft
                </button>
                {editingId && (
                  <button
                    className="btn btn-ghost text-error ml-auto"
                    onClick={() => {
                      setEditingId(null);
                      setTitle("");
                      setContent("");
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm sticky top-8 h-fit">
          <div className="card-body">
            <h2 className="text-lg font-bold mb-4 opacity-40">Live Preview</h2>
            <div
              className={`p-4 rounded-2xl border ${type === "info" ? "bg-primary/5 border-primary/20" : type === "warning" ? "bg-warning/5 border-warning/20" : type === "error" ? "bg-error/5 border-error/20" : "bg-success/5 border-success/20"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <MegaphoneIcon
                  className={`h-4 w-4 ${type === "info" ? "text-primary" : type === "warning" ? "text-warning" : type === "error" ? "text-error" : "text-success"}`}
                />
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${type === "info" ? "text-primary" : type === "warning" ? "text-warning" : type === "error" ? "text-error" : "text-success"}`}
                >
                  System {type}
                </span>
              </div>
              <h4 className="font-bold text-sm leading-tight mb-1">{title || "Your Title Here"}</h4>
              <p className="text-xs leading-relaxed opacity-70 whitespace-pre-wrap">
                {content || "Your broadcast message will appear here for all users..."}
              </p>
            </div>
            <div className="mt-8 p-4 bg-base-200/50 rounded-xl text-[10px] text-base-content/50 italic leading-relaxed">
              <CheckCircleIcon className="h-3 w-3 inline mr-1 mb-0.5" />
              Sent broadcasts will be visible to all logged-in users on their main dashboard and vault view.
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="card-body p-0">
          <div className="px-8 pt-8 pb-4 border-b border-base-200">
            <h2 className="text-xl font-bold">Broadcast History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-base-200/50">
                <tr>
                  <th>Status</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Created/Sent</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {broadcasts.map(b => (
                  <tr key={b.id} className="hover:bg-base-200/30 transition-colors">
                    <td>
                      <span
                        className={`badge badge-sm uppercase font-bold ${b.status === "sent" ? "badge-success" : "badge-ghost opacity-60"}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="font-bold text-sm">{b.title}</td>
                    <td>
                      <span className="badge badge-outline badge-xs uppercase font-black tracking-tighter">
                        {b.type}
                      </span>
                    </td>
                    <td className="text-[10px] opacity-60">
                      {b.status === "sent"
                        ? `Sent ${new Date(b.sent_at).toLocaleString()}`
                        : `Draft ${new Date(b.created_at).toLocaleString()}`}
                    </td>
                    <td className="text-right">
                      <button className="btn btn-ghost btn-xs text-primary" onClick={() => handleEdit(b)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {broadcasts.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-base-content/40 italic">
                      No broadcasts found. Start by creating one above.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <span className="loading loading-spinner text-primary"></span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
