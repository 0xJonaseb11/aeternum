-- Proof metadata for reliable list retrieval by owner (no file content).
-- Run this in the Supabase SQL editor to create the table.
-- Env: SUPABASE_SERVICE_ROLE_KEY (server-only), NEXT_PUBLIC_SUPABASE_URL

CREATE TABLE IF NOT EXISTS proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id INTEGER NOT NULL,
  owner_address TEXT NOT NULL,
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

-- Optional RLS: enable if you use anon key and auth.
-- ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can read own proofs" ON proofs FOR SELECT USING (owner_address = current_setting('request.jwt.claim.wallet', true));
-- CREATE POLICY "Users can insert own proofs" ON proofs FOR INSERT WITH CHECK (owner_address = current_setting('request.jwt.claim.wallet', true));
