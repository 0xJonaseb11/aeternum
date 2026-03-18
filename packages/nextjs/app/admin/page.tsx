"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import {
  ArrowPathIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  EyeIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

type AdminStats = {
  totalProofs: number;
  totalOrgs: number;
  activeSubscriptions: number;
  planDistribution: Record<string, number>;
};

export default function AdminDashboard() {
  const { session, user } = useSupabaseAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { address } = useAccount();

  const fetchStats = useCallback(async () => {
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
    if (user) void fetchStats();
  }, [user, fetchStats]);

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
        <button onClick={fetchStats} className="btn btn-ghost btn-sm">
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          icon={<DocumentCheckIcon className="h-6 w-6" />}
          label="Total Proofs"
          value={stats?.totalProofs || 0}
          loading={loading}
          color="primary"
        />
        <StatCard
          icon={<UsersIcon className="h-6 w-6" />}
          label="Organizations"
          value={stats?.totalOrgs || 0}
          loading={loading}
          color="secondary"
        />
        <StatCard
          icon={<BanknotesIcon className="h-6 w-6" />}
          label="Active Subs"
          value={stats?.activeSubscriptions || 0}
          loading={loading}
          color="accent"
        />
        <StatCard
          icon={<ChartBarIcon className="h-6 w-6" />}
          label="Health Status"
          value="Healthy"
          loading={loading}
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card bg-base-100 border border-base-300 shadow-sm">
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
                      className={`progress w-full ${plan === "pro" ? "progress-primary" : plan === "business" ? "progress-secondary" : "progress-accent"}`}
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
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <Link href="/api/health" target="_blank" className="btn btn-sm btn-outline justify-start gap-2">
                <ShieldCheckIcon className="h-4 w-4" />
                System Health Check
              </Link>
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
