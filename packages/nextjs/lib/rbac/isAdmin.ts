import { User } from "@supabase/supabase-js";

export function isPlatformAdmin(user: User | null, walletAddress?: string): boolean {
  if (walletAddress) {
    const adminWallets = (process.env.NEXT_PUBLIC_ADMIN_WALLETS || "").toLowerCase().split(",").filter(Boolean);
    if (adminWallets.includes(walletAddress.toLowerCase())) return true;
  }

  // Fallback to email check
  if (!user || !user.email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || "sebejaz99@gmail.com").toLowerCase().split(",").filter(Boolean);
  return adminEmails.includes(user.email.toLowerCase());
}
