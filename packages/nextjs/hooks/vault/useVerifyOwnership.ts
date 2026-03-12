"use client";

import { useState } from "react";
import { usePublicClient } from "wagmi";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { getParsedError } from "~~/utils/scaffold-eth/getParsedError";
import { generateZKProofBundle } from "~~/utils/vault/zkProof";

type VerifyResult = { verified: boolean; error?: string };

export function useVerifyOwnership() {
  const [isVerifying, setIsVerifying] = useState(false);
  const { data: vaultContract } = useDeployedContractInfo({ contractName: "EvidenceVault" });
  const publicClient = usePublicClient();
  const { user } = useSupabaseAuth();

  const verify = async (fileHash: string, secret: string): Promise<VerifyResult> => {
    if (!vaultContract?.address || !publicClient) {
      return { verified: false, error: "Contract or network not ready." };
    }

    setIsVerifying(true);
    try {
      const { zkProof, publicInputs } = await generateZKProofBundle(fileHash, secret);

      const result = await publicClient.readContract({
        address: vaultContract.address,
        abi: vaultContract.abi,
        functionName: "verifyOwnership",
        args: [fileHash as `0x${string}`, zkProof, publicInputs],
      });

      const verified = result === true;

      if (verified) {
        try {
          void fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user?.id,
              fileHash,
              eventType: "verified",
              data: { publicInputs },
            }),
          });
        } catch {
          // non-fatal
        }
      }

      return { verified };
    } catch (e) {
      console.error("Verify ownership error:", e);
      const message = getParsedError(e);
      return { verified: false, error: message || "Verification failed." };
    } finally {
      setIsVerifying(false);
    }
  };

  return { verify, isVerifying };
}
