import { getSupabase } from "./supabase";

const ROUTE_LIMITS: Record<string, { maxPerWindow: number; windowMs: number }> = {
  upload: { maxPerWindow: 10, windowMs: 60_000 },
  proofs: { maxPerWindow: 60, windowMs: 60_000 },
  verify: { maxPerWindow: 30, windowMs: 60_000 },
  v1: { maxPerWindow: 120, windowMs: 60_000 },
  default: { maxPerWindow: 60, windowMs: 60_000 },
};

const store = new Map<string, { count: number; resetAt: number }>();

function getKey(identifier: string, prefix: string): string {
  return `${prefix}:${identifier}`;
}

/**
 * Returns true if the request is within limits.
 * Uses persistent Supabase storage with a memory map fallback.
 */
export async function rateLimit(identifier: string, prefix: string): Promise<boolean> {
  const config = ROUTE_LIMITS[prefix] ?? ROUTE_LIMITS.default;
  const now = Date.now();
  const key = getKey(identifier, prefix);
  const supabase = getSupabase();

  // If Supabase is unavailable (misconfigured), fall back to memory limit
  if (!supabase) {
    const entry = store.get(key);
    if (!entry || now >= entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + config.windowMs });
      return true;
    }
    entry.count += 1;
    return entry.count <= config.maxPerWindow;
  }

  try {
    // 1. Prune expired entries for this specific key or globally (randomly)
    if (Math.random() < 0.1) {
      void supabase.from("rate_limits").delete().lt("reset_at", new Date().toISOString());
    }

    // 2. Try to get and update current limit
    const { data, error } = await supabase.from("rate_limits").select("count, reset_at").eq("key", key).maybeSingle();

    if (error) throw error;

    if (!data || new Date(data.reset_at).getTime() < now) {
      // New or expired: Upsert a fresh window
      const { error: upsertError } = await supabase.from("rate_limits").upsert({
        key,
        count: 1,
        reset_at: new Date(now + config.windowMs).toISOString(),
      });
      if (upsertError) throw upsertError;
      return true;
    }

    // Existing and valid window: Increment count
    const newCount = data.count + 1;
    const { error: updateError } = await supabase.from("rate_limits").update({ count: newCount }).eq("key", key);

    if (updateError) throw updateError;
    return newCount <= config.maxPerWindow;
  } catch (err) {
    console.warn("Persistent rate limiting error (falling back):", err);
    // On DB error, allow request but log warning to avoid blocking users
    return true;
  }
}

export function getClientIdentifier(req: { headers: Headers }): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const via = req.headers.get("x-real-ip");
  if (via) return via;
  return "unknown";
}
