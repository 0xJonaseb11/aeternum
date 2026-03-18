"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import {
  ArrowPathIcon,
  BanknotesIcon,
  ChartBarIcon,
  EyeIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

type AdminStats = {
  totalProofs: number;
  totalOrgs: number;
  totalUsers: number;
  activeSubscriptions: number;
  mrr: number;
  irysBalance: string;
  pendingInvites: number;
  planDistribution: Record<string, number>;
  recentActivity: any[];
};

export default function AdminDashboard() {
  const { session, user } = useSupabaseAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { address } = useAccount();

  const [healthData, setHealthData] = useState<any>(null);
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <ShieldCheckIcon className="h-8 w-8 text-primary" />
            Platform Owner Dashboard
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            System-wide activity, usage metrics, and resource allocation.
          </p>
        </div>
        <button onClick={fetchData} className="btn btn-ghost btn-sm">
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          icon={<BanknotesIcon className="h-6 w-6" />}
          label="Estimated MRR"
          value={`$${stats?.mrr || 0}`}
          loading={loading}
          color="primary"
        />
        <StatCard
          icon={<UsersIcon className="h-6 w-6" />}
          label="Total Users"
          value={stats?.totalUsers || 0}
          loading={loading}
          color="secondary"
        />
        <StatCard
          icon={<ArrowPathIcon className="h-6 w-6" />}
          label="Arweave Balance"
          value={`${stats?.irysBalance || "0"} ETH`}
          loading={loading}
          color="accent"
        />
        <StatCard
          icon={<ChartBarIcon className="h-6 w-6" />}
          label="Active Subs"
          value={stats?.activeSubscriptions || 0}
          loading={loading}
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <h2 className="text-lg font-bold mb-6">Plan Distribution</h2>
              <div className="space-y-6">
                {stats?.planDistribution &&
                  Object.entries(stats.planDistribution).map(([plan, count]) => (
                    <div key={plan}>
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="capitalize font-medium">{plan}</span>
                        <span className="font-bold">{count} accounts</span>
                      </div>
                      <progress
                        className={`progress w-full ${
                          plan === "pro"
                            ? "progress-primary"
                            : plan === "business"
                              ? "progress-secondary"
                              : plan === "enterprise"
                                ? "progress-accent"
                                : "progress-success"
                        }`}
                        value={count}
                        max={Math.max(...Object.values(stats.planDistribution), 1)}
                      />
                    </div>
                  ))}
                {!stats?.planDistribution && (
                  <p className="text-base-content/40 italic">No subscription data available.</p>
                )}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <h2 className="text-lg font-bold mb-4">Recent System Activity</h2>
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentActivity?.map((event: any) => (
                      <tr key={event.id}>
                        <td className="font-medium text-xs">{event.event_type}</td>
                        <td className="text-[10px] opacity-50">{new Date(event.at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                      <tr>
                        <td colSpan={2} className="text-center py-4 text-base-content/40 italic">
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

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleHealthCheck}
                disabled={checkingHealth}
                className="btn btn-sm btn-outline justify-start gap-2"
              >
                {checkingHealth ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <ShieldCheckIcon className="h-4 w-4" />
                )}
                System Health Check
              </button>
              <Link href="/admin/audit-logs" className="btn btn-sm btn-outline justify-start gap-2">
                <EyeIcon className="h-4 w-4" />
                View Global Audit Logs
              </Link>
              <Link href="/admin/blocked" className="btn btn-sm btn-outline justify-start gap-2">
                <NoSymbolIcon className="h-4 w-4" />
                Manage Blocked Addresses
              </Link>
              <Link href="/admin/broadcast" className="btn btn-sm btn-outline justify-start gap-2">
                <ArrowPathIcon className="h-4 w-4" />
                Broadcast System Update
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Health Check Modal */}
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
  icon: any;
  label: string;
  value: any;
  loading: boolean;
  color: string;
}) {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden group hover:border-primary/50 transition-colors">
      <div className="card-body p-6">
        <div
          className={`rounded-xl bg-${color}/10 p-3 w-fit mb-4 group-hover:scale-110 transition-transform text-${color}`}
        >
          {icon}
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-base-content/50">{label}</span>
        {loading ? (
          <div className="h-8 w-24 bg-base-300 animate-pulse rounded mt-1"></div>
        ) : (
          <div className="text-3xl font-black mt-1">{value}</div>
        )}
      </div>
    </div>
  );
}
