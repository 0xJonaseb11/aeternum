import { NextRequest } from "next/server";
import { type User, createClient } from "@supabase/supabase-js";

const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Get the current Supabase user from the request.
 * Expects Authorization: Bearer <supabase_access_token> (from client session).
 * Used by API routes that need the authenticated user (e.g. API key management).
 */
export async function getCurrentUserFromRequest(req: NextRequest): Promise<User | null> {
  if (!url || !anonKey) return null;
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token || token.startsWith("aet_")) return null; // skip API key tokens
  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
    error,
  } = await client.auth.getUser(token);
  if (error || !user) return null;
  return user;
}
