"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { AppLogo } from "~~/components/AppLogo";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  { label: "Home", href: "/" },
  { label: "Vault", href: "/#vault" },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    setHash(typeof window !== "undefined" ? (window.location.hash || "").replace(/^#/, "") : "");
    const onHashChange = () => setHash((window.location.hash || "").replace(/^#/, ""));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const path = href.replace(/#.*/, "");
        const fragment = (href.match(/#(.+)/) || [])[1] || "";
        const isActive = pathname === path && (fragment === "" ? hash !== "vault" : hash === fragment);
        return (
          <li key={href}>
            <Link
              href={href}
              className={`${
                isActive ? "text-primary bg-primary/10 shadow-inner" : "text-base-content/70"
              } hover:bg-primary/5 hover:text-primary active:scale-95 transition-all duration-200 py-2 px-4 text-sm font-bold uppercase tracking-widest rounded-lg flex items-center gap-2`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-base-300 bg-base-100/95 backdrop-blur-sm w-full overflow-visible">
      <div className="navbar min-h-0 justify-between gap-2 px-3 sm:px-6 lg:px-8 max-w-[100vw] overflow-visible">
        <div className="navbar-start w-auto md:w-1/2 min-w-0 overflow-visible">
          {/* Mobile: hamburger menu (opens to the right so it stays in view) */}
          <details className="dropdown dropdown-start overflow-visible" ref={burgerMenuRef}>
            <summary className="btn btn-ghost btn-sm md:hidden p-2" aria-label="Open menu">
              <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </summary>
            <ul
              className="menu dropdown-content menu-compact mt-3 w-72 min-w-[260px] max-w-[calc(100vw-2rem)] rounded-box border border-base-300 bg-base-100 p-2 shadow-xl z-50"
              onClick={e => {
                const target = e.target as HTMLElement;
                if (target.closest("a[href]")) burgerMenuRef?.current?.removeAttribute("open");
              }}
            >
              <HeaderMenuLinks />
              <li className="menu-title mt-2 pt-2 border-t border-base-300">
                <span className="text-[10px] uppercase tracking-widest text-base-content/50 font-bold">App</span>
              </li>
              <li onClick={e => e.stopPropagation()} className="rounded-lg">
                <div className="flex flex-col gap-1.5 py-1">
                  <span className="text-[10px] uppercase tracking-widest text-base-content/50 font-bold px-4">
                    Theme
                  </span>
                  <SwitchTheme className="px-2" />
                </div>
              </li>
              {isLocalNetwork && (
                <li onClick={e => e.stopPropagation()} className="rounded-lg">
                  <div className="flex flex-col gap-1.5 py-1">
                    <span className="text-[10px] uppercase tracking-widest text-base-content/50 font-bold px-4">
                      Faucet
                    </span>
                    <div className="px-2">
                      <FaucetButton />
                    </div>
                  </div>
                </li>
              )}
              <li onClick={e => e.stopPropagation()} className="rounded-lg">
                <div className="flex flex-col gap-1.5 py-1">
                  <span className="text-[10px] uppercase tracking-widest text-base-content/50 font-bold px-4">
                    Wallet
                  </span>
                  <div className="px-2 w-full min-w-0">
                    <RainbowKitCustomConnectButton />
                  </div>
                </div>
              </li>
            </ul>
          </details>
          <Link
            href="/"
            passHref
            className="flex items-center gap-2 sm:gap-2.5 ml-0 mr-2 sm:mr-6 shrink-0 md:ml-2 min-w-0"
            aria-label="Aeternum home"
          >
            <AppLogo className="h-10 w-10 sm:h-12 sm:w-12 shrink-0" />
            <div className="flex flex-col justify-center leading-tight min-w-0">
              <span className="font-bold tracking-tight text-sm sm:text-base md:text-lg text-base-content truncate">
                Aeternum
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-base-content/50 font-semibold truncate">
                Evidence Vault
              </span>
            </div>
          </Link>
          <ul className="hidden md:flex menu menu-horizontal gap-1 px-1">
            <HeaderMenuLinks />
          </ul>
        </div>
        <div className="navbar-end hidden md:flex items-center justify-end gap-2 lg:gap-3 min-w-0 flex-shrink-0">
          <SwitchTheme className="shrink-0 btn btn-ghost btn-sm p-2" />
          {isLocalNetwork && <FaucetButton />}
          <div className="min-w-0 flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};
