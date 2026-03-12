import { useCallback, useEffect, useState } from "react";
import { useAccount, useBlockNumber } from "wagmi";
import { usePublicClient } from "wagmi";
import {
  ArrowDownTrayIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  DocumentMagnifyingGlassIcon,
  FingerPrintIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ProofListSkeleton } from "~~/components/ui/Skeleton";
import {
  useDeployedContractInfo,
  useScaffoldEventHistory,
  useScaffoldReadContract,
  useSelectedNetwork,
} from "~~/hooks/scaffold-eth";
import { useEvidenceEvents } from "~~/hooks/useEvidenceEvents";
import { useIndexedProofs } from "~~/hooks/vault/useIndexedProofs";
import { useRecover } from "~~/hooks/vault/useRecover";
import { useSupabaseProofs } from "~~/hooks/vault/useSupabaseProofs";
import { useVerifyOwnership } from "~~/hooks/vault/useVerifyOwnership";
import { notification } from "~~/utils/scaffold-eth";
import { createCertificatePdf } from "~~/utils/vault/certificatePdf";
import { computeCommitment } from "~~/utils/vault/crypto";
import { isZKArtifactsAvailable } from "~~/utils/vault/zkProof";
import { useEvidenceMetadata } from "~~/hooks/useEvidenceMetadata";

interface EvidenceItem {
  id: string;
  fileHash: string;
  timestamp: number;
  storageId: string;
  ipfsCid?: string;
}

function normalizeHex(h: string | bigint): string {
  const s =
    typeof h === "string"
      ? h
      : typeof h === "bigint"
        ? h.toString(16)
        : (h as unknown as { toString: (radix: number) => string }).toString(16);
  const clean = s.startsWith("0x") ? s.slice(2) : s;
  return ("0x" + clean.toLowerCase().padStart(64, "0")).slice(0, 66);
}

function sliceHashDisplay(hex: string, start = 8, end = 6): string {
  if (!hex || hex.length < start + end) return hex;
  const s = hex.startsWith("0x") ? hex.slice(2) : hex;
  return `0x${s.slice(0, start)}...${s.slice(-end)}`;
}

