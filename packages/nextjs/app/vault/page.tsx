"use client";

import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { ShieldCheckIcon, UserCircleIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { AppLogo } from "~~/components/AppLogo";
import { ProofListSkeleton } from "~~/components/ui/Skeleton";
import { EvidenceList } from "~~/components/vault/EvidenceList";
import { UploadEvidence } from "~~/components/vault/UploadEvidence";
import deployedContracts from "~~/contracts/deployedContracts";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useVaultScope } from "~~/hooks/vault/useVaultScope";

const VaultPage: NextPage = () => {
  const { address: connectedAddress, isConnecting, chain } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const { scope, setScope, organizations, loadingOrgs } = useVaultScope();
  const currentOrg = scope.type === "org" ? organizations.find(o => o.id === scope.orgId) : undefined;
  const currentRoleLabel =
    currentOrg?.myRole != null ? `${currentOrg.myRole.charAt(0).toUpperCase()}${currentOrg.myRole.slice(1)}` : null;
  const isWrongNetwork = chain && chain.id !== targetNetwork.id;
  const hasVaultContract = Boolean(
    deployedContracts[targetNetwork.id as keyof typeof deployedContracts]?.EvidenceVault,
  );

  return (
    <div className="flex flex-col grow w-full min-w-0">
      <section className="relative pt-10 pb-12 lg:pt-12 lg:pb-16 overflow-hidden border-b border-base-300/50">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(var(--color-primary-rgb),0.08),transparent_70%)]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight text-base-content">
              Your encrypted <br />
              <span className="text-primary italic drop-shadow-sm">evidence workspace</span>
            </h1>

            <div className="space-y-4">
              <p className="text-lg md:text-xl text-base-content/60 max-w-2xl mx-auto font-medium leading-relaxed">
                Upload, anchor, and verify your evidence proofs. Files are encrypted locally; only you hold the keys.
              </p>
              <div className="flex justify-center mt-4">
                {scope.type === "org" && currentOrg ? (
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl glass border border-primary/20 shadow-xl shadow-primary/5 group/scope hover:scale-105 transition-all duration-300">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover/scope:bg-primary group-hover/scope:text-primary-content transition-colors">
                      <UserGroupIcon className="h-5 w-5 stroke-[2.5]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-0.5 opacity-50">
                        Team Workspace
                      </p>
                      <p className="text-sm text-base-content font-black tracking-tight">
                        {currentOrg.name}
                        {currentRoleLabel ? <span className="text-primary opacity-40 mx-1">/</span> : null}
                        <span className="opacity-70">{currentRoleLabel}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl glass border border-primary/20 shadow-xl shadow-primary/5 group/scope hover:scale-105 transition-all duration-300">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover/scope:bg-primary group-hover/scope:text-primary-content transition-colors">
                      <UserCircleIcon className="h-5 w-5 stroke-[2.5]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-0.5 opacity-50">
                        Vault Scope
                      </p>
                      <p className="text-sm text-base-content font-black tracking-tight">
                        Personal vault <span className="text-primary opacity-40 mx-1">/</span>{" "}
                        <span className="opacity-70">Secured by wallet</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14 md:py-18 bg-base-100 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl w-full min-w-0">
          <div className="flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-base-content mb-1 sm:mb-2">Vault overview</h2>
                <p className="text-sm text-base-content/60">
                  Use your connected wallet to secure new evidence and browse your existing proofs.
                </p>
              </div>
              {connectedAddress && (
                <div className="flex items-center gap-3 sm:gap-4 bg-base-100 px-3 sm:px-4 py-2 rounded-xl border border-base-300 shadow-sm w-full md:w-auto min-w-0 overflow-hidden">
                  <div className="flex flex-col min-w-0 w-full md:w-auto">
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
              )}
            </div>
            {connectedAddress && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-base-content/50 uppercase tracking-wider">Scope</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setScope({ type: "personal" })}
                    className={`btn btn-sm gap-1.5 ${
                      scope.type === "personal" ? "btn-primary" : "btn-ghost border border-base-300"
                    }`}
                  >
                    <UserCircleIcon className="h-4 w-4" />
                    Personal
                  </button>
                  {!loadingOrgs &&
                    organizations.map(org => (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => setScope({ type: "org", orgId: org.id, name: org.name })}
                        className={`btn btn-sm gap-1.5 ${
                          scope.type === "org" && scope.orgId === org.id
                            ? "btn-primary"
                            : "btn-ghost border border-base-300"
                        }`}
                      >
                        <UserGroupIcon className="h-4 w-4" />
                        {org.name}
                      </button>
                    ))}
                </div>
                {scope.type === "org" && (
                  <span className="text-xs text-base-content/50 ml-1">Uploads will be saved to this team.</span>
                )}
              </div>
            )}
          </div>

          {connectedAddress && isWrongNetwork ? (
            <div className="rounded-2xl border border-warning/50 bg-warning/10 p-6 sm:p-8 text-center min-w-0">
              <p className="font-bold text-warning mb-1 text-sm sm:text-base">Wrong network</p>
              <p className="text-base-content/70 text-xs sm:text-sm">
                Switch to {targetNetwork.name} to use the Evidence Vault.
              </p>
            </div>
          ) : connectedAddress && !hasVaultContract ? (
            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 sm:p-8 text-center min-w-0">
              <p className="font-bold text-base-content mb-1 text-sm sm:text-base">Vault not available</p>
              <p className="text-base-content/60 text-xs sm:text-sm">Evidence Vault is not deployed on this network.</p>
            </div>
          ) : isConnecting ? (
            <ProofListSkeleton count={3} />
          ) : connectedAddress ? (
            <div className="grid gap-8 sm:gap-12 min-w-0">
              <UploadEvidence scope={scope} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="h-px grow bg-base-300 min-w-0"></div>
                  <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-base-content/30 whitespace-nowrap shrink-0">
                    Recent evidence proofs
                  </h3>
                  <div className="h-px grow bg-base-300 min-w-0"></div>
                </div>
                <EvidenceList scope={scope} />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-2 border-dashed border-base-300 bg-base-100 p-8 sm:p-12 md:p-20 text-center min-w-0">
              <h3 className="text-lg sm:text-xl font-bold mb-2">Vault locked</h3>
              <p className="text-sm sm:text-base text-base-content/60 mb-0">
                Connect your wallet using the button in the header to access your encrypted evidence.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VaultPage;
