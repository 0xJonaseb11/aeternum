import { NextRequest } from "next/server";
import { type User, createClient } from "@supabase/supabase-js";
import { isPlatformAdmin } from "~~/lib/rbac/isAdmin";

const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

export type AuthResult = {
  user: User | null;
  status: "ok" | "maintenance" | "blocked" | "unauthorized";
};

export async function getCurrentUserFromRequest(req: NextRequest): Promise<AuthResult> {
  if (!url || !anonKey) return { user: null, status: "unauthorized" };
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!token) return { user: null, status: "unauthorized" };
  // aet_ is our internal prefix for API keys/system tokens if we ever use them, but Supabase JWTs don't have it.
  if (token.startsWith("aet_")) return { user: null, status: "unauthorized" };

  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error,
  } = await client.auth.getUser(token);

  if (error || !user) return { user: null, status: "unauthorized" };

  // Check if address is blocked
  const { data: isBlocked, error: blockErr } = await client
    .from("blocked_addresses")
    .select("address")
    .eq("address", user.id)
    .limit(1)
    .maybeSingle();

  if (blockErr) {
    console.error("[Auth] Error checking blocked addresses:", blockErr.message);
  }

  if (isBlocked) return { user: null, status: "blocked" };

  // Check Maintenance Mode
  const { data: maintSettings, error: maintErr } = await client
    .from("platform_settings")
    .select("value")
    .eq("key", "maintenance_mode")
    .limit(1)
    .maybeSingle();

  if (maintErr) {
    console.error("[Auth] Error checking platform settings:", maintErr.message);
  }

  if (maintSettings?.value === true) {
    const walletAddress = req.headers.get("x-wallet-address") || undefined;
    if (!isPlatformAdmin(user, walletAddress)) {
      return { user, status: "maintenance" };
    }
  }

  return { user, status: "ok" };
}
