import { useQuery } from "@tanstack/react-query";

export interface IndexedProof {
  id: string;
  fileHash: string;
  owner: string;
  timestamp: number;
  blockNumber: number;
  arweaveTxId: string;
  ipfsCid: string | null;
  revoked: boolean;
}

const PROOFS_QUERY = `
  query ProofsByOwner($owner: String!, $chainId: Int!) {
    proofs(
      where: { owner: $owner, chainId: $chainId }
      orderBy: "timestamp"
      orderDirection: "desc"
      limit: 100
    ) {
      items {
        id
        fileHash
        owner
        timestamp
        blockNumber
        arweaveTxId
        ipfsCid
        revoked
      }
    }
  }
`;

async function fetchProofsFromIndexer(
  indexerUrl: string,
  owner: `0x${string}`,
  chainId: number,
): Promise<IndexedProof[]> {
  const url = indexerUrl.replace(/\/$/, "") + "/graphql";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: PROOFS_QUERY,
      variables: { owner: owner.toLowerCase(), chainId },
    }),
  });
  if (!res.ok) {
    throw new Error(`Indexer request failed: ${res.status}`);
  }
  const json = (await res.json()) as {
    data?: { proofs?: { items?: IndexedProof[] } };
    errors?: Array<{ message: string }>;
  };
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? "GraphQL error");
  }
  const items = json.data?.proofs?.items ?? [];
  return items;
}

/**
 * Fetches proof list from the Ponder indexer (when NEXT_PUBLIC_INDEXER_URL is set).
 * Use as primary data source in EvidenceList; fall back to useScaffoldEventHistory when unavailable.
 */
export function useIndexedProofs(owner: `0x${string}` | undefined, chainId: number, indexerUrl: string | undefined) {
  return useQuery({
    queryKey: ["indexedProofs", owner, chainId, indexerUrl],
    queryFn: () => fetchProofsFromIndexer(indexerUrl!, owner!, chainId),
    enabled: Boolean(indexerUrl && owner),
    staleTime: 30_000,
    retry: 1,
  });
}
