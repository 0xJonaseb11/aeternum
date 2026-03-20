"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { ArrowLeftIcon, NoSymbolIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

export default function AdminBlocked() {
  const { session, user } = useSupabaseAuth();
  const { address: adminAddress } = useAccount();
  const [blocked, setBlocked] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [targetAddress, setTargetAddress] = useState("");
  const [reason, setReason] = useState("");

  const fetchBlocked = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blocked", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "x-wallet-address": adminAddress || "",
        },
      });
      if (!res.ok) throw new Error("Failed to load blocked addresses");
      const data = await res.json();
      setBlocked(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, adminAddress]);

  useEffect(() => {
    if (user) void fetchBlocked();
  }, [user, fetchBlocked]);

  const handleBlock = async () => {
    if (!targetAddress) {
      toast.error("Address is required");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/admin/blocked", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          "x-wallet-address": adminAddress || "",
        },
        body: JSON.stringify({
          address: targetAddress,
          reason,
        }),
      });

      if (!res.ok) throw new Error("Failed to block address");

      toast.success("Address blocked successfully");
      setTargetAddress("");
      setReason("");
      void fetchBlocked();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error blocking address");
    } finally {
      setAdding(false);
    }
  };

  const handleUnblock = async (addr: string) => {
    if (!confirm(`Are you sure you want to unblock ${addr}?`)) return;

    try {
      const res = await fetch(`/api/admin/blocked?address=${addr}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "x-wallet-address": adminAddress || "",
        },
      });

      if (!res.ok) throw new Error("Failed to unblock address");

      toast.success("Address unblocked");
      void fetchBlocked();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error unblocking");
    }
  };

  if (!user) return <div className="p-8 text-center mt-20">Sign in to access admin tools.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="btn btn-ghost btn-circle">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <NoSymbolIcon className="h-8 w-8 text-error" />
              Blocked Addresses
            </h1>
            <p className="text-sm text-base-content/60 mt-1">
              Prevent specific wallets or entities from accessing Aeternum.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1 card bg-base-100 border border-base-300 shadow-sm h-fit">
          <div className="card-body">
            <h2 className="text-lg font-bold mb-4">Block New Address</h2>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-xs uppercase opacity-60">Wallet Address</span>
                </label>
                <input
                  type="text"
                  value={targetAddress}
                  onChange={e => setTargetAddress(e.target.value)}
                  placeholder="0x..."
                  className="input input-bordered w-full font-mono text-sm"
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-xs uppercase opacity-60">Reason (Optional)</span>
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="textarea textarea-bordered h-24 w-full text-sm"
                  placeholder="e.g. Terms of Service violation"
                ></textarea>
              </div>
              <button
                className="btn btn-error btn-block gap-2"
                onClick={handleBlock}
                disabled={adding || !targetAddress}
              >
                {adding ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <PlusIcon className="h-4 w-4" />
                )}
                Add to Blocklist
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200/50">
                  <tr>
                    <th>Address</th>
                    <th>Reason</th>
                    <th>Blocked At</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blocked.map(item => (
                    <tr key={item.address} className="hover:bg-base-200/30 transition-colors">
                      <td className="font-mono text-[10px] py-4">{item.address}</td>
                      <td className="text-xs opacity-70">{item.reason || "-"}</td>
                      <td className="text-[10px] opacity-60">{new Date(item.created_at).toLocaleString()}</td>
                      <td className="text-right">
                        <button className="btn btn-ghost btn-xs text-error" onClick={() => handleUnblock(item.address)}>
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {blocked.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-base-content/40 italic">
                        No addresses are currently blocked.
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={4} className="text-center py-12">
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
    </div>
  );
}
