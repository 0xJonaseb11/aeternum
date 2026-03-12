import { useQuery } from "@tanstack/react-query";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

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

async function fetchProofsFromSupabase({
  owner,
  userId,
  chainId,
}: {
  owner?: `0x${string}`;
  userId?: string;
  chainId: number;
}): Promise<SupabaseProofItem[]> {
  const params = new URLSearchParams({ chainId: String(chainId) });
  if (userId) {
    params.set("userId", userId);
  } else if (owner) {
    params.set("owner", owner.toLowerCase());
  }
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

export function useSupabaseProofs(owner: `0x${string}` | undefined, chainId: number, enabled: boolean) {
  const { user } = useSupabaseAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ["supabaseProofs", owner, userId, chainId],
    queryFn: () => fetchProofsFromSupabase({ owner: owner!, userId, chainId }),
    enabled: enabled && Boolean(owner),
    staleTime: 30_000,
    retry: 1,
  });
}
