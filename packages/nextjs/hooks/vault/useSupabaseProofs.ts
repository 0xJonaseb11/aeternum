import { useQuery } from "@tanstack/react-query";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

export interface SupabaseProofItem {
  id: string;
  proofId?: string;
  fileHash: string;
  owner: string;
  timestamp: number;
  blockNumber: number;
  arweaveTxId: string;
  ipfsCid: string | null;
  revoked: boolean;
}

export type ProofsSearchParams = {
  search?: string;
  caseId?: string;
  tags?: string[];
  dateFrom?: number;
  dateTo?: number;
};

async function fetchProofsFromSupabase({
  owner,
  userId,
  organizationId,
  chainId,
  accessToken,
  searchParams,
}: {
  owner?: `0x${string}`;
  userId?: string;
  organizationId?: string | null;
  chainId: number;
  accessToken?: string | null;
  searchParams?: ProofsSearchParams;
}): Promise<SupabaseProofItem[]> {
  const params = new URLSearchParams({ chainId: String(chainId) });
  if (userId) {
    params.set("userId", userId);
    if (organizationId) params.set("organizationId", organizationId ?? "");
    if (searchParams?.search?.trim()) params.set("search", searchParams.search.trim());
    if (searchParams?.caseId?.trim()) params.set("caseId", searchParams.caseId.trim());
    if (searchParams?.tags?.length) params.set("tags", searchParams.tags.join(","));
    if (searchParams?.dateFrom != null) params.set("dateFrom", String(searchParams.dateFrom));
    if (searchParams?.dateTo != null) params.set("dateTo", String(searchParams.dateTo));
  } else if (owner) {
    params.set("owner", owner.toLowerCase());
  }
  const headers: HeadersInit = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(`/api/proofs?${params}`, { headers });
  if (res.status === 503) {
    throw new Error("Supabase not configured");
  }
  if (res.status === 401) {
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    throw new Error(`Proofs API failed: ${res.status}`);
  }
  const json = (await res.json()) as { items?: SupabaseProofItem[] };
  return json.items ?? [];
}

export function useSupabaseProofs(
  owner: `0x${string}` | undefined,
  chainId: number,
  enabled: boolean,
  organizationId?: string | null,
  searchParams?: ProofsSearchParams,
) {
  const { user, session } = useSupabaseAuth();
  const userId = user?.id;
  const accessToken = session?.access_token;

  return useQuery({
    queryKey: ["supabaseProofs", owner, userId, organizationId, chainId, searchParams],
    queryFn: () =>
      fetchProofsFromSupabase({
        owner: owner!,
        userId,
        organizationId,
        chainId,
        accessToken,
        searchParams,
      }),
    enabled: enabled && Boolean(owner),
    staleTime: 30_000,
    retry: 1,
  });
}
