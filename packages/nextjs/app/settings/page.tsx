"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CreditCardIcon, KeyIcon, TrashIcon, UserCircleIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { AppLogo } from "~~/components/AppLogo";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

type ApiKeyRow = {
  id: string;
  name: string | null;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
};

function ApiKeysSection() {
  const { session, user } = useSupabaseAuth();
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/api-keys", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError((j as { error?: string }).error ?? "Failed to load keys");
        return;
      }
      const data = (await res.json()) as { keys: ApiKeyRow[] };
      setKeys(data.keys ?? []);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  const createKey = useCallback(async () => {
    if (!session?.access_token) return;
    setCreating(true);
    setError(null);
    setNewKey(null);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ name: "My API key" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Failed to create key");
        return;
      }
      setNewKey((data as { key: string }).key ?? null);
      void fetchKeys();
    } finally {
      setCreating(false);
    }
  }, [session?.access_token, fetchKeys]);

  const revokeKey = useCallback(
    async (id: string) => {
      if (!session?.access_token) return;
      try {
        const res = await fetch(`/api/api-keys/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) void fetchKeys();
      } catch {
        setError("Failed to revoke");
      }
    },
    [session?.access_token, fetchKeys],
  );

  useEffect(() => {
    if (user && session?.access_token) void fetchKeys();
  }, [user, session?.access_token, fetchKeys]);

  if (!user) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body flex-row items-center gap-4">
          <div className="rounded-lg bg-base-300/50 p-3">
            <KeyIcon className="h-6 w-6 text-base-content/60" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base-content">API keys</h2>
            <p className="text-xs text-base-content/60">Sign in to create and manage keys for the developer API.</p>
          </div>
          <Link href="/login" className="btn btn-primary btn-sm">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <KeyIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-base-content">API keys</h2>
              <p className="text-xs text-base-content/60">Use keys to authenticate with the developer API.</p>
            </div>
          </div>
          <button type="button" onClick={fetchKeys} disabled={loading} className="btn btn-ghost btn-sm">
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        {newKey && (
          <div className="rounded-lg bg-success/10 border border-success/30 p-3">
            <p className="text-xs font-bold text-success mb-1">New key — copy it now; it won’t be shown again.</p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="text-xs font-mono break-all flex-1">{newKey}</code>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  void navigator.clipboard.writeText(newKey);
                  setNewKey(null);
                }}
              >
                Copy & dismiss
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {keys.length === 0 && !loading && (
            <p className="text-sm text-base-content/50">No API keys yet. Create one to use the developer API.</p>
          )}
          {keys.map(k => (
            <div
              key={k.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-base-300 bg-base-200/50 p-3"
            >
              <div className="min-w-0">
                <p className="font-mono text-sm truncate">{k.key_prefix}…</p>
                <p className="text-xs text-base-content/50">
                  {k.name ?? "Unnamed"} · {new Date(k.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-xs text-error"
                onClick={() => revokeKey(k.id)}
                aria-label="Revoke key"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm w-full sm:w-auto"
          onClick={createKey}
          disabled={creating}
        >
          {creating ? "Creating…" : "Create API key"}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <header className="border-b border-base-300 bg-base-100/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AppLogo className="h-8 w-8" />
            <span className="font-bold text-sm uppercase tracking-wider">Aeternum</span>
          </Link>
          <Link href="/vault" className="text-xs font-medium text-base-content/70 hover:text-primary">
            Back to Vault
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-base-content mb-2">Settings</h1>
        <p className="text-sm text-base-content/60 mb-8">Manage your account, API keys, and billing.</p>

        <div className="flex flex-col gap-4">
          <Link
            href="/login"
            className="card bg-base-100 border border-base-300 shadow-sm hover:border-primary/30 transition-colors"
          >
            <div className="card-body flex-row items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <UserCircleIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base-content">Account</h2>
                <p className="text-xs text-base-content/60">Email, wallet link, sign out</p>
              </div>
              <span className="text-base-content/40">→</span>
            </div>
          </Link>

          <ApiKeysSection />

          <div className="card bg-base-100 border border-base-300 shadow-sm opacity-90">
            <div className="card-body flex-row items-center gap-4">
              <div className="rounded-lg bg-base-300/50 p-3">
                <CreditCardIcon className="h-6 w-6 text-base-content/60" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base-content">Billing</h2>
                <p className="text-xs text-base-content/60">Plans and subscription (coming soon)</p>
              </div>
            </div>
          </div>

          <Link
            href="/team"
            className="card bg-base-100 border border-base-300 shadow-sm hover:border-primary/30 transition-colors"
          >
            <div className="card-body flex-row items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <UserGroupIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base-content">Team</h2>
                <p className="text-xs text-base-content/60">Organizations and members (coming soon)</p>
              </div>
              <span className="text-base-content/40">→</span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
