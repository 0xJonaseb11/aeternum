import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "~~/lib/supabase";

/**
 * API key format: aet_<prefix>_<secret> (e.g. aet_abc123_...).
 * Store only key_hash (e.g. SHA-256) and key_prefix (e.g. aet_abc123) in DB.
 * This helper validates Authorization: Bearer <key> and returns userId or null.
 * Use in API v1 routes when you want to allow either session or API key auth.
 */
const KEY_PREFIX = "aet_";

export interface ApiKeyAuth {
  userId: string;
  keyId: string;
}

export async function getApiKeyAuth(req: NextRequest): Promise<ApiKeyAuth | null> {
  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!bearer || !bearer.startsWith(KEY_PREFIX)) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  const prefix = bearer.slice(0, KEY_PREFIX.length + 8); // e.g. aet_abc12345
  const { data: row } = await supabase
    .from("api_keys")
    .select("id, user_id, key_hash")
    .eq("key_prefix", prefix)
    .maybeSingle();

  if (!row?.key_hash) return null;

  // TODO: hash the incoming key and compare with key_hash (e.g. bcrypt or constant-time compare of hash)
  // For foundation we only check prefix exists; real implementation must verify full key.
  return { userId: row.user_id, keyId: row.id };
}

/** Returns 401 JSON if no valid API key; otherwise returns null (caller proceeds). */
export function requireApiKey(result: ApiKeyAuth | null): NextResponse | null {
  if (result) return null;
  return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
}
