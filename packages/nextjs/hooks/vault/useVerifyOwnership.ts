"use client";

import { useState } from "react";
import { usePublicClient } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { generateZKProofBundle } from "~~/utils/vault/zkProof";

type VerifyResult = { verified: boolean; error?: string };

/**
 * Hook to verify ownership of a proof via ZK (view call).
 * Returns verify(fileHash, secret) that generates a Groth16 proof and calls vault.verifyOwnership.
 */
export function useVerifyOwnership() {
  const [isVerifying, setIsVerifying] = useState(false);
  const { data: vaultContract } = useDeployedContractInfo({ contractName: "EvidenceVault" });
  const publicClient = usePublicClient();

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

      return { verified: result === true };
    } catch (e) {
      console.error("Verify ownership error:", e);
      const message = e instanceof Error ? e.message : "Verification failed.";
      return { verified: false, error: message };
    } finally {
      setIsVerifying(false);
    }
  };

  return { verify, isVerifying };
}
