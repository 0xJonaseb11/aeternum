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
