"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon, BugAntIcon, MagnifyingGlassIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  { label: "Home", href: "/" },
  { label: "Vault", href: "/#vault" },
  {
    label: "Block Explorer",
    href: "/blockexplorer",
    icon: <MagnifyingGlassIcon className="h-4 w-4" />,
  },
  {
    label: "Debug",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const path = href.replace(/#.*/, "");
        const isActive = pathname === path || (path === "/" && pathname === "/");
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary text-secondary-content shadow-sm" : ""
              } hover:bg-secondary hover:text-secondary-content focus:!bg-secondary active:!text-secondary-content py-2 px-4 text-sm rounded-box gap-2 grid grid-flow-col`}
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

/**
 * Site header — Aeternum branding, nav, theme toggle, wallet connect.
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-base-300 bg-base-100/95 backdrop-blur-sm">
      <div className="navbar min-h-0 justify-between px-4 sm:px-6 lg:px-8">
        <div className="navbar-start w-auto lg:w-1/2">
          <details className="dropdown" ref={burgerMenuRef}>
            <summary className="btn btn-ghost lg:hidden" aria-label="Open menu">
              <Bars3Icon className="h-6 w-6" />
            </summary>
            <ul
              className="menu dropdown-content menu-compact mt-3 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
              onClick={() => burgerMenuRef?.current?.removeAttribute("open")}
            >
              <HeaderMenuLinks />
            </ul>
          </details>
          <Link
            href="/"
            passHref
            className="flex items-center gap-2 ml-0 mr-6 shrink-0 lg:ml-2"
            aria-label="Aeternum home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LockClosedIcon className="h-5 w-5" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold tracking-tight text-base-content">Aeternum</span>
              <span className="text-xs text-base-content/70">Evidence vault</span>
            </div>
          </Link>
          <ul className="hidden lg:flex menu menu-horizontal gap-1 px-1">
            <HeaderMenuLinks />
          </ul>
        </div>
        <div className="navbar-end flex grow items-center gap-2 sm:gap-3">
          <SwitchTheme className="shrink-0" />
          {isLocalNetwork && <FaucetButton />}
          <RainbowKitCustomConnectButton />
        </div>
      </div>
    </header>
  );
};
