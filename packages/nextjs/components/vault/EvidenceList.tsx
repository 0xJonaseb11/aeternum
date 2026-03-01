import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  ArrowDownTrayIcon,
  CalendarIcon,
  CheckCircleIcon,
  DocumentMagnifyingGlassIcon,
  FingerPrintIcon,
  KeyIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ProofListSkeleton } from "~~/components/ui/Skeleton";
import { useScaffoldEventHistory, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useRecover } from "~~/hooks/vault/useRecover";
import { useVerifyOwnership } from "~~/hooks/vault/useVerifyOwnership";
import { notification } from "~~/utils/scaffold-eth";
import { createCertificatePdf } from "~~/utils/vault/certificatePdf";
import { isZKArtifactsAvailable } from "~~/utils/vault/zkProof";

interface EvidenceItem {
  id: string;
  fileHash: string;
  timestamp: number;
  storageId: string;
  ipfsCid?: string;
}

export const EvidenceCard = ({ proof }: { proof: EvidenceItem }) => {
  const [showRecover, setShowRecover] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [secret, setSecret] = useState("");
  const [verifySecret, setVerifySecret] = useState("");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [zkAvailable, setZkAvailable] = useState(false);
  const { recoverFile, isRecovering } = useRecover();
  const { verify, isVerifying } = useVerifyOwnership();

  useEffect(() => {
    isZKArtifactsAvailable().then(setZkAvailable);
  }, []);

  const handleRecover = async () => {
    if (!secret) {
      notification.error("Please enter your secret key");
      return;
    }
    await recoverFile(proof.storageId, secret, `aeternum_${proof.fileHash.slice(2, 10)}.enc`, proof.ipfsCid);
    setShowRecover(false);
    setSecret("");
  };

  const handleVerifyOwnership = async () => {
    if (!verifySecret.trim()) {
      notification.error("Enter your secret key to generate the ZK proof.");
      return;
    }
    setVerifyResult(null);
    const secretHex = verifySecret.trim().startsWith("0x") ? verifySecret.trim() : `0x${verifySecret.trim()}`;
    const result = await verify(proof.fileHash, secretHex);
    setVerifyResult(result.verified);
    if (result.verified) {
      notification.success("Ownership verified! Your ZK proof is valid.");
    } else {
      notification.error(result.error ?? "Verification failed.");
    }
  };

  const handleDetails = () => {
    try {
      const blob = createCertificatePdf({
        fileHash: proof.fileHash,
        timestamp: proof.timestamp,
        storageId: proof.storageId,
        ipfsCid: proof.ipfsCid,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `aeternum_certificate_${proof.fileHash.slice(2, 10)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      notification.success("Certificate downloaded.");
    } catch (e) {
      console.error("Certificate Error:", e);
      notification.error("Failed to generate certificate.");
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden">
      <div className="card-body p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
            <ShieldCheckIcon className="h-3 w-3" />
            <span>Verified On-chain</span>
          </div>
          <p className="text-[10px] text-base-content/40 font-mono font-medium">#{proof.fileHash.slice(2, 10)}</p>
        </div>

        <h4 className="font-bold text-base-content truncate mb-1" title={proof.fileHash}>
          {proof.fileHash.slice(0, 24)}...
        </h4>

        <div className="flex items-center gap-4 text-xs text-base-content/50 mt-4">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>{new Date(proof.timestamp * 1000).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <KeyIcon className="h-3.5 w-3.5" />
            <span className="font-mono">ZK Proof</span>
          </div>
        </div>

        {showRecover ? (
          <div className="mt-6 pt-4 border-t border-base-300 animate-in fade-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase text-base-content/40">Enter Secret Key</span>
              <button onClick={() => setShowRecover(false)} className="btn btn-ghost btn-xs btn-circle">
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
            <div className="join w-full">
              <input
                type="password"
                placeholder="0x..."
                className="input input-bordered input-sm join-item flex-1 text-xs font-mono"
                value={secret}
                onChange={e => setSecret(e.target.value)}
              />
              <button
                onClick={handleRecover}
                disabled={isRecovering}
                className={`btn btn-primary btn-sm join-item px-4 ${isRecovering ? "loading" : ""}`}
              >
                {isRecovering ? "" : "Go"}
              </button>
            </div>
          </div>
        ) : showVerify ? (
          <div className="mt-6 pt-4 border-t border-base-300 animate-in fade-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase text-base-content/40">Verify ownership (ZK)</span>
              <button onClick={() => setShowVerify(false)} className="btn btn-ghost btn-xs btn-circle">
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
            <p className="text-[10px] text-base-content/50 mb-2">
              Enter your secret to generate a zero-knowledge proof. Your secret never leaves this device.
            </p>
            <div className="join w-full mb-2">
              <input
                type="password"
                placeholder="0x... or hex secret"
                className="input input-bordered input-sm join-item flex-1 text-xs font-mono"
                value={verifySecret}
                onChange={e => {
                  setVerifySecret(e.target.value);
                  setVerifyResult(null);
                }}
              />
              <button
                onClick={handleVerifyOwnership}
                disabled={isVerifying}
                className={`btn btn-primary btn-sm join-item px-4 ${isVerifying ? "loading" : ""}`}
              >
                {isVerifying ? "Proving…" : "Verify"}
              </button>
            </div>
            {verifyResult === true && (
              <div className="flex items-center gap-2 text-success text-xs font-medium">
                <CheckCircleIcon className="h-4 w-4 shrink-0" />
                <span>Ownership verified on-chain</span>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 pt-4 border-t border-base-300 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => setShowRecover(true)}
              className="btn btn-ghost btn-sm flex-1 gap-2 text-xs font-bold uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-colors min-w-0"
            >
              <ArrowDownTrayIcon className="h-3.5 w-3.5 shrink-0" />
              <span>Recover</span>
            </button>
            <div className="w-px h-4 bg-base-300 shrink-0" />
            <button
              onClick={() => zkAvailable && setShowVerify(true)}
              disabled={!zkAvailable}
              title={
                zkAvailable
                  ? "Prove ownership with zero-knowledge (no secret on-chain)"
                  : "ZK artifacts not loaded. Run zk:setup in hardhat and copy to public/zk/"
              }
              className="btn btn-ghost btn-sm flex-1 gap-2 text-xs font-bold uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-colors min-w-0 disabled:opacity-50"
            >
              <FingerPrintIcon className="h-3.5 w-3.5 shrink-0" />
              <span>Verify</span>
            </button>
            <div className="w-px h-4 bg-base-300 shrink-0" />
            <button
              onClick={handleDetails}
              className="btn btn-ghost btn-sm flex-1 gap-2 text-xs font-bold uppercase tracking-widest hover:bg-secondary/5 hover:text-secondary-content transition-colors min-w-0"
            >
              <DocumentMagnifyingGlassIcon className="h-3.5 w-3.5 shrink-0" />
              <span>Certificate</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const EvidenceList = () => {
  const { address: connectedAddress } = useAccount();

  const {
    data: events,
    isLoading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
  } = useScaffoldEventHistory({
    contractName: "EvidenceVault",
    eventName: "ProofCreated",
    filters: { owner: connectedAddress },
    blocksBatchSize: 500,
    enabled: !!connectedAddress,
  });

  if (!connectedAddress) {
    return (
      <div className="text-center py-12 bg-base-200/30 rounded-2xl border border-dashed border-base-300">
        <p className="text-base-content/40 font-medium">Connect your wallet to view archive evidence.</p>
      </div>
    );
  }

  if (eventsLoading) {
    return <ProofListSkeleton count={3} />;
  }

  if (eventsError != null) {
    return (
      <div className="text-center py-12 bg-base-200/30 rounded-2xl border border-dashed border-base-300">
        <p className="text-base-content/60 font-medium mb-2">Could not load evidence proofs.</p>
        <p className="text-sm text-base-content/40 mb-4">The chain may be busy. You can try again.</p>
        <button onClick={() => refetchEvents()} className="btn btn-primary btn-sm">
          Retry
        </button>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12 bg-base-200/30 rounded-2xl border border-dashed border-base-300">
        <p className="text-base-content/40 font-medium">No archive evidence found for this wallet.</p>
      </div>
    );
  }

  // We sort by timestamp descending
  const sortedEvents = [...events].sort((a, b) => Number(b.args.timestamp) - Number(a.args.timestamp));

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sortedEvents.map(event => {
        const fileHash = event.args.fileHash as string;
        // In a more complex app, we'd fetch the full proof object using useScaffoldReadContract
        // but for the list, we can show what's in the event.
        // We might need another hook to fetch the ArweaveTxId if not in event.
        // The event has: owner, fileHash, timestamp, blockNumber.
        // Wait, the event ProofCreated DOES NOT have arweaveTxId.
        // So we need to call getProof(fileHash) for each.
        return <EvidenceListItem fileHash={fileHash} key={fileHash} timestamp={Number(event.args.timestamp)} />;
      })}
    </div>
  );
};

const EvidenceListItem = ({ fileHash, timestamp }: { fileHash: string; timestamp: number }) => {
  const { data: proof, isLoading } = useScaffoldReadContract({
    contractName: "EvidenceVault",
    functionName: "getProof",
    args: [fileHash as `0x${string}`],
  });

  if (isLoading || !proof) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-sm p-6 flex flex-col gap-4 animate-pulse">
        <div className="h-4 bg-base-300 rounded w-3/4"></div>
        <div className="h-4 bg-base-300 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <EvidenceCard
      proof={{
        id: fileHash,
        fileHash,
        timestamp,
        storageId: proof.arweaveTxId,
        ipfsCid: proof.ipfsCid && proof.ipfsCid.length > 0 ? proof.ipfsCid : undefined,
      }}
    />
  );
};
