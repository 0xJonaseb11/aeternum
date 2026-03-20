import { NextRequest } from "next/server";
import { type User, createClient } from "@supabase/supabase-js";
import { isPlatformAdmin } from "~~/lib/rbac/isAdmin";

const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function getCurrentUserFromRequest(req: NextRequest): Promise<User | null> {
  if (!url || !anonKey) return null;
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token || token.startsWith("aet_")) return null;
  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
    error,
  } = await client.auth.getUser(token);
  if (error || !user) return null;

  const { data: isBlocked, error: blockErr } = await client
    .from("blocked_addresses")
    .select("address")
    .eq("address", user.id)
    .limit(1)
    .maybeSingle();

  if (blockErr) {
    console.error("Error checking blocked addresses:", blockErr.message);
  }

  if (isBlocked) return null;

  const { data: maintSettings, error: maintErr } = await client
    .from("platform_settings")
    .select("value")
    .eq("key", "maintenance_mode")
    .limit(1)
    .maybeSingle();

  if (maintErr) {
    console.error("Error checking platform settings:", maintErr.message);
  }

  if (maintSettings?.value === true) {
    const walletAddress = req.headers.get("x-wallet-address") || undefined;
    if (!isPlatformAdmin(user, walletAddress)) {
      return null;
    }
  }

  return user;
}
