import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
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
      await createProof({
        functionName: "createProof",
        args: [fileHash as `0x${string}`, commitment as `0x${string}`, arweaveTxId, ipfsCid],
      });

      queryClient.invalidateQueries({ queryKey: ["eventHistory"] });
      queryClient.invalidateQueries({ queryKey: ["indexedProofs"] });

      notification.success("Evidence secured successfully!");

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
