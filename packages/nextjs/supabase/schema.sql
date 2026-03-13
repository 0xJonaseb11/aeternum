-- Proof metadata for reliable list retrieval by owner (no file content).
-- Run this in the Supabase SQL editor to create the table.
-- Env: SUPABASE_SERVICE_ROLE_KEY (server-only), NEXT_PUBLIC_SUPABASE_URL

CREATE TABLE IF NOT EXISTS proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id INTEGER NOT NULL,
  owner_address TEXT NOT NULL,
  user_id UUID,
  file_hash TEXT NOT NULL,
  "timestamp" BIGINT NOT NULL,
  block_number BIGINT NOT NULL,
  arweave_tx_id TEXT NOT NULL,
  ipfs_cid TEXT,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(chain_id, file_hash)
);

CREATE INDEX IF NOT EXISTS idx_proofs_owner_chain ON proofs(owner_address, chain_id);
CREATE INDEX IF NOT EXISTS idx_proofs_user_id ON proofs(user_id);

-- Optional RLS: enable if you use anon key and auth.
ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own proofs" ON proofs FOR SELECT USING (owner_address = current_setting('request.jwt.claim.wallet', true));
CREATE POLICY "Users can insert own proofs" ON proofs FOR INSERT WITH CHECK (owner_address = current_setting('request.jwt.claim.wallet', true));

-- -----------------------------------------------------------------------------
-- Evidence: user-scoped metadata records
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  file_hash TEXT NOT NULL,
  title TEXT,
  description TEXT,
  case_id TEXT,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_user_id ON public.evidence(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_file_hash ON public.evidence(file_hash);

-- -----------------------------------------------------------------------------
-- Events: evidence lifecycle timeline
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  file_hash TEXT NOT NULL,
  event_type TEXT NOT NULL,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data JSONB
);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_file_hash ON public.events(file_hash);

-- -----------------------------------------------------------------------------
-- Profiles: SaaS identity layer for Supabase-auth users
-- -----------------------------------------------------------------------------
-- This table extends auth.users with app-specific profile fields.
-- Run this in the Supabase SQL editor in the same project as auth.

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY, -- references auth.users.id
  email TEXT,
  primary_wallet_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep a fast lookup for wallet → user
CREATE INDEX IF NOT EXISTS idx_profiles_primary_wallet ON public.profiles (primary_wallet_address);

-- RLS: each user can only see and modify their own profile row
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "User can upsert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "User can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- Organizations & team support (SaaS foundation)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug) WHERE slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'contributor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_organization_id ON public.memberships(organization_id);

-- -----------------------------------------------------------------------------
-- API keys (developer platform)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(key_prefix)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);

-- -----------------------------------------------------------------------------
-- Subscriptions (billing foundation)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
