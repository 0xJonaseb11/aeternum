import React from "react";
import Link from "next/link";
import { AppLogo } from "~~/components/AppLogo";
import { SwitchTheme } from "~~/components/SwitchTheme";

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-base-300 bg-base-100/50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 w-full min-w-0">
      <div className="mx-auto max-w-7xl w-full">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-4">
          <div className="md:col-span-2 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <AppLogo className="h-10 w-10 sm:h-12 sm:w-12 shrink-0" />
              <span className="font-bold text-lg sm:text-xl tracking-tight text-base-content">Aeternum</span>
            </div>
            <p className="max-w-xs text-xs sm:text-sm text-base-content/60 leading-relaxed">
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
              <li>
                <Link href="/privacy-policy" className="link link-hover text-base-content/70">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/tos" className="link link-hover text-base-content/70">
                  Terms of Service
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

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-base-300 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] sm:text-xs text-base-content/40 text-center md:text-left max-w-full">
            © {new Date().getFullYear()} Aeternum. Built for the future of evidence. Built by{" "}
            <a
              href="https://github.com/0xJonaseb11"
              target="_blank"
              rel="noreferrer"
              className="link link-hover text-primary font-medium"
            >
              Jonas Sebera
            </a>
            .
          </p>
          <div className="flex items-center gap-4">
            <SwitchTheme />
          </div>
        </div>
      </div>
    </footer>
  );
};
