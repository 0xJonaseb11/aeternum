"use client";

import Link from "next/link";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import {
  ArrowRightIcon,
  CloudArrowUpIcon,
  FingerPrintIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { ProofListSkeleton } from "~~/components/ui/Skeleton";
import { EvidenceList } from "~~/components/vault/EvidenceList";
import { UploadEvidence } from "~~/components/vault/UploadEvidence";
import deployedContracts from "~~/contracts/deployedContracts";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress, isConnecting, chain } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const isWrongNetwork = chain && chain.id !== targetNetwork.id;
  const hasVaultContract = Boolean(
    deployedContracts[targetNetwork.id as keyof typeof deployedContracts]?.EvidenceVault,
  );

  return (
    <div className="flex flex-col grow w-full min-w-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-pattern pt-16 pb-12 sm:pt-24 sm:pb-20 md:pt-32 md:pb-28 border-b border-base-300 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-[100vw]">
          <div className="max-w-4xl mx-auto text-center min-w-0">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-secondary/10 text-secondary-content text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 sm:mb-6 border border-secondary/20 flex-wrap justify-center">
              <ShieldCheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>Zero-Knowledge Evidence Vault</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-base-content sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl mb-4 sm:mb-6 px-1">
              Security for your <span className="text-primary">Digital Truth</span>
            </h1>
            <p className="text-sm text-base-content/70 sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 px-1">
              Aeternum provides a permanent, private, and verifiable vault for your most critical files. Encrypt
              locally, store forever on Arweave, and prove ownership without ever revealing the content.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/#vault"
                className="btn btn-primary btn-sm sm:btn-md md:btn-lg px-6 sm:px-8 gap-2 group w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <span>Access your Vault</span>
                <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1 shrink-0" />
              </Link>
              {!connectedAddress && (
                <p className="text-xs sm:text-sm text-base-content/50 font-medium text-center">
                  Connect your wallet to get started
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-12 sm:py-16 md:py-20 bg-base-100 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl w-full min-w-0">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            <div className="card rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300 group min-w-0">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary text-primary-content mb-4 sm:mb-6 shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                <CloudArrowUpIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-base-content mb-2 sm:mb-3">Permanent Storage</h3>
              <p className="text-sm sm:text-base text-base-content/60 leading-relaxed mb-4">
                Your evidence is stored on Arweave, a permanent decentralized web, ensuring it&apos;s available for
                decades, not just years.
              </p>
              <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Learn more</span>
                <ArrowRightIcon className="h-4 w-4" />
              </div>
            </div>

            <div className="card rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300 group min-w-0">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-secondary text-secondary-content mb-4 sm:mb-6 shadow-lg shadow-secondary/20 transition-transform group-hover:scale-110">
                <FingerPrintIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-base-content mb-2 sm:mb-3">Zero-Knowledge</h3>
              <p className="text-sm sm:text-base text-base-content/60 leading-relaxed mb-4">
                Prove you own a file without sharing the file itself. We use advanced cryptography to create
                tamper-proof proofs.
              </p>
              <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-bold text-secondary-content opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Learn more</span>
                <ArrowRightIcon className="h-4 w-4" />
              </div>
            </div>

            <div className="card rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300 group min-w-0">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-base-300 text-base-content mb-4 sm:mb-6 transition-transform group-hover:scale-110">
                <Squares2X2Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-base-content mb-2 sm:mb-3">Immutable Proofs</h3>
              <p className="text-sm sm:text-base text-base-content/60 leading-relaxed mb-4">
                Every proof is anchored to the blockchain, creating an unalterable timestamp of when your evidence was
                first recorded.
              </p>
              <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-bold text-base-content/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Learn more</span>
                <ArrowRightIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vault Section */}
      <section id="vault" className="bg-base-200/50 py-12 sm:py-16 md:py-20 border-t border-base-300 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl w-full min-w-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-base-content mb-1 sm:mb-2">Evidence Vault</h2>
              <p className="text-sm sm:text-base text-base-content/60">
                Manage and verify your recorded evidence proofs.
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
              <UploadEvidence />
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="h-px grow bg-base-300 min-w-0"></div>
                  <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-base-content/30 whitespace-nowrap shrink-0">
                    Recent Evidence Proofs
                  </h3>
                  <div className="h-px grow bg-base-300 min-w-0"></div>
                </div>
                <EvidenceList />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-2 border-dashed border-base-300 bg-base-100 p-8 sm:p-12 md:p-20 text-center min-w-0">
              <h3 className="text-lg sm:text-xl font-bold mb-2">Vault locked</h3>
              <p className="text-sm sm:text-base text-base-content/60 mb-0">
                Connect your wallet to access your private evidence proofs.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
