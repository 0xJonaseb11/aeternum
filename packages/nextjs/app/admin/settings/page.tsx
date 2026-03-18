"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { ArrowLeftIcon, Cog6ToothIcon, GlobeAltIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

export default function AdminSettings() {
  const { session, user } = useSupabaseAuth();
  const { address: adminAddress } = useAccount();
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "x-wallet-address": adminAddress || "",
        },
      });
      if (!res.ok) throw new Error("Failed to load settings");
      const data = await res.json();
      setSettings(data.settings || {});
    } catch (_err) {
      console.error(_err);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, adminAddress]);

  useEffect(() => {
    if (user) void fetchSettings();
  }, [user, fetchSettings]);

  const updateSetting = async (key: string, value: any) => {
    setSaving(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          "x-wallet-address": adminAddress || "",
        },
        body: JSON.stringify({ key, value }),
      });

      if (!res.ok) throw new Error("Failed to update setting");

      setSettings(prev => ({ ...prev, [key]: value }));
      toast.success(`${key.replace(/_/g, " ")} updated`);
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(null);
    }
  };

  const adminWallets = (process.env.NEXT_PUBLIC_ADMIN_WALLETS || "").split(",").filter(Boolean);

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
          <p className="text-sm text-base-content/60 mt-1">Global configuration and platform-wide parameters.</p>
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
                <label className="text-xs font-bold uppercase opacity-40">Authorized Wallets (ENV)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {adminWallets.map(w => (
                    <span key={w} className="badge badge-outline family-mono text-[10px] py-3">
                      {w}
                    </span>
                  ))}
                  {adminWallets.length === 0 && (
                    <span className="text-sm text-base-content/40 italic">No admin wallets configured in env.</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-40">Authorized Emails (ENV)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="badge badge-outline text-[10px] py-3">sebejaz99@gmail.com</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-base-content/40 mt-6 leading-relaxed">
              * Admin access is currently managed via environment variables for maximum security. Database-managed roles
              coming in V3.
            </p>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <GlobeAltIcon className="h-5 w-5 text-secondary" />
              Dynamic Configuration
            </h2>
            {loading ? (
              <div className="py-8 text-center">
                <span className="loading loading-spinner text-primary"></span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-xs font-bold uppercase opacity-40 block">Maintenance Mode</label>
                    <span
                      className={`text-sm font-bold ${settings.maintenance_mode === true ? "text-error" : "text-success"}`}
                    >
                      {settings.maintenance_mode === true ? "Active" : "Inactive"}
                    </span>
                    <p className="text-[10px] opacity-60">Prevents non-admins from using the vault.</p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={settings.maintenance_mode === true}
                    onChange={e => updateSetting("maintenance_mode", e.target.checked)}
                    disabled={saving === "maintenance_mode"}
                  />
                </div>
                <div className="divider opacity-5 my-0"></div>
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-xs font-bold uppercase opacity-40 block">Primary Storage</label>
                    <span className="text-sm font-bold uppercase">{settings.primary_storage || "Arweave"}</span>
                    <p className="text-[10px] opacity-60">Global default for new evidence uploads.</p>
                  </div>
                  <select
                    className="select select-bordered select-sm font-bold"
                    value={settings.primary_storage || "arweave"}
                    onChange={e => updateSetting("primary_storage", e.target.value)}
                    disabled={saving === "primary_storage"}
                  >
                    <option value="arweave">Arweave</option>
                    <option value="ipfs">IPFS</option>
                  </select>
                </div>
                <div className="divider opacity-5 my-0"></div>
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-xs font-bold uppercase opacity-40 block">Max File Size (MB)</label>
                    <span className="text-sm font-bold">{settings.max_file_size_mb || 50} MB</span>
                  </div>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-20 font-bold"
                    value={settings.max_file_size_mb || 50}
                    onChange={e => updateSetting("max_file_size_mb", parseInt(e.target.value))}
                    disabled={saving === "max_file_size_mb"}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 p-8 bg-base-200/50 rounded-3xl border border-dashed border-base-300 text-center">
        <h3 className="font-bold mb-1">Advanced Platform Governance</h3>
        <p className="text-sm text-base-content/60 mb-6 max-w-xl mx-auto">
          Access smart contract pausing, circuit version management, and global rate limit overrides. These actions
          require multisig approval.
        </p>
        <button className="btn btn-primary btn-sm px-8" disabled>
          Upgrade Governance Tier
        </button>
      </div>
    </div>
  );
}
