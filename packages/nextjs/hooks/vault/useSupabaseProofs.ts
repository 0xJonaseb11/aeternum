import { useQuery } from "@tanstack/react-query";

export interface SupabaseProofItem {
  id: string;
  fileHash: string;
  owner: string;
  timestamp: number;
  blockNumber: number;
  arweaveTxId: string;
  ipfsCid: string | null;
  revoked: boolean;
}

async function fetchProofsFromSupabase(
  owner: `0x${string}`,
  chainId: number,
): Promise<SupabaseProofItem[]> {
  const params = new URLSearchParams({ owner: owner.toLowerCase(), chainId: String(chainId) });
  const res = await fetch(`/api/proofs?${params}`);
  if (res.status === 503) {
    throw new Error("Supabase not configured");
  }
  if (!res.ok) {
    throw new Error(`Proofs API failed: ${res.status}`);
  }
  const json = (await res.json()) as { items?: SupabaseProofItem[] };
  return json.items ?? [];
}

/**
 * Fetches proof list from Supabase via GET /api/proofs (when indexer is not used).
 * Use when NEXT_PUBLIC_INDEXER_URL is not set; fall back to event history on error or 503.
 */
export function useSupabaseProofs(owner: `0x${string}` | undefined, chainId: number, enabled: boolean) {
  return useQuery({
    queryKey: ["supabaseProofs", owner, chainId],
    queryFn: () => fetchProofsFromSupabase(owner!, chainId),
    enabled: enabled && Boolean(owner),
    staleTime: 30_000,
    retry: 1,
  });
}
