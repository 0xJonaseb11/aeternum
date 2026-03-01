import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  if (!client) {
    client = createClient(url, serviceKey);
  }
  return client;
}

export type ProofRow = {
  id: string;
  chain_id: number;
  owner_address: string;
  file_hash: string;
  timestamp: number;
  block_number: number;
  arweave_tx_id: string;
  ipfs_cid: string | null;
  revoked: boolean;
  created_at: string;
};
