"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon, LockClosedIcon } from "@heroicons/react/24/outline";
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
    <header className="sticky top-0 z-20 shrink-0 border-b border-base-300 bg-base-100/95 backdrop-blur-sm w-full">
      <div className="navbar min-h-0 justify-between gap-2 px-3 sm:px-6 lg:px-8 max-w-[100vw]">
        <div className="navbar-start w-auto lg:w-1/2 min-w-0">
          <details className="dropdown" ref={burgerMenuRef}>
            <summary className="btn btn-ghost btn-sm lg:hidden p-2" aria-label="Open menu">
              <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </summary>
            <ul
              className="menu dropdown-content menu-compact mt-3 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg z-30"
              onClick={() => burgerMenuRef?.current?.removeAttribute("open")}
            >
              <HeaderMenuLinks />
            </ul>
          </details>
          <Link
            href="/"
            passHref
            className="flex items-center gap-1.5 sm:gap-2 ml-0 mr-2 sm:mr-6 shrink-0 lg:ml-2 min-w-0"
            aria-label="Aeternum home"
          >
            <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary text-primary-content shadow-md shrink-0">
              <LockClosedIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <div className="flex flex-col leading-tight min-w-0 hidden sm:block">
              <span className="font-bold tracking-tight text-base sm:text-lg text-base-content truncate">Aeternum</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-base-content/50 font-semibold truncate">
                Evidence Vault
              </span>
            </div>
          </Link>
          <ul className="hidden lg:flex menu menu-horizontal gap-1 px-1">
            <HeaderMenuLinks />
          </ul>
        </div>
        <div className="navbar-end flex grow items-center justify-end gap-1.5 sm:gap-3 min-w-0 flex-shrink-0">
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
