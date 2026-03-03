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
  try {
    const base = indexerUrl.replace(/\/$/, "").replace(/\/graphql$/i, "");
    const url = `${base}/graphql`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: PROOFS_QUERY,
        variables: { owner: owner.toLowerCase(), chainId },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Indexer (Ponder) failed ${res.status}: ${res.status === 404 ? "GraphQL endpoint not found; ensure Ponder has src/api/index.ts with graphql middleware" : text || res.statusText}`,
      );
    }
    const json = (await res.json()) as {
      data?: { proofs?: { items?: IndexedProof[] } };
      errors?: Array<{ message: string }>;
    };
    if (json.errors?.length) {
      throw new Error(`Indexer query error: ${json.errors[0]?.message ?? "unknown"}`);
    }
    const items = json.data?.proofs?.items ?? [];
    return items;
  } catch {
    return [];
  }
}

export function useIndexedProofs(owner: `0x${string}` | undefined, chainId: number, indexerUrl: string | undefined) {
  return useQuery({
    queryKey: ["indexedProofs", owner, chainId, indexerUrl],
    queryFn: () => fetchProofsFromIndexer(indexerUrl!, owner!, chainId),
    enabled: Boolean(indexerUrl && owner),
    staleTime: 30_000,
    retry: 1,
  });
}
