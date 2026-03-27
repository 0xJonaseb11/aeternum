"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { MagnifyingGlassIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { ProofListSkeleton } from "~~/components/ui/Skeleton";
import { EvidenceList } from "~~/components/vault/EvidenceList";
import deployedContracts from "~~/contracts/deployedContracts";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { computeHash } from "~~/utils/vault/crypto";

const VerificationPage: NextPage = () => {
  const router = useRouter();
  const { address: connectedAddress, isConnecting, chain } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const isWrongNetwork = chain && chain.id !== targetNetwork.id;
  const hasVaultContract = Boolean(
    deployedContracts[targetNetwork.id as keyof typeof deployedContracts]?.EvidenceVault,
  );

  // Public Verification State
  const [mode, setMode] = useState<"proofId" | "hash" | "file">("proofId");
  const [proofId, setProofId] = useState("");
  const [commitmentHash, setCommitmentHash] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProofIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    const trimmed = proofId.trim();
    if (!trimmed) {
      setLookupError("Enter a proof ID");
      return;
    }
    router.push(`/evidence/${encodeURIComponent(trimmed)}`);
  };

  const handleHashSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLookupError(null);
      const trimmed = commitmentHash.trim();
      if (!trimmed) {
        setLookupError("Enter a commitment (file) hash");
        return;
      }
      if (!/^0x[a-fA-F0-9]{64}$/i.test(trimmed)) {
        setLookupError("Hash must be 0x followed by 64 hex characters");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/proofs?fileHash=${encodeURIComponent(trimmed)}`);
        if (res.status === 404) {
          setLookupError("No proof found for this commitment hash.");
          return;
        }
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setLookupError((j as { error?: string }).error ?? "Lookup failed");
          return;
        }
        const data = (await res.json()) as { proofId: string };
        router.push(`/evidence/${data.proofId}`);
      } catch {
        setLookupError("Network error. Try again.");
      } finally {
        setLoading(false);
      }
    },
    [commitmentHash, router],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setLookupError(null);
      const file = e.target.files?.[0];
      if (!file) return;
      setLoading(true);
      try {
        const buf = await file.arrayBuffer();
        const fileHash = await computeHash(buf);
        const res = await fetch(`/api/proofs?fileHash=${encodeURIComponent(fileHash)}`);
        if (res.status === 404) {
          setLookupError("No proof found for this file.");
          setLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
        if (!res.ok) {
          setLookupError("Lookup failed");
          setLoading(false);
          return;
        }
        const data = (await res.json()) as { proofId: string };
        router.push(`/evidence/${data.proofId}`);
      } catch {
        setLookupError("Failed to compute hash or lookup.");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [router],
  );

  return (
    <div className="flex flex-col grow w-full min-w-0">
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b border-base-300/50">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 right-1/3 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(var(--color-primary-rgb),0.1),transparent_70%)]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-tight text-base-content">
              Verify and <br />
              <span className="text-primary italic drop-shadow-sm">restore your truth</span>
            </h1>

            <p className="text-lg md:text-2xl text-base-content/60 max-w-3xl mx-auto font-medium leading-relaxed mb-16">
              Instant cryptographic verification for any digital record. <br className="hidden md:block" />
              Upload, hash, or provide an ID to reveal immutable proof.
            </p>

            {/* Integrated Verification Portal */}
            <div className="max-w-3xl mx-auto">
              <div className="glass p-1 rounded-2xl border border-primary/20 mb-8 inline-flex gap-1 shadow-2xl">
                {(["proofId", "hash", "file"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      mode === m
                        ? "bg-primary text-primary-content shadow-lg"
                        : "text-base-content/40 hover:text-primary"
                    }`}
                  >
                    {m === "proofId" ? "Proof ID" : m === "hash" ? "Commitment" : "Upload File"}
                  </button>
                ))}
              </div>

              <div className="max-w-2xl mx-auto">
                {mode === "proofId" && (
                  <form onSubmit={handleProofIdSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Enter verification proof ID..."
                      className="input input-lg flex-1 rounded-[1.5rem] bg-base-100/50 border-primary/20 focus:border-primary text-lg font-mono"
                      value={proofId}
                      onChange={e => {
                        setProofId(e.target.value);
                        setLookupError(null);
                      }}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg rounded-[1.5rem] px-8 gap-2 shadow-xl shadow-primary/20"
                    >
                      <MagnifyingGlassIcon className="h-5 w-5" />
                      Verify
                    </button>
                  </form>
                )}

                {mode === "hash" && (
                  <form onSubmit={handleHashSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Enter 0x... commitment hash"
                      className="input input-lg flex-1 rounded-[1.5rem] bg-base-100/50 border-primary/20 focus:border-primary text-lg font-mono"
                      value={commitmentHash}
                      onChange={e => {
                        setCommitmentHash(e.target.value);
                        setLookupError(null);
                      }}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg rounded-[1.5rem] px-8 gap-2 shadow-xl shadow-primary/20"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="loading loading-spinner"></span>
                      ) : (
                        <MagnifyingGlassIcon className="h-5 w-5" />
                      )}
                      Verify
                    </button>
                  </form>
                )}

                {mode === "file" && (
                  <div className="relative group">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      disabled={loading}
                      className="file-input file-input-lg file-input-primary w-full rounded-[1.5rem] bg-base-100/50 border-primary/20"
                    />
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-base-100/80 rounded-[1.5rem]">
                        <span className="loading loading-spinner text-primary mr-3"></span>
                        <span className="text-sm font-bold uppercase tracking-widest text-primary">
                          Computing Proof...
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {lookupError && (
                  <p className="mt-4 text-sm text-error font-bold flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                    {lookupError}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-base-100 w-full border-t border-base-300/30">
        <div className="container mx-auto px-4 max-w-6xl w-full">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px grow bg-base-300"></div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-base-content/30 whitespace-nowrap">
              Vault Membership & Access
            </h3>
            <div className="h-px grow bg-base-300"></div>
          </div>

          {!connectedAddress ? (
            <div className="rounded-[2.5rem] border-2 border-dashed border-base-300 bg-base-200/30 p-12 text-center group hover:border-primary/30 transition-colors">
              <ShieldCheckIcon className="h-12 w-12 text-base-content/20 mx-auto mb-6 group-hover:text-primary transition-colors" />
              <p className="font-black text-xl mb-2">Connect your wallet</p>
              <p className="text-base-content/50 max-w-sm mx-auto font-medium">
                Use the same wallet you used when securing your evidence to view your private proofs.
              </p>
            </div>
          ) : isWrongNetwork ? (
            <div className="rounded-[2.5rem] border border-warning/50 bg-warning/10 p-12 text-center">
              <p className="font-black text-warning text-xl mb-2 uppercase tracking-tight">Wrong network</p>
              <p className="text-base-content/70 font-medium">
                Switch to {targetNetwork.name} to verify or recover evidence.
              </p>
            </div>
          ) : !hasVaultContract ? (
            <div className="rounded-[2.5rem] border border-base-300 bg-base-100 p-12 text-center">
              <p className="font-black text-xl mb-2">Vault not available</p>
              <p className="text-base-content/60 font-medium">Evidence Vault is not deployed on this network.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-base-200/50 p-6 rounded-3xl border border-base-300">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black tracking-widest text-primary mb-1">
                    Authenticated Session
                  </span>
                  <p className="text-sm text-base-content/60 font-medium">
                    Enter your key below to find evidence from your personalized vault.
                  </p>
                </div>
                <div className="bg-base-100 px-6 py-3 rounded-2xl border border-base-300 shadow-sm flex items-center gap-4 group hover:border-primary transition-colors">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase font-black text-base-content/30 mb-0.5">Scoping Proofs</span>
                    <Address
                      address={connectedAddress}
                      chain={targetNetwork}
                      blockExplorerAddressLink={
                        targetNetwork.id === hardhat.id ? `/blockexplorer/address/${connectedAddress}` : undefined
                      }
                    />
                  </div>
                </div>
              </div>

              {isConnecting ? <ProofListSkeleton count={3} /> : <EvidenceList showSecretFinder />}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VerificationPage;
