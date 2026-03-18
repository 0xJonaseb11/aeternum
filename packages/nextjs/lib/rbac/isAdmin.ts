import { User } from "@supabase/supabase-js";

/**
 * Basic admin verification. In production, this would check a 'profiles' table
 * or a specific Supabase role. For now, we use an allowlist of emails and wallets.
 */
export function isPlatformAdmin(user: User | null, walletAddress?: string): boolean {
  // Check wallet address first (most reliable for Web3 context)
  if (walletAddress) {
    const adminWallets = (process.env.NEXT_PUBLIC_ADMIN_WALLETS || "").toLowerCase().split(",").filter(Boolean);
    if (adminWallets.includes(walletAddress.toLowerCase())) return true;
  }

  // Fallback to email check
  if (!user || !user.email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || "sebejaz99@gmail.com").toLowerCase().split(",").filter(Boolean);
  return adminEmails.includes(user.email.toLowerCase());
}
