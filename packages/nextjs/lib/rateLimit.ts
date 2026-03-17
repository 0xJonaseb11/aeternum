/**
 * Configurable per-route rate limiter.
 *
 * Uses in-memory store by default. For production at scale, replace with
 * Upstash Redis + @upstash/ratelimit when UPSTASH_REDIS_REST_URL is set.
 *
 * Each route prefix has its own limit, so upload routes (which cost real money)
 * are more restricted than read-only verify routes.
 */

/** Per-route rate limit config: max requests per window. */
const ROUTE_LIMITS: Record<string, { maxPerWindow: number; windowMs: number }> = {
  upload: { maxPerWindow: 10, windowMs: 60_000 }, // 10 uploads/min — costs real money
  proofs: { maxPerWindow: 60, windowMs: 60_000 }, // 60 reads/min
  verify: { maxPerWindow: 30, windowMs: 60_000 }, // 30 verifications/min
  v1: { maxPerWindow: 120, windowMs: 60_000 }, // 120 API calls/min (plan limits are separate)
  default: { maxPerWindow: 60, windowMs: 60_000 }, // fallback
};

const store = new Map<string, { count: number; resetAt: number }>();

function getKey(identifier: string, prefix: string): string {
  return `${prefix}:${identifier}`;
}

function prune(): void {
  const now = Date.now();
  for (const [key, v] of store.entries()) {
    if (v.resetAt < now) store.delete(key);
  }
}

/**
 * Returns true if the request is allowed, false if rate limited.
 * @param identifier — IP address or user/key id
 * @param prefix — route category e.g. "upload", "verify", "v1"
 */
export function rateLimit(identifier: string, prefix: string): boolean {
  const config = ROUTE_LIMITS[prefix] ?? ROUTE_LIMITS.default;
  const now = Date.now();
  const key = getKey(identifier, prefix);
  let entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    if (store.size > 1000) prune();
    return true;
  }

  if (now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + config.windowMs };
    store.set(key, entry);
    return true;
  }

  entry.count += 1;
  return entry.count <= config.maxPerWindow;
}

/**
 * Get client identifier from request (IP or x-forwarded-for).
 */
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
