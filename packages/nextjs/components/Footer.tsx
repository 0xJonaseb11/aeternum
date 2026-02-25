import React from "react";
import Link from "next/link";
import { useFetchNativeCurrencyPrice } from "@scaffold-ui/hooks";
import { hardhat } from "viem/chains";
import { ArrowTopRightOnSquareIcon, CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

/**
 * Site footer — Aeternum tagline, utility links, theme; no emojis, real icons only.
 */
export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { price: nativeCurrencyPrice } = useFetchNativeCurrencyPrice();

  return (
    <footer className="min-h-0 border-t border-base-300 bg-base-100/80 py-6 px-4 sm:px-6 lg:px-8 mb-11 lg:mb-0">
      <div className="fixed bottom-0 left-0 z-10 flex w-full items-center justify-between pointer-events-none p-4">
        <div className="flex flex-col gap-2 pointer-events-auto md:flex-row">
          {nativeCurrencyPrice > 0 && (
            <div className="btn btn-primary btn-sm font-normal gap-1 cursor-default">
              <CurrencyDollarIcon className="h-4 w-4" />
              <span>{nativeCurrencyPrice.toFixed(2)}</span>
            </div>
          )}
          {isLocalNetwork && (
            <>
              <Faucet />
              <Link href="/blockexplorer" passHref className="btn btn-primary btn-sm font-normal gap-1">
                <MagnifyingGlassIcon className="h-4 w-4" />
                <span>Block Explorer</span>
              </Link>
            </>
          )}
        </div>
        <SwitchTheme className={`pointer-events-auto ${isLocalNetwork ? "self-end md:self-auto" : ""}`} />
      </div>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-medium text-base-content">Aeternum</p>
            <p className="text-sm text-base-content/70">Private, permanent evidence vault</p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm">
            <a
              href="https://github.com/scaffold-eth/se-2"
              target="_blank"
              rel="noreferrer"
              className="link link-hover inline-flex items-center gap-1"
            >
              <span>GitHub</span>
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://buidlguidl.com/"
              target="_blank"
              rel="noreferrer"
              className="link link-hover inline-flex items-center gap-1"
            >
              <span>BuidlGuidl</span>
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA"
              target="_blank"
              rel="noreferrer"
              className="link link-hover inline-flex items-center gap-1"
            >
              <span>Support</span>
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};
