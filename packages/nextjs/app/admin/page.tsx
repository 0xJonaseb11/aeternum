"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import {
  ArrowPathIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CommandLineIcon,
  EyeIcon,
  GlobeAltIcon,
  MegaphoneIcon,
  NoSymbolIcon,
  ServerIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";
import { AdminStats, SystemHealth } from "~~/types/admin";



export default function AdminDashboard() {
  const { session, user } = useSupabaseAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { address } = useAccount();

  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);

  const fetchData = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "x-wallet-address": address || "",
        },
      });
      if (!res.ok) {
        if (res.status === 403) throw new Error("Access Denied: Platform Admin only.");
        throw new Error("Failed to load platform stats");
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, address]);

  useEffect(() => {
    if (user) void fetchData();
  }, [user, fetchData]);

  const handleHealthCheck = async () => {
    setCheckingHealth(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealthData(data);
      setShowHealthModal(true);
      if (data.status === "healthy") {
        toast.success("System is healthy");
      } else {
        toast.error("System health degraded");
      }
    } catch {
      console.error("Health check failed");
    } finally {
      setCheckingHealth(false);
    }
  };

  if (!user) return <div className="p-8 text-center mt-20">Sign in to access admin tools.</div>;
  if (error)
    return (
      <div className="p-8 text-center mt-20 text-error">
        <ShieldCheckIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <h1 className="text-xl font-bold">{error}</h1>
        <p className="text-sm mt-2">If you believe this is an error, contact system operations.</p>
      </div>
    );

  return (
    <div className="flex flex-col grow w-full min-w-0 bg-base-100 selection:bg-primary/10 selection:text-primary">
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-16 lg:pb-32 w-full">
        {/* Premium Background Effects — Exactly as on Verification & Landing Pages */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 right-1/3 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(var(--color-primary-rgb),0.12),transparent_70%)]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2 px-1">
                <div className="p-1.5 rounded-lg bg-primary/5">
                  <ShieldCheckIcon className="h-5 w-5 text-primary/70" />
                </div>
                <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary/70 whitespace-nowrap">
                  Platform Operations
                </h2>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-base-content uppercase">
                Owner Dashboard
              </h1>
              <p className="text-sm text-base-content/50 mt-2 font-medium">
                System-wide activity, usage metrics, and resource allocation.
              </p>
            </div>
            <button
              onClick={fetchData}
              className="btn btn-primary btn-sm rounded-xl px-6 gap-2 shadow-lg shadow-primary/20 group uppercase font-black tracking-widest text-[10px]"
            >
              <ArrowPathIcon
                className={`h-3.5 w-3.5 group-hover:rotate-180 transition-transform ${loading ? "animate-spin" : ""}`}
              />
              Refresh Data
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              icon={<BanknotesIcon className="h-5 w-5" />}
              label="Estimated MRR"
              value={`$${stats?.mrr || 0}`}
              loading={loading}
              color="primary"
            />
            <StatCard
              icon={<UsersIcon className="h-5 w-5" />}
              label="Total Users"
              value={stats?.totalUsers || 0}
              loading={loading}
              color="secondary"
            />
            <StatCard
              icon={<ArrowPathIcon className="h-5 w-5" />}
              label="Arweave Balance"
              value={`${stats?.irysBalance || "0"} ETH`}
              loading={loading}
              color="accent"
            />
            <StatCard
              icon={<ChartBarIcon className="h-5 w-5" />}
              label="Active Subs"
              value={stats?.activeSubscriptions || 0}
              loading={loading}
              color="success"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="card bg-base-100/50 backdrop-blur-md border border-base-300/50 shadow-xl shadow-primary/5 rounded-3xl overflow-hidden">
                <div className="card-body p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-1.5 rounded-lg bg-primary/5">
                      <ChartBarIcon className="h-4 w-4 text-primary/70" />
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-base-content/60">
                      Plan Distribution
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {stats?.planDistribution &&
                      Object.entries(stats.planDistribution).map(([plan, count]) => (
                        <div key={plan} className="group">
                          <div className="flex justify-between items-center text-sm mb-3">
                            <span className="capitalize font-black text-xs tracking-wide text-base-content/70">
                              {plan}
                            </span>
                            <span className="font-bold text-primary">{count} accounts</span>
                          </div>
                          <div className="relative h-2.5 w-full bg-base-300 rounded-full overflow-hidden">
                            <div
                              className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.3)] ${
                                plan === "pro"
                                  ? "bg-primary"
                                  : plan === "business"
                                    ? "bg-secondary"
                                    : plan === "enterprise"
                                      ? "bg-accent"
                                      : "bg-success"
                              }`}
                              style={{
                                width: `${(count / Math.max(...Object.values(stats.planDistribution), 1)) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    {!stats?.planDistribution && (
                      <p className="text-base-content/40 italic py-4">No subscription data available.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="card bg-base-100/50 backdrop-blur-md border border-base-300/50 shadow-xl shadow-primary/5 rounded-3xl overflow-hidden font-mono">
                <div className="card-body p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-1.5 rounded-lg bg-primary/5">
                      <EyeIcon className="h-4 w-4 text-primary/70" />
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-base-content/60">
                      System Activity Logs
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="table table-sm w-full">
                      <thead>
                        <tr className="border-base-300/50">
                          <th className="text-[10px] uppercase font-black tracking-widest text-base-content/30">
                            Event
                          </th>
                          <th className="text-[10px] uppercase font-black tracking-widest text-base-content/30">
                            Timestamp
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.recentActivity?.map(event => (
                          <tr
                            key={event.id}
                            className="border-base-300/20 group hover:bg-base-200/40 transition-colors"
                          >
                            <td className="font-bold text-xs py-3 text-base-content/70">{event.event_type}</td>
                            <td className="text-[10px] opacity-40">{new Date(event.at).toLocaleString()}</td>
                          </tr>
                        ))}
                        {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                          <tr>
                            <td colSpan={2} className="text-center py-8 text-base-content/30 italic text-xs">
                              No recent activity recorded.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card bg-base-100/50 backdrop-blur-md border border-base-300/50 shadow-xl shadow-primary/5 rounded-3xl overflow-hidden">
                <div className="card-body p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-1.5 rounded-lg bg-primary/5">
                      <ShieldCheckIcon className="h-4 w-4 text-primary/70" />
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-base-content/60">
                      Quick Actions
                    </h2>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleHealthCheck}
                      disabled={checkingHealth}
                      className="btn btn-ghost hover:bg-base-200 border border-base-300/50 justify-start gap-4 h-14 rounded-2xl normal-case group"
                    >
                      <div className="p-2 rounded-lg bg-success/10 text-success group-hover:scale-110 transition-transform">
                        {checkingHealth ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <ShieldCheckIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex flex-col items-start translate-y-[-1px]">
                        <span className="font-black text-xs text-base-content/80 group-hover:text-primary transition-colors">
                          Health Check
                        </span>
                        <span className="text-[10px] text-base-content/40">Run system diagnostics</span>
                      </div>
                    </button>

                    <Link
                      href="/admin/audit-logs"
                      className="btn btn-ghost hover:bg-base-200 border border-base-300/50 justify-start gap-4 h-14 rounded-2xl normal-case group"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        <EyeIcon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col items-start translate-y-[-1px]">
                        <span className="font-black text-xs text-base-content/80 group-hover:text-primary transition-colors">
                          Audit Logs
                        </span>
                        <span className="text-[10px] text-base-content/40">View global transactions</span>
                      </div>
                    </Link>

                    <Link
                      href="/admin/blocked"
                      className="btn btn-ghost hover:bg-base-200 border border-base-300/50 justify-start gap-4 h-14 rounded-2xl normal-case group"
                    >
                      <div className="p-2 rounded-lg bg-error/10 text-error group-hover:scale-110 transition-transform">
                        <NoSymbolIcon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col items-start translate-y-[-1px]">
                        <span className="font-black text-xs text-base-content/80 group-hover:text-primary transition-colors">
                          Blocked List
                        </span>
                        <span className="text-[10px] text-base-content/40">Manage restricted access</span>
                      </div>
                    </Link>

                    <Link
                      href="/admin/broadcast"
                      className="btn btn-ghost hover:bg-base-200 border border-base-300/50 justify-start gap-4 h-14 rounded-2xl normal-case group"
                    >
                      <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:scale-110 transition-transform">
                        <MegaphoneIcon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col items-start translate-y-[-1px]">
                        <span className="font-black text-xs text-base-content/80 group-hover:text-primary transition-colors">
                          Broadcast
                        </span>
                        <span className="text-[10px] text-base-content/40">Notify all vault users</span>
                      </div>
                    </Link>

                    <Link
                      href="/admin/settings"
                      className="btn btn-ghost hover:bg-base-200 border border-base-300/50 justify-start gap-4 h-14 rounded-2xl normal-case group"
                    >
                      <div className="p-2 rounded-lg bg-secondary/10 text-secondary group-hover:scale-110 transition-transform">
                        <Cog6ToothIcon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col items-start translate-y-[-1px]">
                        <span className="font-black text-xs text-base-content/80 group-hover:text-primary transition-colors">
                          Settings
                        </span>
                        <span className="text-[10px] text-base-content/40">Global configuration</span>
                      </div>
                    </Link>

                    <Link
                      href="/status"
                      className="btn btn-ghost hover:bg-base-200 border border-base-300/50 justify-start gap-4 h-14 rounded-2xl normal-case group"
                    >
                      <div className="p-2 rounded-lg bg-success/10 text-success group-hover:scale-110 transition-transform">
                        <ServerIcon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col items-start translate-y-[-1px]">
                        <span className="font-black text-xs text-base-content/80 group-hover:text-primary transition-colors">
                          Status Board
                        </span>
                        <span className="text-[10px] text-base-content/40">Live system health</span>
                      </div>
                    </Link>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <Link
                        href="/debug"
                        className="btn btn-ghost hover:bg-base-200 border border-base-300/50 justify-center gap-2 h-12 rounded-xl normal-case group p-0"
                      >
                        <CommandLineIcon className="h-3.5 w-3.5 text-base-content/40 group-hover:text-primary transition-colors" />
                        <span className="font-black text-[9px] uppercase tracking-widest text-base-content/60 group-hover:text-primary">
                          Debug
                        </span>
                      </Link>
                      <Link
                        href="/blockexplorer"
                        className="btn btn-ghost hover:bg-base-200 border border-base-300/50 justify-center gap-2 h-12 rounded-xl normal-case group p-0"
                      >
                        <GlobeAltIcon className="h-3.5 w-3.5 text-base-content/40 group-hover:text-primary transition-colors" />
                        <span className="font-black text-[9px] uppercase tracking-widest text-base-content/60 group-hover:text-primary">
                          Explorer
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      {showHealthModal && healthData && (
        <div className="modal modal-open">
          <div className="modal-box border border-base-300">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
              <ShieldCheckIcon
                className={`h-6 w-6 ${healthData.status === "healthy" ? "text-success" : "text-error"}`}
              />
              Detailed System Diagnostics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                <span className="text-sm font-medium">Supabase (DB)</span>
                <span className={`badge ${healthData.details.supabase === "ok" ? "badge-success" : "badge-error"}`}>
                  {healthData.details.supabase}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                <span className="text-sm font-medium">Stripe (API)</span>
                <span className={`badge ${healthData.details.stripe === "ok" ? "badge-success" : "badge-error"}`}>
                  {healthData.details.stripe}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                <span className="text-sm font-medium">Arweave (Env)</span>
                <span className={`badge ${healthData.details.arweave === "ok" ? "badge-success" : "badge-error"}`}>
                  {healthData.details.arweave}
                </span>
              </div>
              {healthData.details.userCount !== undefined && (
                <div className="p-3 border border-base-200 rounded-lg mt-4 bg-base-300/20">
                  <div className="text-[10px] uppercase font-bold opacity-40 mb-1">Additional Metrics</div>
                  <div className="flex justify-between text-xs font-mono">
                    <span>Registered Profiles</span>
                    <span>{healthData.details.userCount}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowHealthModal(false)}>
                Close
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={() => setShowHealthModal(false)}></div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  loading,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  loading: boolean;
  color: string;
}) {
  return (
    <div className="card bg-base-100/50 backdrop-blur-md border border-base-300/50 shadow-xl shadow-primary/5 overflow-hidden group hover:translate-y-[-4px] hover:border-primary/30 transition-all duration-300 rounded-3xl">
      <div className="card-body p-8">
        <div
          className={`rounded-xl bg-primary/5 p-3 w-fit mb-6 group-hover:scale-110 transition-transform text-${color} shadow-inner`}
        >
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 leading-none">
          {label}
        </span>
        {loading ? (
          <div className="h-10 w-32 bg-base-300/50 animate-pulse rounded-lg mt-3"></div>
        ) : (
          <div className="text-3xl font-black mt-2 tracking-tight text-base-content break-all">{value}</div>
        )}
      </div>
    </div>
  );
}
