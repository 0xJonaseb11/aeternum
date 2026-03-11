"use client";

import Link from "next/link";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

export function EmailAuthStatus() {
  const { user, isLoading, signOut } = useSupabaseAuth();

  if (isLoading) {
    return <div className="text-xs text-base-content/40 font-bold uppercase tracking-widest">Account…</div>;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="btn btn-ghost btn-sm px-3 text-xs font-bold uppercase tracking-widest text-base-content/70"
      >
        Email sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="hidden lg:flex flex-col min-w-0 text-right">
        <span className="text-[10px] uppercase tracking-widest font-bold text-base-content/40">Account</span>
        <span className="text-xs text-base-content/70 truncate max-w-[220px]">{user.email ?? user.id}</span>
      </div>
      <button
        className="btn btn-outline btn-sm px-3 text-xs font-bold uppercase tracking-widest"
        onClick={() => void signOut()}
      >
        Sign out
      </button>
    </div>
  );
}

