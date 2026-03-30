"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { ArrowLeftIcon, NoSymbolIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";
import { BlockedItem } from "~~/types/admin";

export default function AdminBlocked() {
  const { session, user } = useSupabaseAuth();
  const { address: adminAddress } = useAccount();
  const [blocked, setBlocked] = useState<BlockedItem[]>([]);
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
          Authorization: `Bearer ${session?.access_token}`,
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
                  <div className="p-1.5 rounded-lg bg-error/5">
                    <NoSymbolIcon className="h-5 w-5 text-error/70" />
                  </div>
                  <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-error/70 whitespace-nowrap">
                    Access Control
                  </h2>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-base-content uppercase">Blocked Addresses</h1>
                <p className="text-sm text-base-content/50 mt-1 font-medium">
                  Prevent specific wallets or entities from accessing Aeternum.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="card bg-base-100/50 backdrop-blur-md border border-base-300/50 shadow-xl shadow-primary/5 rounded-3xl overflow-hidden h-fit">
                <div className="card-body p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-1.5 rounded-lg bg-primary/5">
                      <PlusIcon className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-base-content/60">
                      Block New Address
                    </h2>
                  </div>
                  <div className="space-y-6">
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="text-[10px] uppercase font-black tracking-widest text-base-content/40">
                          Wallet Address
                        </span>
                      </label>
                      <input
                        type="text"
                        value={targetAddress}
                        onChange={e => setTargetAddress(e.target.value)}
                        placeholder="0x..."
                        className="input input-bordered w-full font-mono text-sm rounded-xl bg-base-100/50 border-base-300/50 focus:border-primary/30 transition-all"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="text-[10px] uppercase font-black tracking-widest text-base-content/40">
                          Reason (Optional)
                        </span>
                      </label>
                      <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        className="textarea textarea-bordered h-24 w-full text-sm rounded-xl bg-base-100/50 border-base-300/50 focus:border-primary/30 transition-all"
                        placeholder="e.g. Terms of Service violation"
                      ></textarea>
                    </div>
                    <button
                      className="btn btn-error btn-block gap-3 rounded-xl shadow-lg shadow-error/10 uppercase font-black tracking-widest text-[10px] h-12"
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
            </div>

            <div className="lg:col-span-2">
              <div className="card bg-base-100/50 backdrop-blur-md border border-base-300/50 shadow-xl shadow-primary/5 rounded-3xl overflow-hidden font-mono min-h-[400px]">
                <div className="card-body p-0">
                  <div className="overflow-x-auto">
                    <table className="table table-sm w-full">
                      <thead>
                        <tr className="border-base-300/50 bg-base-200/30">
                          <th className="py-4 px-6 text-[10px] uppercase font-black tracking-widest text-base-content/30">
                            Address
                          </th>
                          <th className="py-4 px-6 text-[10px] uppercase font-black tracking-widest text-base-content/30">
                            Reason
                          </th>
                          <th className="py-4 px-6 text-[10px] uppercase font-black tracking-widest text-base-content/30">
                            Blocked At
                          </th>
                          <th className="py-4 px-6 text-right text-[10px] uppercase font-black tracking-widest text-base-content/30">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {blocked.map(item => (
                          <tr
                            key={item.address}
                            className="border-base-300/20 group hover:bg-base-200/40 transition-colors"
                          >
                            <td className="py-4 px-6 text-[10px] font-bold text-base-content/60">{item.address}</td>
                            <td className="py-4 px-6 text-[10px] opacity-40 group-hover:opacity-80 transition-opacity">
                              {item.reason || "-"}
                            </td>
                            <td className="py-4 px-6 text-[10px] opacity-40 group-hover:opacity-80 transition-opacity">
                              {new Date(item.created_at).toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                className="btn btn-ghost btn-xs text-error/20 hover:text-error hover:bg-error/5 rounded-lg transition-all"
                                onClick={() => handleUnblock(item.address)}
                              >
                                <TrashIcon className="h-4 w-4 text-error" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {blocked.length === 0 && !loading && (
                          <tr>
                            <td colSpan={4} className="text-center py-24 text-base-content/30 italic text-sm">
                              No addresses are currently blocked.
                            </td>
                          </tr>
                        )}
                        {loading && (
                          <tr>
                            <td colSpan={4} className="text-center py-24">
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
          </div>
        </div>
      </section>
    </div>
  );
}
