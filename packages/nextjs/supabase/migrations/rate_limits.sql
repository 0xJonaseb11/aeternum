-- Persistent rate limiting table for serverless environments.
-- This table stores unique identifiers (IP or user ID) and their request counts per window.

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for pruning expired rate limits
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON public.rate_limits(reset_at);

-- RLS: Only internal services can manage rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Internal only" ON public.rate_limits;
-- No public access policies needed since we use service_role for this table.
