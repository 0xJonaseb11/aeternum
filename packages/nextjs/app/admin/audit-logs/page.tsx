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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin" className="btn btn-ghost btn-circle">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <EyeIcon className="h-8 w-8 text-primary" />
            Global Audit Logs
          </h1>
          <p className="text-sm text-base-content/60 mt-1">Browse all system-wide events and activities.</p>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Event Type</th>
                  <th>Timestamp</th>
                  <th>User ID</th>
                  <th>Org ID</th>
                  <th>File Hash</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="hover">
                    <td className="font-bold text-xs">
                      <span className="badge badge-outline badge-sm uppercase">{log.event_type}</span>
                    </td>
                    <td className="text-xs">{new Date(log.at).toLocaleString()}</td>
                    <td className="text-[10px] opacity-60 font-mono">{log.user_id || "System"}</td>
                    <td className="text-[10px] opacity-60 font-mono">{log.organization_id || "-"}</td>
                    <td className="text-[10px] opacity-60 font-mono truncate max-w-[100px]">{log.file_hash}</td>
                  </tr>
                ))}
                {logs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-base-content/40 italic">
                      No logs found.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <span className="loading loading-spinner loading-lg text-primary"></span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-base-content/60">
          Showing {logs.length} of {total} events
        </div>
        <div className="join">
          <button className="join-item btn btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            «
          </button>
          <button className="join-item btn btn-sm">Page {page}</button>
          <button className="join-item btn btn-sm" disabled={logs.length < 50} onClick={() => setPage(p => p + 1)}>
            »
          </button>
        </div>
      </div>
    </div>
  );
}
