import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { logger } from "~~/lib/logger";
import { getSupabase } from "~~/lib/supabase";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

const KEY_PREFIX = "aet_";
const PREFIX_LENGTH = 8;
const SECRET_LENGTH = 32;

function randomHex(length: number): string {
  return randomBytes(length).toString("hex");
}

function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

/** GET: list API keys for the current user (requires Supabase session token in Authorization). */
export async function GET(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, last_used_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) {
    logger.error("Supabase api-keys GET error", { error: error.message });
    return NextResponse.json({ error: "Failed to list keys" }, { status: 500 });
  }
  return NextResponse.json({ keys: data ?? [] });
}

/** POST: create a new API key (requires Supabase session token). Returns full key only once. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.slice(0, 200) : null;
  const prefix = randomHex(PREFIX_LENGTH);
  const secret = randomHex(SECRET_LENGTH);
  const fullKey = `${KEY_PREFIX}${prefix}_${secret}`;
  const keyHash = sha256Hex(fullKey);
  const keyPrefix = `${KEY_PREFIX}${prefix}`;
  const { data: row, error } = await supabase
    .from("api_keys")
    .insert({ user_id: user.id, name, key_prefix: keyPrefix, key_hash: keyHash })
    .select("id, name, key_prefix, created_at")
    .single();
  if (error) {
    logger.error("Supabase api-keys POST error", { error: error.message });
    return NextResponse.json({ error: "Failed to create key" }, { status: 500 });
  }
  return NextResponse.json({
    key: fullKey,
    id: row.id,
    name: row.name,
    key_prefix: row.key_prefix,
    created_at: row.created_at,
    message: "Copy the key now; it will not be shown again.",
  });
}
