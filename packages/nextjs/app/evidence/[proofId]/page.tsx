"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { createCertificatePdf } from "~~/utils/vault/certificatePdf";

type Proof = {
  proofId: string;
  chainId: number;
  owner: string;
  fileHash: string;
  timestamp: number;
  blockNumber: number;
  arweaveTxId: string;
  ipfsCid: string | null;
  revoked: boolean;
};

function sliceHash(hex: string, start = 10, end = 8): string {
  if (!hex || hex.length < start + end) return hex;
  const s = hex.startsWith("0x") ? hex.slice(2) : hex;
  return `0x${s.slice(0, start)}...${s.slice(-end)}`;
}

export default function EvidenceVerificationPage() {
  const params = useParams();
  const proofId = params?.proofId as string | undefined;
  const [proof, setProof] = useState<Proof | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!proofId) {
      setLoading(false);
      setError("Missing proof ID");
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/proofs/${encodeURIComponent(proofId)}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Proof not found");
          throw new Error("Failed to load proof");
        }
        return res.json();
      })
      .then(data => {
        setProof(data);
        setError(null);
      })
      .catch(e => {
        setProof(null);
        setError(e.message ?? "Something went wrong");
      })
      .finally(() => setLoading(false));
  }, [proofId]);

  const copyCommitment = useCallback(() => {
    if (!proof?.fileHash) return;
    void navigator.clipboard.writeText(proof.fileHash);
  }, [proof?.fileHash]);

  const downloadCertificate = useCallback(async () => {
    if (!proof) return;
    const blob = await createCertificatePdf({
      fileHash: proof.fileHash,
      timestamp: proof.timestamp,
      storageId: proof.arweaveTxId,
      ipfsCid: proof.ipfsCid ?? undefined,
      owner: proof.owner,
      verificationUrl: typeof window !== "undefined" ? window.location.href : undefined,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aeternum-certificate-${proof.fileHash.slice(2, 10)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [proof]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-base-content/60">Loading verification…</p>
        </div>
      </div>
    );
  }

  if (error || !proof) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-bold text-base-content mb-2">Proof not found</h1>
          <p className="text-sm text-base-content/70 mb-4">
            {error ?? "This verification link may be invalid or expired."}
          </p>
          <Link href="/verify" className="btn btn-primary btn-sm">
            Go to verification portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6 border border-primary/20">
          <ShieldCheckIcon className="h-4 w-4 shrink-0" />
          <span>Verified on-chain</span>
        </div>

        <h1 className="text-2xl font-bold text-base-content mb-6">Evidence verification</h1>

        <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
          <div className="card-body gap-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase text-base-content/50 mb-0.5">Commitment hash</p>
                <p className="font-mono text-sm break-all">{proof.fileHash}</p>
              </div>
              <button
                type="button"
                onClick={copyCommitment}
                className="btn btn-ghost btn-xs btn-square shrink-0"
                aria-label="Copy hash"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase text-base-content/50">Timestamp</p>
                <p className="text-base-content">{new Date(proof.timestamp * 1000).toUTCString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-base-content/50">Block</p>
                <p className="text-base-content">{proof.blockNumber.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-base-content/50">Owner</p>
                <p className="font-mono text-xs break-all text-base-content/80">{sliceHash(proof.owner)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-base-content/50">Storage</p>
                <p className="font-mono text-xs break-all text-base-content/80">
                  Arweave · {sliceHash(proof.arweaveTxId, 12, 8)}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-base-300 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-success text-xs font-medium">
                <CheckCircleIcon className="h-4 w-4 shrink-0" />
                Status: Verified
              </span>
              <span className="text-base-content/40">·</span>
              <span className="text-xs text-base-content/50">
                Proof ID: <span className="font-mono">{sliceHash(proof.proofId, 8, 4)}</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button type="button" onClick={downloadCertificate} className="btn btn-primary btn-sm gap-2">
                <ArrowDownTrayIcon className="h-4 w-4 shrink-0" />
                Download certificate (PDF)
              </button>
              <Link href="/verify" className="btn btn-ghost btn-sm gap-2" title="Verification portal">
                <DocumentTextIcon className="h-4 w-4 shrink-0" />
                Verify another file
              </Link>
            </div>
          </div>
        </div>

        <p className="text-xs text-base-content/50 mt-6">
          This page shows only verification metadata. The encrypted file is never exposed. To recover the file you need
          the original secret key and access from the vault.
        </p>
      </main>
    </div>
  );
}
