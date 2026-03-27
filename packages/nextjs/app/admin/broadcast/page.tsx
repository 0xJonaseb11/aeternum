"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import EyeIcon from "@heroicons/react/20/solid/EyeIcon";
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
    <div className="flex flex-col grow w-full min-w-0 bg-base-100 selection:bg-primary/10 selection:text-primary">
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-16 lg:pb-32 w-full min-h-screen">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(var(--color-primary-rgb),0.1),transparent_70%)]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Link
                href="/admin"
                className="btn btn-ghost hover:bg-base-200 border border-base-300 text-base-content/60 hover:text-primary rounded-xl h-12 w-12 p-0 transition-all duration-300"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3 mb-2 px-1">
                  <div className="p-1.5 rounded-lg bg-secondary/5">
                    <MegaphoneIcon className="h-5 w-5 text-secondary/70" />
                  </div>
                  <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-secondary/70 whitespace-nowrap">
                    Communication Hub
                  </h2>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-base-content uppercase">Broadcast Engine</h1>
                <p className="text-sm text-base-content/50 mt-1 font-medium">
                  Create system-wide alerts for maintenance, updates, or news.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="card bg-base-100/50 backdrop-blur-md border border-base-300/50 shadow-xl shadow-primary/5 rounded-3xl overflow-hidden">
                <div className="card-body p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-1.5 rounded-lg bg-primary/5">
                      {editingId ? (
                        <DocumentTextIcon className="h-4 w-4 text-primary" />
                      ) : (
                        <PlusIcon className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-base-content/60">
                      {editingId ? "Edit Broadcast" : "New Broadcast"}
                    </h2>
                  </div>
                  <div className="space-y-6">
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="text-[10px] uppercase font-black tracking-widest text-base-content/40">
                          Broadcast Title
                        </span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Scheduled Maintenance"
                        className="input input-bordered w-full font-bold rounded-xl bg-base-100/50 border-base-300/50 focus:border-primary/30 transition-all shadow-inner"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label py-1">
                        <span className="text-[10px] uppercase font-black tracking-widest text-base-content/40">
                          Message Content
                        </span>
                      </label>
                      <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="textarea textarea-bordered h-32 w-full leading-relaxed rounded-xl bg-base-100/50 border-base-300/50 focus:border-primary/30 transition-all shadow-inner"
                        placeholder="Describe the update cleanly for all users..."
                      ></textarea>
                    </div>

                    <div className="form-control">
                      <label className="label py-1">
                        <span className="text-[10px] uppercase font-black tracking-widest text-base-content/40">
                          Alert Severity
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {(["info", "warning", "error", "success"] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`btn btn-sm capitalize flex-1 h-10 rounded-xl font-black tracking-widest text-[10px] transition-all border ${
                              type === t
                                ? t === "info"
                                  ? "btn-primary shadow-lg shadow-primary/20 border-primary"
                                  : t === "warning"
                                    ? "btn-warning shadow-lg shadow-warning/20 border-warning"
                                    : t === "error"
                                      ? "btn-error shadow-lg shadow-error/20 border-error"
                                      : "btn-success shadow-lg shadow-success/20 border-success"
                                : "btn-ghost bg-base-100/30 border-base-300/50 text-base-content/40"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-8 border-t border-base-300/50">
                      <button
                        className="btn btn-primary px-10 gap-3 rounded-xl shadow-xl shadow-primary/20 h-12 uppercase font-black tracking-widest text-[10px]"
                        onClick={() => handleSave("sent")}
                        disabled={saving}
                      >
                        {saving ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <PaperAirplaneIcon className="h-4 w-4" />
                        )}
                        Send Live
                      </button>
                      <button
                        className="btn btn-ghost hover:bg-base-200 border border-base-300 px-8 gap-3 rounded-xl h-12 uppercase font-black tracking-widest text-[10px] text-base-content/60"
                        onClick={() => handleSave("draft")}
                        disabled={saving}
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                        Save Draft
                      </button>
                      {editingId && (
                        <button
                          className="btn btn-ghost text-error/60 hover:text-error hover:bg-error/5 ml-auto rounded-xl uppercase font-black tracking-widest text-[10px]"
                          onClick={() => {
                            setEditingId(null);
                            setTitle("");
                            setContent("");
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="card bg-base-100/50 backdrop-blur-md border border-base-300/50 shadow-xl shadow-primary/5 rounded-3xl overflow-hidden sticky top-8 h-fit">
                <div className="card-body p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-1.5 rounded-lg bg-base-200">
                      <EyeIcon className="h-4 w-4 text-base-content/40" />
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-base-content/40">Live Preview</h2>
                  </div>
                  <div
                    className={`p-6 rounded-2xl border transition-all duration-500 ${
                      type === "info"
                        ? "bg-primary/5 border-primary/20 shadow-lg shadow-primary/5"
                        : type === "warning"
                          ? "bg-warning/5 border-warning/20 shadow-lg shadow-warning/5"
                          : type === "error"
                            ? "bg-error/5 border-error/20 shadow-lg shadow-error/5"
                            : "bg-success/5 border-success/20 shadow-lg shadow-success/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <MegaphoneIcon
                        className={`h-4 w-4 ${
                          type === "info"
                            ? "text-primary"
                            : type === "warning"
                              ? "text-warning"
                              : type === "error"
                                ? "text-error"
                                : "text-success"
                        }`}
                      />
                      <span
                        className={`text-[9px] font-black uppercase tracking-[0.25em] ${
                          type === "info"
                            ? "text-primary"
                            : type === "warning"
                              ? "text-warning"
                              : type === "error"
                                ? "text-error"
                                : "text-success"
                        }`}
                      >
                        System {type}
                      </span>
                    </div>
                    <h4 className="font-black text-sm tracking-tight leading-tight mb-2 text-base-content">
                      {title || "Your Title Here"}
                    </h4>
                    <p className="text-xs leading-relaxed text-base-content/70 whitespace-pre-wrap font-medium">
                      {content || "Your broadcast message will appear here for all users..."}
                    </p>
                  </div>
                  <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <CheckCircleIcon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <p className="text-[10px] font-bold text-primary/60 leading-relaxed uppercase tracking-widest">
                        Sent broadcasts will be visible to all logged-in users on their main dashboard and vault view.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100/50 backdrop-blur-md border border-base-300/50 shadow-xl shadow-primary/5 rounded-3xl overflow-hidden">
            <div className="card-body p-0">
              <div className="px-8 pt-10 pb-6 border-b border-base-300/50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Broadcast History</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/40 mt-1">
                    Manage and edit previous system communications
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto font-mono">
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="border-base-300/50 bg-base-200/30">
                      <th className="py-4 px-8 text-[10px] uppercase font-black tracking-widest text-base-content/30">
                        Status
                      </th>
                      <th className="py-4 px-8 text-[10px] uppercase font-black tracking-widest text-base-content/30">
                        Title
                      </th>
                      <th className="py-4 px-8 text-[10px] uppercase font-black tracking-widest text-base-content/30">
                        Type
                      </th>
                      <th className="py-4 px-8 text-[10px] uppercase font-black tracking-widest text-base-content/30">
                        Timeline
                      </th>
                      <th className="py-4 px-8 text-right text-[10px] uppercase font-black tracking-widest text-base-content/30">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {broadcasts.map(b => (
                      <tr key={b.id} className="border-base-300/20 group hover:bg-base-200/40 transition-colors">
                        <td className="py-4 px-8">
                          {b.status === "sent" ? (
                            <span className="badge badge-success border-success/20 bg-success/5 text-success text-[10px] font-black uppercase tracking-widest px-2">
                              SENT
                            </span>
                          ) : b.status === "draft" ? (
                            <span className="badge badge-ghost border-base-300/50 bg-base-200/50 text-base-content/40 text-[10px] font-black uppercase tracking-widest px-2">
                              DRAFT
                            </span>
                          ) : (
                            <span className="badge border-base-300/50 bg-base-200/50 text-base-content/40 text-[10px] font-black uppercase tracking-widest px-2">
                              {b.status}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-8 text-sm font-bold text-base-content group-hover:text-primary transition-colors">
                          {b.title}
                        </td>
                        <td className="py-4 px-8">
                          <span className="badge badge-outline border-base-300 text-[10px] font-black uppercase tracking-widest text-base-content/40">
                            {b.type}
                          </span>
                        </td>
                        <td className="py-4 px-8 text-[10px] opacity-40 group-hover:opacity-80 transition-opacity">
                          {b.status === "sent"
                            ? `Sent ${new Date(b.sent_at).toLocaleString()}`
                            : `Draft ${new Date(b.created_at).toLocaleString()}`}
                        </td>
                        <td className="py-4 px-8 text-right">
                          <button
                            className="btn btn-ghost btn-xs text-primary/40 hover:text-primary hover:bg-primary/5 rounded-lg transition-all font-black uppercase tracking-widest text-[9px]"
                            onClick={() => handleEdit(b)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                    {broadcasts.length === 0 && !loading && (
                      <tr>
                        <td colSpan={5} className="text-center py-24 text-base-content/30 italic text-sm">
                          No broadcasts found. Start by creating one above.
                        </td>
                      </tr>
                    )}
                    {loading && (
                      <tr>
                        <td colSpan={5} className="text-center py-24">
                          <span className="loading loading-spinner loading-lg text-primary opacity-20"></span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
