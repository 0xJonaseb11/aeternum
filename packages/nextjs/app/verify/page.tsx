"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { AppLogo } from "~~/components/AppLogo";

/**
 * Public verification portal: verify evidence by proof ID.
 * Enter a proof ID (from a shareable link or dashboard) to view verification status.
 * Future: add file upload and commitment hash lookup.
 */
export default function VerifyPage() {
  const router = useRouter();
  const [proofId, setProofId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = proofId.trim();
    if (!trimmed) {
      setError("Enter a proof ID");
      return;
    }
    router.push(`/evidence/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <AppLogo className="h-14 w-14 shrink-0" />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
              <ShieldCheckIcon className="h-4 w-4 shrink-0" />
              <span>Public verification</span>
            </div>
            <h1 className="text-2xl font-bold text-base-content">Verify evidence</h1>
            <p className="text-sm text-base-content/70">
              Enter the proof ID from a shareable verification link to view status, timestamp, and commitment hash.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <label htmlFor="proofId" className="text-xs font-bold uppercase text-base-content/60">
              Proof ID
            </label>
            <div className="join w-full flex flex-col sm:flex-row gap-2">
              <input
                id="proofId"
                type="text"
                placeholder="e.g. from /evidence/... link"
                className="input input-bordered join-item flex-1 font-mono text-sm"
                value={proofId}
                onChange={e => {
                  setProofId(e.target.value);
                  setError(null);
                }}
              />
              <button type="submit" className="btn btn-primary join-item gap-2">
                <MagnifyingGlassIcon className="h-4 w-4 shrink-0" />
                View verification
              </button>
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
          </form>

          <p className="text-xs text-base-content/50 text-center">
            You can find the proof ID in your vault when you click &quot;Share&quot; on an evidence item, or from the
            verification URL (e.g. /evidence/...).
          </p>
        </div>
      </main>
    </div>
  );
}
