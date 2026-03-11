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
      <section className="relative overflow-hidden bg-pattern pt-16 pb-12 sm:pt-24 sm:pb-20 md:pt-32 md:pb-28 border-b border-base-300 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-[100vw]">
          <div className="max-w-4xl mx-auto text-center min-w-0">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-secondary/10 text-secondary-content text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 sm:mb-6 border border-secondary/20 flex-wrap justify-center">
              <ShieldCheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>Zero-knowledge evidence vault</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-base-content sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl mb-4 sm:mb-6 px-1">
              Security for your{" "}
              <span className="text-primary text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl 2xl:text-7xl">
                Digital
              </span>
              <br />
              <span className="text-primary text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl 2xl:text-7xl">
                Truth
              </span>
            </h1>
            <p className="text-base text-base-content/70 sm:text-lg md:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 px-1">
              Only you hold the key to your evidence. Encrypt locally, store forever on Arweave, and prove ownership
              without ever revealing the content. No one else can access your vault.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/vault"
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

      <section className="py-12 sm:py-16 md:py-20 bg-base-100 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl w-full min-w-0">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            <div className="card rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300 group min-w-0">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary text-primary-content mb-4 sm:mb-6 shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                <CloudArrowUpIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-base-content mb-2 sm:mb-3">Permanent Storage</h3>
              <p className="text-sm sm:text-base text-base-content/60 leading-relaxed mb-4">
                Your evidence lives on Arweave, a permanent decentralized web that keeps it available for decades. Only
                you hold the key to decrypt it.
              </p>
              <a
                href="https://docs.arweave.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto pt-4 flex items-center gap-2 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
              >
                <span>Learn more</span>
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            </div>

            <div className="card rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300 group min-w-0">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-secondary text-secondary-content mb-4 sm:mb-6 shadow-lg shadow-secondary/20 transition-transform group-hover:scale-110">
                <FingerPrintIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-base-content mb-2 sm:mb-3">Zero-Knowledge</h3>
              <p className="text-sm sm:text-base text-base-content/60 leading-relaxed mb-4">
                Prove you own a file without sharing it. Your secret stays on your device; we use ZK proofs so only you
                hold the key.
              </p>
              <a
                href="https://docs.circom.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto pt-4 flex items-center gap-2 text-sm font-bold text-secondary-content opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
              >
                <span>Learn more</span>
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            </div>

            <div className="card rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300 group min-w-0">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-base-300 text-base-content mb-4 sm:mb-6 transition-transform group-hover:scale-110">
                <Squares2X2Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-base-content mb-2 sm:mb-3">Immutable Proofs</h3>
              <p className="text-sm sm:text-base text-base-content/60 leading-relaxed mb-4">
                Every proof is anchored on Base, which creates an unalterable timestamp. Only you can verify or recover
                with your key.
              </p>
              <a
                href="https://docs.base.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto pt-4 flex items-center gap-2 text-sm font-bold text-base-content/40 opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
              >
                <span>Learn more</span>
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Vault functionality now lives at /vault; home remains marketing-focused. */}
    </div>
  );
};

export default Home;
