import { User } from "@supabase/supabase-js";

/**
 * Basic admin verification. In production, this would check a 'profiles' table
 * or a specific Supabase role. For now, we use an allowlist.
 */
export function isPlatformAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;

  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || ["sebejaz99@gmail.com"];
  return adminEmails.includes(user.email);
}
