import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { computeCommitment, computeHash, encryptFile, generateSecret } from "~~/utils/vault/crypto";
import { uploadToArweave, uploadToIPFS } from "~~/utils/vault/storage";
import { notification } from "~~/utils/scaffold-eth";

export const useVault = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState<"idle" | "encrypting" | "uploading" | "confirming">("idle");

    const { writeContractAsync: createProof } = useScaffoldWriteContract({
        contractName: "EvidenceVault",
    });

    const uploadEvidence = async (file: File) => {
        setIsProcessing(true);
        setStep("encrypting");

        try {
            const arrayBuffer = await file.arrayBuffer();

            // 1. Generate Secret & Encrypt
            const secret = generateSecret();
            const encryptedData = await encryptFile(arrayBuffer, secret);

            // 2. Compute Hashes
            const fileHash = await computeHash(arrayBuffer);
            const commitment = await computeCommitment(fileHash, secret);

            setStep("uploading");

            // 3. Upload to Decentralized Storage
            const arweaveTxId = await uploadToArweave(encryptedData);
            const ipfsCid = await uploadToIPFS(encryptedData);

            setStep("confirming");

            // 4. Create On-chain Proof
            await createProof({
                functionName: "createProof",
                args: [
                    fileHash as `0x${string}`,
                    commitment as `0x${string}`,
                    arweaveTxId,
                    ipfsCid,
                ],
            });

            notification.success("Evidence secured successfully!");

            return {
                fileHash,
                secret,
                arweaveTxId,
                ipfsCid,
            };
        } catch (e) {
            console.error("Vault Error:", e);
            notification.error("Failed to secure evidence.");
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
