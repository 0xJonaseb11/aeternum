import React from "react";
import Link from "next/link";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";

export const Footer = () => {

  return (
    <footer className="mt-auto border-t border-base-300 bg-base-100/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-content">
                <LockClosedIcon className="h-4 w-4" />
              </span>
              <span className="font-bold text-xl tracking-tight text-base-content">Aeternum</span>
            </div>
            <p className="max-w-xs text-sm text-base-content/60 leading-relaxed">
              Secure, permanent, and private evidence vault. Leveraging zero-knowledge proofs and decentralized storage
              for ultimate data integrity.
            </p>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-base-content/40 mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="link link-hover text-base-content/70">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#vault" className="link link-hover text-base-content/70">
                  Vault
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-base-content/40 mb-4">Tools</h3>
            <ul className="space-y-2 text-sm text-base-content/70">
              <li>
                <a
                  href="https://github.com/0xJonaseb11/aeternum"
                  target="_blank"
                  rel="noreferrer"
                  className="link link-hover flex items-center gap-1"
                >
                  <span>Source Code</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-base-300 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-base-content/40">
            © {new Date().getFullYear()} Aeternum. Built for the future of evidence.
          </p>
          <div className="flex items-center gap-4">
            <SwitchTheme />
          </div>
        </div>
      </div>
    </footer>
  );
};
