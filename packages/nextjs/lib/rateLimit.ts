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

function prune(): void {
  const now = Date.now();
  for (const [key, v] of store.entries()) {
    if (v.resetAt < now) store.delete(key);
  }
}

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
