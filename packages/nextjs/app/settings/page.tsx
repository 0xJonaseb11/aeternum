"use client";

import Link from "next/link";
import { CreditCardIcon, KeyIcon, UserCircleIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { AppLogo } from "~~/components/AppLogo";

/**
 * Settings foundation: Account, API keys, Billing.
 * Each section links to the relevant flow or shows a coming-soon placeholder.
 */
export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <header className="border-b border-base-300 bg-base-100/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AppLogo className="h-8 w-8" />
            <span className="font-bold text-sm uppercase tracking-wider">Aeternum</span>
          </Link>
          <Link href="/vault" className="text-xs font-medium text-base-content/70 hover:text-primary">
            Back to Vault
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-base-content mb-2">Settings</h1>
        <p className="text-sm text-base-content/60 mb-8">Manage your account, API keys, and billing.</p>

        <div className="flex flex-col gap-4">
          <Link
            href="/login"
            className="card bg-base-100 border border-base-300 shadow-sm hover:border-primary/30 transition-colors"
          >
            <div className="card-body flex-row items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <UserCircleIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base-content">Account</h2>
                <p className="text-xs text-base-content/60">Email, wallet link, sign out</p>
              </div>
              <span className="text-base-content/40">→</span>
            </div>
          </Link>

          <div className="card bg-base-100 border border-base-300 shadow-sm opacity-90">
            <div className="card-body flex-row items-center gap-4">
              <div className="rounded-lg bg-base-300/50 p-3">
                <KeyIcon className="h-6 w-6 text-base-content/60" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base-content">API keys</h2>
                <p className="text-xs text-base-content/60">
                  Create and manage keys for the developer API (coming soon)
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-sm opacity-90">
            <div className="card-body flex-row items-center gap-4">
              <div className="rounded-lg bg-base-300/50 p-3">
                <CreditCardIcon className="h-6 w-6 text-base-content/60" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base-content">Billing</h2>
                <p className="text-xs text-base-content/60">Plans and subscription (coming soon)</p>
              </div>
            </div>
          </div>

          <Link
            href="/team"
            className="card bg-base-100 border border-base-300 shadow-sm hover:border-primary/30 transition-colors"
          >
            <div className="card-body flex-row items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <UserGroupIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base-content">Team</h2>
                <p className="text-xs text-base-content/60">Organizations and members (coming soon)</p>
              </div>
              <span className="text-base-content/40">→</span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
