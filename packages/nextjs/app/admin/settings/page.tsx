"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { ArrowLeftIcon, Cog6ToothIcon, GlobeAltIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";
import { GlobalSettings } from "~~/types/admin";

export default function AdminSettings() {
  const { session, user } = useSupabaseAuth();
  const { address: adminAddress } = useAccount();
  const [settings, setSettings] = useState<Partial<GlobalSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
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

  const updateSetting = async (key: string, value: string | number | boolean) => {
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
                  <Cog6ToothIcon className="h-5 w-5 text-primary/70" />
                </div>
                <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary/70 whitespace-nowrap">
                  Platform Config
                </h2>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-base-content uppercase">System Settings</h1>
              <p className="text-sm text-base-content/50 mt-1 font-medium">
                Global configuration and platform-wide parameters.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card bg-base-100/50 backdrop-blur-md border border-base-300/50 shadow-xl shadow-primary/5 rounded-3xl overflow-hidden">
              <div className="card-body p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-1.5 rounded-lg bg-primary/5">
                    <ShieldCheckIcon className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-base-content/60">Access Control</h2>
                </div>
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-base-content/40 block mb-3">
                      Authorized Wallets (ENV)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {adminWallets.map(w => (
                        <span
                          key={w}
                          className="badge bg-primary/5 border-primary/10 text-primary font-mono text-[9px] py-3 px-3 rounded-lg"
                        >
                          {w}
                        </span>
                      ))}
                      {adminWallets.length === 0 && (
                        <span className="text-xs text-base-content/30 italic">No admin wallets configured in env.</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-base-content/40 block mb-3">
                      Authorized Emails (ENV)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <span className="badge bg-secondary/5 border-secondary/10 text-secondary font-mono text-[9px] py-3 px-3 rounded-lg">
                        sebejaz99@gmail.com
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-10 p-5 bg-base-200/40 rounded-2xl border border-base-300/30">
                  <p className="text-[10px] font-bold text-base-content/40 leading-relaxed uppercase tracking-wider">
                    * Admin access is currently managed via environment variables for maximum security. Database-managed
                    roles coming in V3.
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-base-100/50 backdrop-blur-md border border-base-300/50 shadow-xl shadow-primary/5 rounded-3xl overflow-hidden">
              <div className="card-body p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-1.5 rounded-lg bg-secondary/5">
                    <GlobeAltIcon className="h-4 w-4 text-secondary" />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-base-content/60">
                    Dynamic Configuration
                  </h2>
                </div>
                {loading ? (
                  <div className="py-24 text-center">
                    <span className="loading loading-spinner loading-lg text-primary opacity-20"></span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center p-4 rounded-2xl hover:bg-base-200/30 transition-colors">
                      <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-base-content/40 block mb-1">
                          Maintenance Mode
                        </label>
                        <span
                          className={`text-xs font-black uppercase tracking-wider ${settings.maintenance_mode === true ? "text-error" : "text-success"}`}
                        >
                          {settings.maintenance_mode === true ? "ACTIVE" : "INACTIVE"}
                        </span>
                        <p className="text-[10px] text-base-content/30 mt-1 font-medium italic">
                          Prevents non-admins from using the vault.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary toggle-sm"
                        checked={settings.maintenance_mode === true}
                        onChange={e => updateSetting("maintenance_mode", e.target.checked)}
                        disabled={saving === "maintenance_mode"}
                      />
                    </div>
                    <div className="divider opacity-5 my-0"></div>
                    <div className="flex justify-between items-center p-4 rounded-2xl hover:bg-base-200/30 transition-colors">
                      <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-base-content/40 block mb-1">
                          Primary Storage
                        </label>
                        <span className="text-xs font-black uppercase tracking-wider text-base-content">
                          {settings.primary_storage || "Arweave"}
                        </span>
                        <p className="text-[10px] text-base-content/30 mt-1 font-medium italic">
                          Global default for new evidence uploads.
                        </p>
                      </div>
                      <select
                        className="select select-bordered select-sm font-black text-[10px] h-8 min-h-0 bg-base-100/50 rounded-lg border-base-300/50"
                        value={settings.primary_storage || "arweave"}
                        onChange={e => updateSetting("primary_storage", e.target.value)}
                        disabled={saving === "primary_storage"}
                      >
                        <option value="arweave">ARWEAVE</option>
                        <option value="ipfs">IPFS</option>
                      </select>
                    </div>
                    <div className="divider opacity-5 my-0"></div>
                    <div className="flex justify-between items-center p-4 rounded-2xl hover:bg-base-200/30 transition-colors">
                      <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-base-content/40 block mb-1">
                          Max File Size (MB)
                        </label>
                        <span className="text-xs font-black uppercase tracking-wider text-base-content">
                          {settings.max_file_size_mb || 50} MB
                        </span>
                        <p className="text-[10px] text-base-content/30 mt-1 font-medium italic">
                          Hard limit for client-side uploads.
                        </p>
                      </div>
                      <input
                        type="number"
                        className="input input-bordered input-sm w-20 font-black text-[10px] h-8 min-h-0 bg-base-100/50 rounded-lg border-base-300/50 text-center"
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

          <div className="mt-16 p-10 bg-primary/5 rounded-[2.5rem] border border-dashed border-primary/20 text-center max-w-4xl mx-auto backdrop-blur-sm">
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Advanced Platform Governance</h3>
            <p className="text-sm text-base-content/60 mb-8 max-w-xl mx-auto font-medium">
              Access smart contract pausing, circuit version management, and global rate limit overrides. These actions
              require multisig approval.
            </p>
            <button
              className="btn btn-primary px-10 rounded-2xl shadow-xl shadow-primary/20 uppercase font-black tracking-widest text-[10px] h-12"
              disabled
            >
              Upgrade Governance Tier
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
