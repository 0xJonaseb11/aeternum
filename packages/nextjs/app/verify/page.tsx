"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { AppLogo } from "~~/components/AppLogo";
import { computeHash } from "~~/utils/vault/crypto";

type Mode = "proofId" | "hash" | "file";

export default function VerifyPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("proofId");
  const [proofId, setProofId] = useState("");
  const [commitmentHash, setCommitmentHash] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProofIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = proofId.trim();
    if (!trimmed) {
      setError("Enter a proof ID");
      return;
    }
    router.push(`/evidence/${encodeURIComponent(trimmed)}`);
  };

  const handleHashSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const trimmed = commitmentHash.trim();
      if (!trimmed) {
        setError("Enter a commitment (file) hash");
        return;
      }
      if (!/^0x[a-fA-F0-9]{64}$/i.test(trimmed)) {
        setError("Hash must be 0x followed by 64 hex characters");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/proofs?fileHash=${encodeURIComponent(trimmed)}`);
        if (res.status === 404) {
          setError("No proof found for this commitment hash.");
          return;
        }
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setError((j as { error?: string }).error ?? "Lookup failed");
          return;
        }
        const data = (await res.json()) as { proofId: string };
        router.push(`/evidence/${data.proofId}`);
      } catch {
        setError("Network error. Try again.");
      } finally {
        setLoading(false);
      }
    },
    [commitmentHash, router],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;
      setLoading(true);
      try {
        const buf = await file.arrayBuffer();
        const fileHash = await computeHash(buf);
        const res = await fetch(`/api/proofs?fileHash=${encodeURIComponent(fileHash)}`);
        if (res.status === 404) {
          setError("No proof found for this file.");
          setLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
        if (!res.ok) {
          setError("Lookup failed");
          setLoading(false);
          return;
        }
        const data = (await res.json()) as { proofId: string };
        router.push(`/evidence/${data.proofId}`);
      } catch {
        setError("Failed to compute hash or lookup.");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [router],
  );

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <AppLogo className="h-14 w-14 shrink-0" />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
              <ShieldCheckIcon className="h-4 w-4 shrink-0" />
              <span>Public verification</span>
            </div>
            <h1 className="text-2xl font-bold text-base-content">Verify evidence</h1>
            <p className="text-sm text-base-content/70">
              Use proof ID, commitment hash, or upload the original file to view verification status.
            </p>
          </div>

          <div className="tabs tabs-boxed bg-base-200/60 p-1 rounded-lg w-full justify-center flex flex-wrap gap-1">
            <button
              type="button"
              className={`tab tab-sm ${mode === "proofId" ? "tab-active" : ""}`}
              onClick={() => setMode("proofId")}
            >
              Proof ID
            </button>
            <button
              type="button"
              className={`tab tab-sm ${mode === "hash" ? "tab-active" : ""}`}
              onClick={() => setMode("hash")}
            >
              Commitment hash
            </button>
            <button
              type="button"
              className={`tab tab-sm ${mode === "file" ? "tab-active" : ""}`}
              onClick={() => setMode("file")}
            >
              Upload file
            </button>
          </div>

          {mode === "proofId" && (
            <form onSubmit={handleProofIdSubmit} className="w-full flex flex-col gap-3">
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
            </form>
          )}

          {mode === "hash" && (
            <form onSubmit={handleHashSubmit} className="w-full flex flex-col gap-3">
              <label htmlFor="commitmentHash" className="text-xs font-bold uppercase text-base-content/60">
                Commitment (file) hash
              </label>
              <div className="join w-full flex flex-col sm:flex-row gap-2">
                <input
                  id="commitmentHash"
                  type="text"
                  placeholder="0x..."
                  className="input input-bordered join-item flex-1 font-mono text-sm"
                  value={commitmentHash}
                  onChange={e => {
                    setCommitmentHash(e.target.value);
                    setError(null);
                  }}
                />
                <button type="submit" className="btn btn-primary join-item gap-2" disabled={loading}>
                  {loading ? "Looking up…" : "View verification"}
                  <MagnifyingGlassIcon className="h-4 w-4 shrink-0" />
                </button>
              </div>
            </form>
          )}

          {mode === "file" && (
            <div className="w-full flex flex-col gap-3">
              <label className="text-xs font-bold uppercase text-base-content/60">Original file</label>
              <input
                ref={fileInputRef}
                type="file"
                className="file-input file-input-bordered w-full"
                onChange={handleFileSelect}
                disabled={loading}
                accept="*/*"
              />
              {loading && <p className="text-sm text-base-content/50">Computing hash and looking up proof…</p>}
            </div>
          )}

          {error && <p className="text-sm text-error w-full">{error}</p>}

          <p className="text-xs text-base-content/50 text-center">
            {mode === "proofId" &&
              "Proof ID is in the shareable verification URL or in your vault when you click Share."}
            {mode === "hash" && "Paste the 0x-prefixed 64-character hex commitment hash for the evidence."}
            {mode === "file" && "We hash the file and look up the matching proof. The file is not uploaded."}
          </p>
        </div>
      </main>
    </div>
  );
}
