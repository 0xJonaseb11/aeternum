import { useEffect, useState } from "react";
import { useAccount, useBlockNumber } from "wagmi";
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
import { useScaffoldEventHistory, useScaffoldReadContract, useSelectedNetwork } from "~~/hooks/scaffold-eth";
import { useIndexedProofs } from "~~/hooks/vault/useIndexedProofs";
import { useRecover } from "~~/hooks/vault/useRecover";
import { useSupabaseProofs } from "~~/hooks/vault/useSupabaseProofs";
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
    <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden min-w-0">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
            <ShieldCheckIcon className="h-3 w-3" />
            <span>Verified On-chain</span>
          </div>
          <p className="text-[10px] text-base-content/40 font-mono font-medium">#{proof.fileHash.slice(2, 10)}</p>
        </div>

        <h4 className="font-bold text-base-content truncate mb-1 text-sm sm:text-base min-w-0" title={proof.fileHash}>
          {proof.fileHash.slice(0, 20)}...
        </h4>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-base-content/50 mt-3 sm:mt-4">
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
          <div className="mt-4 sm:mt-6 pt-4 border-t border-base-300 animate-in fade-in slide-in-from-top duration-200 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase text-base-content/40">Enter Secret Key</span>
              <button onClick={() => setShowRecover(false)} className="btn btn-ghost btn-xs btn-circle shrink-0">
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
            <div className="join w-full flex flex-col sm:flex-row gap-2 sm:gap-0">
              <input
                type="password"
                placeholder="0x..."
                className="input input-bordered input-sm join-item flex-1 min-w-0 text-xs font-mono w-full sm:w-auto"
                value={secret}
                onChange={e => setSecret(e.target.value)}
              />
              <button
                onClick={handleRecover}
                disabled={isRecovering}
                className={`btn btn-primary btn-sm join-item px-4 w-full sm:w-auto ${isRecovering ? "loading" : ""}`}
              >
                {isRecovering ? "" : "Go"}
              </button>
            </div>
          </div>
        ) : showVerify ? (
          <div className="mt-4 sm:mt-6 pt-4 border-t border-base-300 animate-in fade-in slide-in-from-top duration-200 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase text-base-content/40">Verify ownership (ZK)</span>
              <button onClick={() => setShowVerify(false)} className="btn btn-ghost btn-xs btn-circle shrink-0">
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
            <p className="text-[10px] text-base-content/50 mb-2">
              Enter your secret to generate a zero-knowledge proof. Your secret never leaves this device.
            </p>
            <div className="join w-full mb-2 flex flex-col sm:flex-row gap-2 sm:gap-0">
              <input
                type="password"
                placeholder="0x... or hex secret"
                className="input input-bordered input-sm join-item flex-1 min-w-0 text-xs font-mono w-full sm:w-auto"
                value={verifySecret}
                onChange={e => {
                  setVerifySecret(e.target.value);
                  setVerifyResult(null);
                }}
              />
              <button
                onClick={handleVerifyOwnership}
                disabled={isVerifying}
                className={`btn btn-primary btn-sm join-item px-4 w-full sm:w-auto ${isVerifying ? "loading" : ""}`}
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
          <div className="mt-4 sm:mt-6 pt-4 border-t border-base-300 flex flex-wrap items-center justify-center sm:justify-between gap-2">
            <button
              onClick={() => setShowRecover(true)}
              className="btn btn-ghost btn-sm flex-1 min-w-[80px] gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <ArrowDownTrayIcon className="h-3.5 w-3.5 shrink-0" />
              <span>Recover</span>
            </button>
            <div className="w-px h-4 bg-base-300 shrink-0 hidden sm:block" />
            <button
              onClick={() => zkAvailable && setShowVerify(true)}
              disabled={!zkAvailable}
              title={
                zkAvailable
                  ? "Prove ownership with zero-knowledge (no secret on-chain)"
                  : "ZK artifacts not loaded. Run zk:setup in hardhat and copy to public/zk/"
              }
              className="btn btn-ghost btn-sm flex-1 min-w-[80px] gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-colors disabled:opacity-50"
            >
              <FingerPrintIcon className="h-3.5 w-3.5 shrink-0" />
              <span>Verify</span>
            </button>
            <div className="w-px h-4 bg-base-300 shrink-0 hidden sm:block" />
            <button
              onClick={handleDetails}
              className="btn btn-ghost btn-sm flex-1 min-w-[80px] gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-secondary/5 hover:text-secondary-content transition-colors"
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

const RECENT_BLOCKS = 10_000; // ~2 days on Base Sepolia; keeps RPC requests bounded
const LOAD_TIMEOUT_MS = 18_000; // Stop showing skeleton after 18s; show error + Retry

const INDEXER_URL = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_INDEXER_URL : undefined;

export const EvidenceList = () => {
  const { address: connectedAddress } = useAccount();
  const selectedNetwork = useSelectedNetwork();
  const { data: blockNumber } = useBlockNumber({ chainId: selectedNetwork.id });
  const fromBlock = blockNumber != null ? BigInt(blockNumber) - BigInt(RECENT_BLOCKS) : undefined;
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  const {
    data: indexedProofs,
    isLoading: indexedLoading,
    isError: indexedError,
    refetch: refetchIndexed,
  } = useIndexedProofs(connectedAddress, selectedNetwork.id, INDEXER_URL);

  const supabaseEnabled = !INDEXER_URL;
  const {
    data: supabaseProofs,
    isLoading: supabaseLoading,
    isError: supabaseError,
    refetch: refetchSupabase,
  } = useSupabaseProofs(connectedAddress, selectedNetwork.id, supabaseEnabled);

  const useEventHistory = !INDEXER_URL ? supabaseError : indexedError;
  const {
    data: events,
    isLoading: eventsLoading,
    isFetchingNextPage,
    error: eventsError,
    refetch: refetchEvents,
  } = useScaffoldEventHistory({
    contractName: "EvidenceVault",
    eventName: "ProofCreated",
    filters: { owner: connectedAddress },
    fromBlock,
    blocksBatchSize: 200,
    enabled: !!connectedAddress && blockNumber != null && (useEventHistory || supabaseEnabled),
  });

  const useIndexerData = INDEXER_URL && !indexedError && indexedProofs != null;
  const useSupabaseData = supabaseEnabled && !supabaseError && supabaseProofs != null;
  const stillLoading =
    useIndexerData || useSupabaseData
      ? false
      : INDEXER_URL
        ? indexedLoading
        : supabaseLoading ||
          (supabaseError && (eventsLoading || isFetchingNextPage)) ||
          (!supabaseError && !supabaseProofs && (eventsLoading || isFetchingNextPage));

  const hasData = useIndexerData
    ? indexedProofs.length > 0
    : useSupabaseData
      ? supabaseProofs.length > 0
      : events != null && events.length > 0;

  // After timeout, stop showing skeleton and show error + Retry so UI never sticks
  useEffect(() => {
    if (!connectedAddress || !stillLoading || hasData) {
      setLoadTimedOut(false);
      return;
    }
    const t = setTimeout(() => setLoadTimedOut(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [connectedAddress, stillLoading, hasData]);

  if (!connectedAddress) {
    return (
      <div className="text-center py-12 bg-base-200/30 rounded-2xl border border-dashed border-base-300">
        <p className="text-base-content/40 font-medium">Connect your wallet to view archive evidence.</p>
      </div>
    );
  }

  if (stillLoading && !hasData && !loadTimedOut) {
    return <ProofListSkeleton count={3} />;
  }

  const refetch = () => {
    setLoadTimedOut(false);
    if (INDEXER_URL && !indexedError) refetchIndexed();
    else if (supabaseEnabled && !supabaseError) refetchSupabase();
    else refetchEvents();
  };

  if ((useEventHistory && eventsError != null) || loadTimedOut) {
    return (
      <div className="text-center py-12 bg-base-200/30 rounded-2xl border border-dashed border-base-300">
        <p className="text-base-content/60 font-medium mb-2">Could not load evidence proofs.</p>
        <p className="text-sm text-base-content/40 mb-4">
          {loadTimedOut ? "The request took too long. You can try again." : "The chain may be busy. You can try again."}
        </p>
        <button onClick={refetch} className="btn btn-primary btn-sm">
          Retry
        </button>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="text-center py-12 bg-base-200/30 rounded-2xl border border-dashed border-base-300">
        <p className="text-base-content/40 font-medium">No archive evidence found for this wallet.</p>
        <p className="text-xs text-base-content/40 mt-2">
          {useIndexerData ? "Indexed proofs for this chain." : "Showing last ~2 days on Base Sepolia."}
        </p>
        <button onClick={refetch} className="btn btn-ghost btn-sm mt-4">
          Refresh
        </button>
      </div>
    );
  }

  if (useIndexerData && indexedProofs) {
    const activeProofs = indexedProofs.filter(p => !p.revoked);
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-w-0">
        {activeProofs.map(p => (
          <EvidenceCard
            key={p.id}
            proof={{
              id: p.fileHash,
              fileHash: p.fileHash,
              timestamp: p.timestamp,
              storageId: p.arweaveTxId,
              ipfsCid: p.ipfsCid ?? undefined,
            }}
          />
        ))}
      </div>
    );
  }

  if (useSupabaseData && supabaseProofs) {
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-w-0">
        {supabaseProofs.map(p => (
          <EvidenceCard
            key={p.id}
            proof={{
              id: p.fileHash,
              fileHash: p.fileHash,
              timestamp: p.timestamp,
              storageId: p.arweaveTxId,
              ipfsCid: p.ipfsCid ?? undefined,
            }}
          />
        ))}
      </div>
    );
  }

  const sortedEvents = [...(events ?? [])].sort((a, b) => Number(b.args.timestamp) - Number(a.args.timestamp));

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-w-0">
      {sortedEvents.map(event => {
        const fileHash = event.args.fileHash as string;
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
