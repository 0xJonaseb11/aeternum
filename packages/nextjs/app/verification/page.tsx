"use client";

import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { KeyIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { ProofListSkeleton } from "~~/components/ui/Skeleton";
import { EvidenceList } from "~~/components/vault/EvidenceList";
import deployedContracts from "~~/contracts/deployedContracts";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

const VerificationPage: NextPage = () => {
  const { address: connectedAddress, isConnecting, chain } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const isWrongNetwork = chain && chain.id !== targetNetwork.id;
  const hasVaultContract = Boolean(
    deployedContracts[targetNetwork.id as keyof typeof deployedContracts]?.EvidenceVault,
  );

  return (
    <div className="flex flex-col grow w-full min-w-0">
      <section className="bg-pattern pt-12 pb-10 sm:pt-16 sm:pb-14 border-b border-base-300 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[100vw]">
          <div className="max-w-3xl mx-auto text-center min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4 border border-primary/20">
              <ShieldCheckIcon className="h-4 w-4 shrink-0" />
              <span>Verify & Recover</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-base-content mb-3 sm:mb-4">
              Verification and Restoration of your evidences
            </h1>
            <p className="text-sm sm:text-base text-base-content/70 flex items-center justify-center gap-2 flex-wrap">
              <KeyIcon className="h-4 w-4 shrink-0 text-base-content/50" />
              <span>
                Use your secret key to verify ownership on-chain or recover your file. Your secret never leaves this
                device.
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14 md:py-18 bg-base-100 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl w-full min-w-0">
          {connectedAddress && (
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
              <p className="text-xs sm:text-sm text-base-content/60">
                Select an evidence below, then enter your secret key to verify or recover.
              </p>
              <div className="flex items-center gap-3 sm:gap-4 bg-base-200/80 px-3 sm:px-4 py-2 rounded-xl border border-base-300 w-full sm:w-auto min-w-0 overflow-hidden">
                <div className="flex flex-col min-w-0 w-full sm:w-auto">
                  <span className="text-[10px] uppercase font-bold text-base-content/40">Connected Wallet</span>
                  <Address
                    address={connectedAddress}
                    chain={targetNetwork}
                    blockExplorerAddressLink={
                      targetNetwork.id === hardhat.id ? `/blockexplorer/address/${connectedAddress}` : undefined
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {!connectedAddress ? (
            <div className="rounded-2xl border-2 border-dashed border-base-300 bg-base-200/30 p-8 sm:p-12 text-center min-w-0">
              <p className="font-medium text-base-content/70 mb-1">Connect your wallet</p>
              <p className="text-sm text-base-content/50">
                Connect the same wallet you used when securing your evidence to verify ownership or recover your files.
              </p>
            </div>
          ) : isWrongNetwork ? (
            <div className="rounded-2xl border border-warning/50 bg-warning/10 p-6 sm:p-8 text-center min-w-0">
              <p className="font-bold text-warning mb-1 text-sm sm:text-base">Wrong network</p>
              <p className="text-base-content/70 text-xs sm:text-sm">
                Switch to {targetNetwork.name} to verify or recover evidence.
              </p>
            </div>
          ) : !hasVaultContract ? (
            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 sm:p-8 text-center min-w-0">
              <p className="font-bold text-base-content mb-1 text-sm sm:text-base">Vault not available</p>
              <p className="text-base-content/60 text-xs sm:text-sm">Evidence Vault is not deployed on this network.</p>
            </div>
          ) : isConnecting ? (
            <ProofListSkeleton count={3} />
          ) : (
            <EvidenceList showSecretFinder />
          )}
        </div>
      </section>
    </div>
  );
};

export default VerificationPage;
