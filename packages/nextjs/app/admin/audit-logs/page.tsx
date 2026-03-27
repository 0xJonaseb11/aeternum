"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ArrowLeftIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

export default function AdminAuditLogs() {
  const { session, user } = useSupabaseAuth();
  const { address } = useAccount();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit-logs?page=${page}&limit=50`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "x-wallet-address": address || "",
        },
      });
      if (!res.ok) throw new Error("Failed to load audit logs");
      const data = await res.json();
      setLogs(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, address, page]);

  useEffect(() => {
    if (user) void fetchLogs();
  }, [user, fetchLogs]);

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
          <div className="mb-12 flex flex-col md:flex-row md:items-center gap-6">
            <Link
              href="/admin"
              className="btn btn-ghost hover:bg-base-200 border border-base-300 text-base-content/60 hover:text-primary rounded-xl h-12 w-12 p-0 transition-all duration-300"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2 px-1">
                <div className="p-1.5 rounded-lg bg-primary/5">
                  <EyeIcon className="h-5 w-5 text-primary/70" />
                </div>
                <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary/70">System Audit</h2>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-base-content uppercase">Global Audit Logs</h1>
              <p className="text-sm text-base-content/50 mt-1 font-medium">
                Browse all system-wide events and activities.
              </p>
            </div>
          </div>

          <div className="card bg-base-100/50 backdrop-blur-md border border-base-300/50 shadow-xl shadow-primary/5 rounded-3xl overflow-hidden font-mono">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="border-base-300/50 bg-base-200/30">
                      <th className="py-4 px-6 text-[10px] uppercase font-black tracking-widest text-base-content/30">
                        Event
                      </th>
                      <th className="py-4 px-6 text-[10px] uppercase font-black tracking-widest text-base-content/30">
                        Timestamp
                      </th>
                      <th className="py-4 px-6 text-[10px] uppercase font-black tracking-widest text-base-content/30">
                        User ID
                      </th>
                      <th className="py-4 px-6 text-[10px] uppercase font-black tracking-widest text-base-content/30">
                        Org ID
                      </th>
                      <th className="py-4 px-6 text-[10px] uppercase font-black tracking-widest text-base-content/30">
                        File Hash
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id} className="border-base-300/20 group hover:bg-base-200/40 transition-colors">
                        <td className="py-4 px-6">
                          <span className="badge badge-primary badge-outline border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-wider px-2">
                            {log.event_type}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-[10px] font-bold text-base-content/60">
                          {new Date(log.at).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-[10px] opacity-40 group-hover:opacity-100 transition-opacity">
                          {log.user_id || "System"}
                        </td>
                        <td className="py-4 px-6 text-[10px] opacity-40 group-hover:opacity-100 transition-opacity">
                          {log.organization_id || "-"}
                        </td>
                        <td className="py-4 px-6 text-[10px] opacity-40 group-hover:opacity-100 transition-opacity truncate max-w-[120px]">
                          {log.file_hash}
                        </td>
                      </tr>
                    ))}
                    {logs.length === 0 && !loading && (
                      <tr>
                        <td colSpan={5} className="text-center py-24 text-base-content/30 italic text-sm">
                          No logs found.
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

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-8">
            <div className="text-[10px] uppercase font-black tracking-widest text-base-content/30">
              Showing <span className="text-primary">{logs.length}</span> of{" "}
              <span className="text-primary">{total}</span> events
            </div>
            <div className="join rounded-2xl border border-base-300/50 bg-base-100/50 backdrop-blur-md overflow-hidden shadow-sm">
              <button
                className="join-item btn btn-ghost btn-sm px-4 text-primary hover:bg-primary/10 disabled:opacity-30"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                «
              </button>
              <button className="join-item btn btn-ghost btn-sm px-6 font-black text-[10px] pointer-events-none uppercase tracking-widest text-base-content/60 border-x border-base-300/50">
                Page {page}
              </button>
              <button
                className="join-item btn btn-ghost btn-sm px-4 text-primary hover:bg-primary/10 disabled:opacity-30"
                disabled={logs.length < 50}
                onClick={() => setPage(p => p + 1)}
              >
                »
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
