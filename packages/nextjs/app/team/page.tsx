"use client";

import Link from "next/link";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { AppLogo } from "~~/components/AppLogo";

/**
 * Team / organization placeholder.
 * Future: list orgs, create org, invite members, shared evidence vault.
 */
export default function TeamPage() {
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
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="rounded-2xl bg-primary/10 p-8 border border-primary/20">
            <UserGroupIcon className="h-12 w-12 text-primary mx-auto mb-3" />
            <h1 className="text-xl font-bold text-base-content mb-2">Teams & organizations</h1>
            <p className="text-sm text-base-content/70 max-w-sm">
              Create organizations, invite members, and share evidence vaults with roles (Owner, Admin, Contributor,
              Viewer). Coming soon.
            </p>
          </div>
          <Link href="/settings" className="btn btn-ghost btn-sm">
            Settings
          </Link>
        </div>
      </main>
    </div>
  );
}
