/**
 * In-memory rate limiter (per-instance). For production at scale, replace with
 * Upstash Redis + @upstash/ratelimit when UPSTASH_REDIS_REST_URL is set.
 */

const windowMs = 60 * 1000; // 1 minute
const maxPerWindow = 60; // requests per window per key

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
 * identifier: IP address or user/key id.
 * prefix: e.g. "upload", "verify", "v1"
 */
export function rateLimit(identifier: string, prefix: string): boolean {
  const now = Date.now();
  const key = getKey(identifier, prefix);
  let entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    if (store.size > 1000) prune();
    return true;
  }

  if (now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return true;
  }

  entry.count += 1;
  return entry.count <= maxPerWindow;
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