export const EvidenceCard = ({
  proof,
  initialSecret,
  isMatching,
}: {
  proof: EvidenceItem;
  initialSecret?: string;
  isMatching?: boolean;
}) => {
  const [showRecover, setShowRecover] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [secret, setSecret] = useState(initialSecret ?? "");
  const [verifySecret, setVerifySecret] = useState(initialSecret ?? "");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [zkAvailable, setZkAvailable] = useState(false);
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const { recoverFile, isRecovering } = useRecover();
  const { verify, isVerifying } = useVerifyOwnership();
  const { metadata, isLoading: metaLoading, save, isSaving } = useEvidenceMetadata(proof.fileHash);
  const { data: events } = useEvidenceEvents(proof.fileHash);

  useEffect(() => {
    if (initialSecret != null && initialSecret !== "") {
      setSecret(initialSecret);
      setVerifySecret(initialSecret);
    }
  }, [initialSecret]);

  useEffect(() => {
    isZKArtifactsAvailable().then(setZkAvailable);
  }, []);

  useEffect(() => {
    if (!metadata) return;
    setDraftTitle(metadata.title ?? "");
    setDraftDescription(metadata.description ?? "");
  }, [metadata]);

  const handleRecover = async () => {
    if (!secret) {
      notification.error("Please enter your secret key");
      return;
    }
    await recoverFile(proof.storageId, secret, `aeternum_recovered_${proof.fileHash.slice(2, 10)}`, proof.ipfsCid);
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
    <div
      className={`card bg-base-100 border shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden min-w-0 ${isMatching ? "border-primary ring-2 ring-primary/30" : "border-base-300"}`}
    >
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
              <ShieldCheckIcon className="h-3 w-3" />
              <span>Verified On-chain</span>
            </div>
            {isMatching && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/15 text-success text-[10px] font-bold uppercase tracking-wider border border-success/30">
                <KeyIcon className="h-3 w-3" />
                <span>Matches key</span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-base-content/40 font-mono font-medium">#{proof.fileHash.slice(2, 10)}</p>
        </div>

        <div className="mb-2 min-w-0">
          {isEditingMeta ? (
            <div className="space-y-1">
              <input
                type="text"
                className="input input-xs input-bordered w-full text-xs"
                placeholder="Title (optional)"
                value={draftTitle}
                onChange={e => setDraftTitle(e.target.value)}
              />
              <textarea
                className="textarea textarea-xs textarea-bordered w-full text-xs"
                placeholder="Description (optional)"
                rows={2}
                value={draftDescription}
                onChange={e => setDraftDescription(e.target.value)}
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    if (metadata) {
                      setDraftTitle(metadata.title ?? "");
                      setDraftDescription(metadata.description ?? "");
                    }
                    setIsEditingMeta(false);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn btn-primary btn-xs ${isSaving ? "loading" : ""}`}
                  onClick={async () => {
                    try {
                      await save({ title: draftTitle || undefined, description: draftDescription || undefined });
                      setIsEditingMeta(false);
                      notification.success("Details saved.");
                    } catch (e) {
                      console.error(e);
                      notification.error("Could not save details.");
                    }
                  }}
                  disabled={isSaving}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <h4
                  className="font-bold text-base-content text-sm sm:text-base truncate"
                  title={metadata?.title || "Evidence"}
                >
                  {metaLoading ? "Loading…" : metadata?.title || "Untitled evidence"}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingMeta(true)}
                  className="btn btn-ghost btn-[10px] btn-circle text-base-content/40 hover:text-primary hover:bg-primary/5"
                  aria-label="Edit details"
                >
                  •••
                </button>
              </div>
              {metadata?.description && (
                <p className="text-[10px] text-base-content/60 line-clamp-2">{metadata.description}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-1 min-w-0">
          <p
            className="font-mono text-[10px] text-base-content/70 truncate"
            title={`Proof ID (file hash): ${proof.fileHash}. Click copy to copy full value.`}
          >
            {sliceHashDisplay(proof.fileHash)}
          </p>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(proof.fileHash);
                notification.success("Proof ID copied");
              } catch {
                notification.error("Could not copy");
              }
            }}
            className="btn btn-ghost btn-xs btn-square shrink-0 text-base-content/50 hover:text-primary hover:bg-primary/5"
            aria-label="Copy proof ID"
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
          </button>
        </div>

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
              <span className="text-[10px] font-bold uppercase text-base-content/40">Enter secret key</span>
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
                {isVerifying ? "" : "Verify"}
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
          <>
            <div className="mt-4 sm:mt-5 pt-4 border-t border-base-300 flex flex-wrap items-center justify-center sm:justify-between gap-0 min-w-0 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              <button
                type="button"
                onClick={() => setShowRecover(true)}
                className="btn btn-ghost btn-sm min-h-0 h-auto py-1 gap-1.5 text-base-content hover:bg-transparent hover:text-primary"
              >
                <ArrowDownTrayIcon className="h-3.5 w-3.5 shrink-0" />
                <span>Recover</span>
              </button>
              <span className="text-base-content/40 px-1">|</span>
              <button
                type="button"
                onClick={() => zkAvailable && setShowVerify(true)}
                disabled={!zkAvailable}
                title={
                  zkAvailable
                    ? "Prove ownership with zero-knowledge (no secret on-chain)"
                    : "ZK proof not available right now."
                }
                className="btn btn-ghost btn-sm min-h-0 h-auto py-1 gap-1.5 text-base-content hover:bg-transparent hover:text-primary disabled:opacity-50"
              >
                <FingerPrintIcon className="h-3.5 w-3.5 shrink-0" />
                <span>Verify</span>
              </button>
              <span className="text-base-content/40 px-1">|</span>
              <button
                type="button"
                onClick={async () => {
                  handleDetails();
                  try {
                    void fetch("/api/events", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        fileHash: proof.fileHash,
                        eventType: "certificate_downloaded",
                      }),
                    });
                  } catch {
                    // non-fatal
                  }
                }}
                className="btn btn-ghost btn-sm min-h-0 h-auto py-1 gap-1.5 text-base-content hover:bg-transparent hover:text-secondary-content"
              >
                <DocumentMagnifyingGlassIcon className="h-3.5 w-3.5 shrink-0" />
                <span>Certificate</span>
              </button>
            </div>

            {events && events.length > 0 && (
              <div className="mt-3 border-t border-base-200 pt-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-base-content/40 mb-1">Activity</p>
                <ul className="space-y-0.5">
                  {events.slice(0, 3).map(ev => (
                    <li key={ev.id} className="text-[10px] text-base-content/60 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-base-content/30" />
                      <span>
                        {ev.event_type === "created"
                          ? "Evidence created"
                          : ev.event_type === "verified"
                            ? "Ownership verified"
                            : ev.event_type === "certificate_downloaded"
                              ? "Certificate downloaded"
                              : ev.event_type}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const RECENT_BLOCKS = 10_000; // ~2 days on Base Sepolia; keeps RPC requests bounded
const LOAD_TIMEOUT_MS = 18_000; // Stop showing skeleton after 18s; show error + Retry

const INDEXER_URL = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_INDEXER_URL : undefined;

const SecretFinderSection = ({
  onFind,
  isFinding,
  pastedSecret,
  setPastedSecret,
  matchingCount,
  fileHashes,
}: {
  onFind: (fileHashes: string[]) => void;
  isFinding: boolean;
  pastedSecret: string;
  setPastedSecret: (s: string) => void;
  matchingCount: number;
  fileHashes: string[];
}) => (
  <div className="mb-6 sm:mb-8 p-4 sm:p-5 rounded-2xl border border-base-300 bg-base-200/50">
    <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50 mb-2">
      Find evidence by secret key
    </p>
    <p className="text-xs sm:text-sm text-base-content/70 mb-3">
      You hold the key. Paste it below to find matching evidence, then verify or recover.
    </p>
    <div className="join w-full flex flex-col sm:flex-row gap-2 sm:gap-0 max-w-xl">
      <input
        type="password"
        placeholder="0x... or hex secret"
        className="input input-bordered join-item flex-1 min-w-0 text-xs font-mono w-full sm:w-auto"
        value={pastedSecret}
        onChange={e => setPastedSecret(e.target.value)}
      />
      <button
        type="button"
        onClick={() => onFind(fileHashes)}
        disabled={isFinding || !pastedSecret.trim() || fileHashes.length === 0}
        className={`btn btn-primary join-item px-4 w-full sm:w-auto ${isFinding ? "loading" : ""}`}
      >
        {isFinding ? (
          ""
        ) : (
          <>
            <MagnifyingGlassIcon className="h-4 w-4" />
            Find my evidence
          </>
        )}
      </button>
    </div>
    {matchingCount > 0 && (
      <p className="text-xs text-success mt-2 font-medium">
        {matchingCount} evidence{matchingCount !== 1 ? "s" : ""} match this secret.
      </p>
    )}
  </div>
);

export const EvidenceList = ({ showSecretFinder = false }: { showSecretFinder?: boolean } = {}) => {
  const { address: connectedAddress } = useAccount();
  const selectedNetwork = useSelectedNetwork();
  const { data: blockNumber } = useBlockNumber({ chainId: selectedNetwork.id });
  const fromBlock = blockNumber != null ? BigInt(blockNumber) - BigInt(RECENT_BLOCKS) : undefined;
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [pastedSecret, setPastedSecret] = useState("");
  const [matchingFileHashes, setMatchingFileHashes] = useState<Set<string>>(new Set());
  const [isFinding, setIsFinding] = useState(false);
  const { data: vaultContract } = useDeployedContractInfo({ contractName: "EvidenceVault" });
  const publicClient = usePublicClient({ chainId: selectedNetwork?.id });

  const {
    data: indexedProofs,
    isLoading: indexedLoading,
    isError: indexedError,
    refetch: refetchIndexed,
  } = useIndexedProofs(connectedAddress as `0x${string}` | undefined, selectedNetwork.id, INDEXER_URL);

  const {
    data: supabaseProofs,
    isLoading: supabaseLoading,
    isError: supabaseError,
    refetch: refetchSupabase,
  } = useSupabaseProofs(connectedAddress as `0x${string}` | undefined, selectedNetwork.id, !!connectedAddress);

  const needEventHistory = !INDEXER_URL || indexedError || (indexedProofs != null && indexedProofs.length === 0);
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
    enabled: !!connectedAddress && blockNumber != null && needEventHistory,
  });

  const handleFindBySecret = useCallback(
    async (fileHashes: string[]) => {
      if (!pastedSecret.trim()) return;
      setIsFinding(true);
      setMatchingFileHashes(new Set());
      try {
        if (!vaultContract?.address || !publicClient || !connectedAddress) {
          notification.error("Contract or wallet not ready.");
          return;
        }

        const secretHex = pastedSecret.trim().startsWith("0x") ? pastedSecret.trim() : `0x${pastedSecret.trim()}`;
        const matching: string[] = [];

        for (const fh of fileHashes) {
          try {
            const proof = (await publicClient.readContract({
              address: vaultContract.address,
              abi: vaultContract.abi,
              functionName: "getProof",
              args: [fh as `0x${string}`],
              account: connectedAddress,
            })) as { commitment: string };

            const onChainCommitment = proof.commitment;
            const expected = await computeCommitment(fh, secretHex);
            if (normalizeHex(onChainCommitment) === normalizeHex(expected)) matching.push(fh);
          } catch {
            continue;
          }
        }

        setMatchingFileHashes(new Set(matching));
        if (matching.length > 0) {
          notification.success(`Found ${matching.length} evidence for this secret.`);
        } else {
          notification.warning("No evidence on this vault matches this secret.");
        }
      } catch (e) {
        console.error(e);
        notification.error("Could not check evidence.");
      } finally {
        setIsFinding(false);
      }
    },
    [vaultContract, publicClient, pastedSecret, connectedAddress],
  );

  const hasIndexerData = INDEXER_URL && !indexedError && indexedProofs != null && indexedProofs.length > 0;
  const hasSupabaseData = !supabaseError && supabaseProofs != null && supabaseProofs.length > 0;
  const hasEventData = events != null && events.length > 0;

  const useIndexerData = hasIndexerData;
  const useSupabaseData = hasSupabaseData && !hasIndexerData;

  const stillLoading =
    hasIndexerData || hasSupabaseData || hasEventData
      ? false
      : INDEXER_URL
        ? indexedLoading
        : supabaseLoading ||
        (indexedError && supabaseError && (eventsLoading || isFetchingNextPage)) ||
        (indexedProofs != null &&
          indexedProofs.length === 0 &&
          (supabaseLoading || (supabaseError && (eventsLoading || isFetchingNextPage))));

  const hasData = hasIndexerData || hasSupabaseData || hasEventData;

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
    refetchIndexed();
    refetchSupabase();
    refetchEvents();
  };

  if ((needEventHistory && eventsError != null) || loadTimedOut) {
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
    const fileHashes = activeProofs.map(p => p.fileHash);
    return (
      <>
        {showSecretFinder && (
          <SecretFinderSection
            fileHashes={fileHashes}
            onFind={handleFindBySecret}
            isFinding={isFinding}
            pastedSecret={pastedSecret}
            setPastedSecret={setPastedSecret}
            matchingCount={matchingFileHashes.size}
          />
        )}
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
              initialSecret={matchingFileHashes.has(p.fileHash) ? pastedSecret : undefined}
              isMatching={matchingFileHashes.has(p.fileHash)}
            />
          ))}
        </div>
      </>
    );
  }

  if (useSupabaseData && supabaseProofs) {
    const fileHashes = supabaseProofs.map(p => p.fileHash);
    return (
      <>
        {showSecretFinder && (
          <SecretFinderSection
            fileHashes={fileHashes}
            onFind={handleFindBySecret}
            isFinding={isFinding}
            pastedSecret={pastedSecret}
            setPastedSecret={setPastedSecret}
            matchingCount={matchingFileHashes.size}
          />
        )}
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
              initialSecret={matchingFileHashes.has(p.fileHash) ? pastedSecret : undefined}
              isMatching={matchingFileHashes.has(p.fileHash)}
            />
          ))}
        </div>
      </>
    );
  }

  const sortedEvents = [...(events ?? [])].sort((a, b) => Number(b.args.timestamp) - Number(a.args.timestamp));
  const fileHashes = sortedEvents.map(e => e.args.fileHash as string);

  return (
    <>
      {showSecretFinder && (
        <SecretFinderSection
          fileHashes={fileHashes}
          onFind={handleFindBySecret}
          isFinding={isFinding}
          pastedSecret={pastedSecret}
          setPastedSecret={setPastedSecret}
          matchingCount={matchingFileHashes.size}
        />
      )}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-w-0">
        {sortedEvents.map(event => {
          const fileHash = event.args.fileHash as string;
          return (
            <EvidenceListItem
              fileHash={fileHash}
              key={fileHash}
              timestamp={Number(event.args.timestamp)}
              initialSecret={matchingFileHashes.has(fileHash) ? pastedSecret : undefined}
              isMatching={matchingFileHashes.has(fileHash)}
            />
          );
        })}
      </div>
    </>
  );
};

const EvidenceListItem = ({
  fileHash,
  timestamp,
  initialSecret,
  isMatching,
}: {
  fileHash: string;
  timestamp: number;
  initialSecret?: string;
  isMatching?: boolean;
}) => {
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
      initialSecret={initialSecret}
      isMatching={isMatching}
    />
  );
};
