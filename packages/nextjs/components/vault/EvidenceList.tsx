"use client";

import { useState } from "react";
import {
  ArrowDownTrayIcon,
  CalendarIcon,
  DocumentMagnifyingGlassIcon,
  KeyIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface EvidenceItem {
  id: string;
  fileHash: string;
  timestamp: number;
  storageId: string;
}

export const EvidenceCard = ({ proof }: { proof: EvidenceItem }) => {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden">
      <div className="card-body p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider border border-success/20">
            <ShieldCheckIcon className="h-3 w-3" />
            <span>Verified On-chain</span>
          </div>
          <p className="text-[10px] text-base-content/40 font-mono font-medium">#{proof.id.slice(0, 8)}</p>
        </div>

        <h4 className="font-bold text-base-content truncate mb-1" title={proof.fileHash}>
          {proof.fileHash.slice(0, 24)}...
        </h4>

        <div className="flex items-center gap-4 text-xs text-base-content/50 mt-4">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>{new Date(proof.timestamp).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <KeyIcon className="h-3.5 w-3.5" />
            <span className="font-mono">ZK Proof</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-base-300 flex items-center justify-between gap-2">
          <button className="btn btn-ghost btn-sm flex-1 gap-2 text-xs font-bold uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-colors">
            <ArrowDownTrayIcon className="h-3.5 w-3.5" />
            <span>Recover</span>
          </button>
          <div className="w-px h-4 bg-base-300"></div>
          <button className="btn btn-ghost btn-sm flex-1 gap-2 text-xs font-bold uppercase tracking-widest hover:bg-secondary/5 hover:text-secondary-content transition-colors">
            <DocumentMagnifyingGlassIcon className="h-3.5 w-3.5" />
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const EvidenceList = () => {
  // Mock data for UI demonstration
  const [proofs] = useState<EvidenceItem[]>([
    {
      id: "1",
      fileHash: "0x7f83b123456789abcdef0123456789abcdef0123456789abcdef0123456789abc",
      timestamp: Date.now() - 86400000,
      storageId: "ar-123",
    },
    {
      id: "2",
      fileHash: "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      timestamp: Date.now() - 86400000 * 3,
      storageId: "ar-456",
    },
    {
      id: "3",
      fileHash: "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567",
      timestamp: Date.now() - 86400000 * 7,
      storageId: "ar-789",
    },
  ]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {proofs.map(proof => (
        <EvidenceCard key={proof.id} proof={proof} />
      ))}
    </div>
  );
};
