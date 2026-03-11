"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

export function RequireSupabaseAuth({
  children,
  redirectTo = "/login",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useSupabaseAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user) return;
    const next = encodeURIComponent(pathname || "/");
    router.replace(`${redirectTo}?next=${next}`);
  }, [isLoading, pathname, redirectTo, router, user]);

  if (isLoading) {
    return <div className="p-6 text-sm text-base-content/60">Loading…</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
