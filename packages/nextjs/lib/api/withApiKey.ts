import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { getSupabase } from "~~/lib/supabase";

const KEY_PREFIX = "aet_";
const PREFIX_LENGTH = KEY_PREFIX.length + 8;

function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export interface ApiKeyAuth {
  userId: string;
  keyId: string;
}

export async function getApiKeyAuth(req: NextRequest): Promise<ApiKeyAuth | null> {
  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!bearer || !bearer.startsWith(KEY_PREFIX) || bearer.length < PREFIX_LENGTH + 2) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  const prefix = bearer.slice(0, PREFIX_LENGTH);
  const { data: row } = await supabase
    .from("api_keys")
    .select("id, user_id, key_hash")
    .eq("key_prefix", prefix)
    .maybeSingle();

  if (!row?.key_hash) return null;

  const incomingHash = sha256Hex(bearer);
  const storedBuf = Buffer.from(row.key_hash, "hex");
  const incomingBuf = Buffer.from(incomingHash, "hex");
  if (storedBuf.length !== incomingBuf.length || !timingSafeEqual(storedBuf, incomingBuf)) return null;

  return { userId: row.user_id, keyId: row.id };
}

export function requireApiKey(result: ApiKeyAuth | null): NextResponse | null {
  if (result) return null;
  return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
}
