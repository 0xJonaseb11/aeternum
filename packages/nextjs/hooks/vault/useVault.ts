import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";
import { useScaffoldWriteContract, useSelectedNetwork } from "~~/hooks/scaffold-eth";
import { getParsedError } from "~~/utils/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { computeCommitment, computeHash, encryptFile, generateSecret } from "~~/utils/vault/crypto";
import { uploadToArweave, uploadToIPFS } from "~~/utils/vault/storage";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const ARWEAVE_TX_ID_LEN = 43;

function normalizeToArweaveTxId(id: string): string {
  if (!id || id.length < ARWEAVE_TX_ID_LEN) {
    throw new Error(
      `Arweave returned an invalid transaction id (length ${id?.length ?? 0}, expected ${ARWEAVE_TX_ID_LEN}).`,
    );
  }
  if (id.length === ARWEAVE_TX_ID_LEN) return id;
  return id.slice(0, ARWEAVE_TX_ID_LEN);
}

export type VaultStep = "idle" | "encrypting" | "uploading_arweave" | "uploading_ipfs" | "confirming";

export const useVault = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<VaultStep>("idle");
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const selectedNetwork = useSelectedNetwork();
  const publicClient = usePublicClient({ chainId: selectedNetwork?.id });
  const { user } = useSupabaseAuth();

  const { writeContractAsync: createProof } = useScaffoldWriteContract({
    contractName: "EvidenceVault",
  });

  const uploadEvidence = async (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      notification.error(`File too large. Maximum size is 50 MB.`);
      return;
    }
    setIsProcessing(true);
    setStep("encrypting");

    try {
      const arrayBuffer = await file.arrayBuffer();

      const secret = generateSecret();
      const encryptedData = await encryptFile(arrayBuffer, secret);

      const fileHash = await computeHash(arrayBuffer);
      const commitment = await computeCommitment(fileHash, secret);

      setStep("uploading_arweave");
      const rawArweaveId = await uploadToArweave(encryptedData);
      const arweaveTxId = normalizeToArweaveTxId(rawArweaveId);

      setStep("uploading_ipfs");
      const ipfsCid = await uploadToIPFS(encryptedData);
      if (!ipfsCid || ipfsCid.length === 0 || ipfsCid.length > 128) {
        throw new Error("IPFS returned an invalid CID.");
      }

      setStep("confirming");
      const txResult = await createProof({
        functionName: "createProof",
        args: [fileHash as `0x${string}`, commitment as `0x${string}`, arweaveTxId, ipfsCid],
      });

      queryClient.invalidateQueries({ queryKey: ["eventHistory"] });
      queryClient.invalidateQueries({ queryKey: ["indexedProofs"] });
      queryClient.invalidateQueries({ queryKey: ["supabaseProofs"] });

      let proofTimestamp = Math.floor(Date.now() / 1000);
      let blockNumber = 0;
      const txHash = txResult != null && typeof txResult === "string" ? (txResult as `0x${string}`) : undefined;
      if (address && selectedNetwork?.id && publicClient && txHash) {
        try {
          const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
          blockNumber = Number(receipt.blockNumber);
          const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });
          proofTimestamp = Number(block.timestamp);
        } catch (e) {
          console.warn("Could not get tx receipt for Supabase metadata:", e);
        }
        try {
          const res = await fetch("/api/proofs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              owner: address,
              userId: user?.id,
              fileHash,
              timestamp: proofTimestamp,
              blockNumber,
              arweaveTxId,
              ipfsCid,
              chainId: selectedNetwork.id,
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error("Supabase proof metadata save failed:", res.status, err);
            notification.warning("Proof saved on-chain; metadata mirror failed. List may still work from chain.");
          }
        } catch (e) {
          console.error("Supabase proof metadata request failed:", e);
          notification.warning("Proof saved on-chain; metadata mirror failed. List may still work from chain.");
        }
      }

      notification.success("Evidence secured successfully!");

      // Fire-and-forget event log (ignore failures)
      try {
        void fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileHash,
            eventType: "created",
            data: {
              arweaveTxId,
              ipfsCid,
              chainId: selectedNetwork?.id,
              blockNumber,
              timestamp: proofTimestamp,
            },
          }),
        });
      } catch {
        // non-fatal
      }

      return {
        fileHash,
        secret,
        arweaveTxId,
        ipfsCid,
      };
    } catch (e) {
      console.error("Vault Error:", e);
      const message = getParsedError(e);
      notification.error(message && message.length < 120 ? message : "Failed to secure evidence.");
      throw e;
    } finally {
      setIsProcessing(false);
      setStep("idle");
    }
  };

  return {
    uploadEvidence,
    isProcessing,
    step,
  };
};
