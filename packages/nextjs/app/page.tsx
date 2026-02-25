"use client";

import Link from "next/link";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import {
  ArrowRightIcon,
  BugAntIcon,
  DocumentArrowUpIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { ProofListSkeleton } from "~~/components/ui/Skeleton";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress, isConnecting } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  return (
    <div className="flex flex-col grow">
      <section className="relative overflow-hidden bg-pattern py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-base-content sm:text-4xl lg:text-5xl">
            Private, permanent evidence vault
          </h1>
          <p className="mt-4 text-base text-base-content/80 sm:text-lg">
            Store cryptographic proofs of your files on-chain. Encrypt locally, upload to Arweave, verify ownership with
            zero-knowledge — without revealing secrets.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {connectedAddress ? (
              <div className="flex flex-col items-center gap-2 rounded-box border border-base-300 bg-base-100/80 px-6 py-4">
                <span className="text-sm font-medium text-base-content/70">Connected</span>
                <Address
                  address={connectedAddress}
                  chain={targetNetwork}
                  blockExplorerAddressLink={
                    targetNetwork.id === hardhat.id ? `/blockexplorer/address/${connectedAddress}` : undefined
                  }
                />
              </div>
            ) : (
              <p className="text-sm text-base-content/70">Connect your wallet to create and view proofs.</p>
            )}
          </div>
        </div>
      </section>

      <section id="vault" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl">
        <h2 className="text-xl font-semibold text-base-content mb-6">Your proofs</h2>
        {isConnecting ? (
          <ProofListSkeleton count={3} />
        ) : connectedAddress ? (
          <div className="rounded-box border border-base-300 bg-base-100 py-12 text-center">
            <p className="text-base-content/70">No proofs yet. Upload a file to create your first proof.</p>
            <Link href="/#vault" passHref className="btn btn-primary btn-sm mt-4 gap-2">
              <DocumentArrowUpIcon className="h-4 w-4" />
              <span>Upload proof</span>
            </Link>
          </div>
        ) : (
          <div className="rounded-box border border-dashed border-base-300 bg-base-200/50 py-12 text-center">
            <p className="text-base-content/70">Connect your wallet to see your proofs.</p>
          </div>
        )}
      </section>

      <section className="border-t border-base-300 bg-base-200/30 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/#vault"
              passHref
              className="card rounded-box border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="card-body gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <DocumentArrowUpIcon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-base-content">Upload proof</h3>
                <p className="text-sm text-base-content/70">Encrypt a file and register its proof on-chain.</p>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
                  <span>Go</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </div>
            </Link>
            <Link
              href="/#vault"
              passHref
              className="card rounded-box border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="card-body gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20 text-secondary-content">
                  <ShieldCheckIcon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-base-content">Verify</h3>
                <p className="text-sm text-base-content/70">Check proof existence or verify ownership with ZK.</p>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-secondary-content">
                  <span>Verify</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </div>
            </Link>
            <Link
              href="/blockexplorer"
              passHref
              className="card rounded-box border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="card-body gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-base-300 text-base-content">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-base-content">Block Explorer</h3>
                <p className="text-sm text-base-content/70">Browse addresses and transactions.</p>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-base-content/80">
                  <span>Explore</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </div>
            </Link>
            <Link
              href="/debug"
              passHref
              className="card rounded-box border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="card-body gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-base-300 text-base-content">
                  <BugAntIcon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-base-content">Debug</h3>
                <p className="text-sm text-base-content/70">Inspect and call contracts.</p>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-base-content/80">
                  <span>Open</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
