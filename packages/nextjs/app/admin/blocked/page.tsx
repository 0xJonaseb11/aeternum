"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeftIcon, NoSymbolIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

export default function AdminBlocked() {
  const { user } = useSupabaseAuth();

  if (!user) return <div className="p-8 text-center mt-20">Sign in to access admin tools.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="btn btn-ghost btn-circle">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <NoSymbolIcon className="h-8 w-8 text-error" />
              Blocked Addresses
            </h1>
            <p className="text-sm text-base-content/60 mt-1">
              Prevent specific wallets or IP addresses from accessing the platform.
            </p>
          </div>
        </div>
        <button className="btn btn-primary gap-2" disabled>
          <PlusIcon className="h-4 w-4" />
          Block New
        </button>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body py-12 text-center">
          <NoSymbolIcon className="h-12 w-12 mx-auto mb-4 opacity-10" />
          <h3 className="text-lg font-bold">No Blocked Entities</h3>
          <p className="text-sm text-base-content/60 max-w-sm mx-auto mt-2">
            The system is currently open to all verified participants. No blocks have been manually applied.
          </p>
        </div>
      </div>
    </div>
  );
}
