"use client";

import Link from "next/link";
import { Address } from "@scaffold-ui/components";
import { ArrowRight, Droplets } from "lucide-react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

const BASE_SEPOLIA_EXPLORER = "https://sepolia.basescan.org";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  return (
    <>
      <section className="relative w-full min-h-[70vh] flex flex-col items-center justify-center px-5 py-16 overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: "linear-gradient(180deg, var(--color-base-200) 0%, var(--color-base-300) 100%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03] -z-10"
          style={{ background: "var(--color-primary)" }}
        />

        <div className="text-center max-w-2xl mx-auto">
          <p className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-base-content/60 mb-4 font-medium">
            <Droplets className="h-3.5 w-3.5" />
            Base Sepolia developer faucet
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-base-content mb-5 leading-[1.1]">
            Testnet ETH for <span className="text-primary">African web3 builders</span>
          </h1>

          <p className="text-lg text-base-content/80 max-w-xl mx-auto leading-relaxed mb-10">
            Get Base Sepolia testnet ETH for African web3 builders. Connect your wallet, link GitHub, and claim. No
            mainnet gas required.
          </p>

          <Link
            href="/faucet"
            className="btn btn-primary btn-lg rounded-2xl gap-2 shadow-lg hover:shadow-xl transition-all duration-200 normal-case font-semibold text-base"
          >
            Get testnet ETH
            <ArrowRight className="h-5 w-5" />
          </Link>

          {connectedAddress && (
            <div className="mt-8 pt-8 border-t border-base-content/10">
              <p className="text-xs uppercase tracking-wider text-base-content/50 mb-2">Connected</p>
              <Address
                address={connectedAddress}
                chain={targetNetwork}
                blockExplorerAddressLink={`${BASE_SEPOLIA_EXPLORER}/address/${connectedAddress}`}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;
