"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { KeyIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

type ApiKeyRow = {
  id: string;
  name: string | null;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
};

export default function ApiKeysPage() {
  const { session, user } = useSupabaseAuth();
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/api-keys", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to load keys");
      const data = await res.json();
      setKeys(data.keys ?? []);
    } catch (err) {
      console.error("API Keys error:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  const createKey = useCallback(async () => {
    if (!session?.access_token) return;
    setCreating(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ name: "API Key " + (keys.length + 1) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create key");
      setNewKey(data.key);
      void fetchKeys();
      toast.success("API key generated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  }, [session?.access_token, fetchKeys, keys.length]);

  const revokeKey = useCallback(
    async (id: string) => {
      if (!session?.access_token || !confirm("Revoke this key? It will stop working immediately.")) return;
      try {
        const res = await fetch(`/api/api-keys/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          void fetchKeys();
          toast.success("Key revoked");
        }
      } catch {
        toast.error("Failed to revoke");
      }
    },
    [session?.access_token, fetchKeys],
  );

  useEffect(() => {
    if (user) void fetchKeys();
  }, [user, fetchKeys]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-2xl font-bold mb-4">API Keys</h1>
        <p className="text-base-content/60 mb-6">Sign in to manage your developer keys.</p>
        <Link href="/login" className="btn btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Developer API Keys</h1>
          <p className="text-sm text-base-content/60">Authenticate your applications with Aeternum.</p>
        </div>
        <button onClick={createKey} disabled={creating} className="btn btn-primary gap-2">
          {creating ? <span className="loading loading-spinner loading-xs"></span> : <PlusIcon className="h-5 w-5" />}
          Generate New Key
        </button>
      </div>

      {newKey && (
        <div className="alert alert-success border-success/30 bg-success/10 mb-8 rounded-2xl flex-col items-start gap-3">
          <div className="flex items-center gap-2">
            <KeyIcon className="h-5 w-5" />
            <span className="font-bold">New Key Generated</span>
          </div>
          <div className="w-full">
            <p className="text-xs mb-2">Copy this key now. For security, we cannot show it again.</p>
            <div className="flex items-center gap-2 bg-base-100 p-3 rounded-lg border border-success/20 w-full overflow-hidden">
              <code className="text-sm font-mono truncate flex-1">{newKey}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newKey);
                  toast.success("Copied to clipboard");
                  setNewKey(null);
                }}
                className="btn btn-primary btn-sm"
              >
                Copy & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-base-content/50">Loading your keys…</div>
      ) : keys.length === 0 ? (
        <div className="card bg-base-200 border border-base-300 border-dashed">
          <div className="card-body py-12 items-center text-center">
            <KeyIcon className="h-12 w-12 text-base-content/20 mb-4" />
            <h3 className="text-xl font-bold">No API keys found</h3>
            <p className="text-sm text-base-content/60 max-w-xs">
              Generate a key to start building with the Aeternum evidence vault API.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {keys.map(k => (
            <div key={k.id} className="card bg-base-100 border border-base-300 hover:shadow-md transition-shadow">
              <div className="card-body p-6 flex-row items-center gap-6">
                <div className="rounded-xl bg-primary/10 p-4">
                  <KeyIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base-content truncate">{k.name || "Unnamed Key"}</h3>
                  <div className="flex items-center gap-4 text-[10px] text-base-content/50 font-mono mt-1">
                    <span>Prefix: {k.key_prefix}…</span>
                    <span>Created: {new Date(k.created_at).toLocaleDateString()}</span>
                    <span>Last used: {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never"}</span>
                  </div>
                </div>
                <button onClick={() => revokeKey(k.id)} className="btn btn-ghost btn-sm text-error hover:bg-error/10">
                  <TrashIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Revoke</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-base-200/50 border border-base-300 rounded-3xl">
        <h4 className="font-bold mb-2">Developer Resources</h4>
        <p className="text-xs text-base-content/60 mb-4">
          Read our documentation to learn how to integrate Aeternum proofs into your own applications.
        </p>
        <Link href="/docs" className="text-primary text-xs font-bold hover:underline">
          View API Documentation →
        </Link>
      </div>
    </div>
  );
}
