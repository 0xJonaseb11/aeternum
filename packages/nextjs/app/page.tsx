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
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress, isConnecting } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  return (
    <div className="flex flex-col grow">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-pattern pt-24 pb-20 sm:pt-32 sm:pb-28 border-b border-base-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary-content text-xs font-bold uppercase tracking-widest mb-6 border border-secondary/20">
              <ShieldCheckIcon className="h-4 w-4" />
              <span>Zero-Knowledge Evidence Vault</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-base-content sm:text-6xl lg:text-7xl mb-6">
              Security for your <span className="text-primary">Digital Truth</span>
            </h1>
            <p className="text-lg text-base-content/70 sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
              Aeternum provides a permanent, private, and verifiable vault for your most critical files. Encrypt
              locally, store forever on Arweave, and prove ownership without ever revealing the content.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/#vault" className="btn btn-primary btn-lg px-8 gap-2 group">
                <span>Access your Vault</span>
                <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              {!connectedAddress && (
                <p className="text-sm text-base-content/50 font-medium">Connect your wallet to get started</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="card rounded-2xl border border-base-300 bg-base-100 p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-content mb-6 shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                <CloudArrowUpIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-base-content mb-3">Permanent Storage</h3>
              <p className="text-base-content/60 leading-relaxed mb-4">
                Your evidence is stored on Arweave, a permanent decentralized web, ensuring it&apos;s available for
                decades, not just years.
              </p>
              <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Learn more</span>
                <ArrowRightIcon className="h-4 w-4" />
              </div>
            </div>

            <div className="card rounded-2xl border border-base-300 bg-base-100 p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-content mb-6 shadow-lg shadow-secondary/20 transition-transform group-hover:scale-110">
                <FingerPrintIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-base-content mb-3">Zero-Knowledge</h3>
              <p className="text-base-content/60 leading-relaxed mb-4">
                Prove you own a file without sharing the file itself. We use advanced cryptography to create
                tamper-proof proofs.
              </p>
              <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-bold text-secondary-content opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Learn more</span>
                <ArrowRightIcon className="h-4 w-4" />
              </div>
            </div>

            <div className="card rounded-2xl border border-base-300 bg-base-100 p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-base-300 text-base-content mb-6 transition-transform group-hover:scale-110">
                <Squares2X2Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-base-content mb-3">Immutable Proofs</h3>
              <p className="text-base-content/60 leading-relaxed mb-4">
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
      <section id="vault" className="bg-base-200/50 py-20 border-t border-base-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-bold text-base-content mb-2">Evidence Vault</h2>
              <p className="text-base-content/60">Manage and verify your recorded evidence proofs.</p>
            </div>
            {connectedAddress && (
              <div className="flex items-center gap-4 bg-base-100 px-4 py-2 rounded-xl border border-base-300 shadow-sm">
                <div className="flex flex-col">
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

          {isConnecting ? (
            <ProofListSkeleton count={3} />
          ) : connectedAddress ? (
            <div className="grid gap-12">
              <UploadEvidence />
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px grow bg-base-300"></div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/30 whitespace-nowrap">
                    Recent Evidence Proofs
                  </h3>
                  <div className="h-px grow bg-base-300"></div>
                </div>
                <EvidenceList />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-2 border-dashed border-base-300 bg-base-100 p-20 text-center">
              <h3 className="text-xl font-bold mb-2">Vault locked</h3>
              <p className="text-base-content/60 mb-0">Connect your wallet to access your private evidence proofs.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
