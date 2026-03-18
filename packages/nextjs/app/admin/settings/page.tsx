"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, Cog6ToothIcon, GlobeAltIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

export default function AdminSettings() {
  const { user } = useSupabaseAuth();
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // In a real app, this might fetch from /api/admin/config
    // For now, we simulate with some data
    setConfig({
      adminWallets: (process.env.NEXT_PUBLIC_ADMIN_WALLETS || "").split(",").filter(Boolean),
      adminEmails: ["sebejaz99@gmail.com"],
      primaryStorage: "Arweave (Irys)",
      isMaintenanceMode: false,
    });
  }, []);

  if (!user) return <div className="p-8 text-center mt-20">Sign in to access admin tools.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin" className="btn btn-ghost btn-circle">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Cog6ToothIcon className="h-8 w-8 text-primary" />
            System Settings
          </h1>
          <p className="text-sm text-base-content/60 mt-1">Global configuration and security parameters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-primary" />
              Access Control
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase opacity-40">Admin Wallets</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {config?.adminWallets?.map((w: string) => (
                    <span key={w} className="badge badge-outline family-mono text-[10px] py-3">
                      {w}
                    </span>
                  ))}
                  {(!config?.adminWallets || config.adminWallets.length === 0) && (
                    <span className="text-sm text-base-content/40 italic">No admin wallets configured in env.</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-40">Admin Emails</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {config?.adminEmails?.map((e: string) => (
                    <span key={e} className="badge badge-outline text-[10px] py-3">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <GlobeAltIcon className="h-5 w-5 text-secondary" />
              Service Configuration
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <div>
                  <label className="text-xs font-bold uppercase opacity-40 block">Primary Storage</label>
                  <span className="font-bold">{config?.primaryStorage}</span>
                </div>
                <button className="btn btn-xs btn-outline" disabled>
                  Change (PRO)
                </button>
              </div>
              <div className="divider opacity-5 my-1"></div>
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-xs font-bold uppercase opacity-40 block">Maintenance Mode</label>
                  <span className="text-sm font-medium">Inactive</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-sm toggle-primary"
                  disabled
                  checked={config?.isMaintenanceMode}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 p-8 bg-base-200/50 rounded-3xl border border-dashed border-base-300 text-center">
        <h3 className="font-bold mb-1">Advanced Platform Governance</h3>
        <p className="text-sm text-base-content/60 mb-6">
          Access smart contract pausing, circuit version management, and global rate limit overrides.
        </p>
        <button className="btn btn-primary btn-sm px-6" disabled>
          Upgrade Ownership Tier
        </button>
      </div>
    </div>
  );
}
