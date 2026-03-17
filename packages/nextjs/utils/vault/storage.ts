import { getIpfsUrl } from "~~/utils/vault/ipfsConfig";

/**
 * Upload encrypted data to IPFS via the server-side Pinata proxy.
 * Requires a Supabase session token for authentication (uploads cost storage credits).
 */
export const uploadToIPFS = async (data: ArrayBuffer, accessToken?: string): Promise<string> => {
  const headers: HeadersInit = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch("/api/ipfs-upload", {
    method: "POST",
    headers,
    body: data,
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => undefined);
    const message = (errorJson && (errorJson.error as string)) || `IPFS upload failed with status ${res.status}`;
    console.error("IPFS upload failed:", errorJson ?? res.statusText);
    throw new Error(message);
  }
  const json = (await res.json()) as { cid?: string };
  if (!json.cid) {
    throw new Error("IPFS upload failed: missing cid.");
  }
  return json.cid;
};

/**
 * Upload encrypted data to Arweave via the server-side Irys proxy.
 * Requires a Supabase session token for authentication (uploads cost real ETH).
 */
export const uploadToArweave = async (data: ArrayBuffer, accessToken?: string): Promise<string> => {
  const headers: HeadersInit = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch("/api/arweave-upload", {
    method: "POST",
    headers,
    body: data,
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => undefined);
    const message = (errorJson && (errorJson.error as string)) || `Arweave upload failed with status ${res.status}`;
    console.error("Arweave upload failed:", errorJson ?? res.statusText);
    throw new Error(message);
  }
  const json = (await res.json()) as { txId?: string };
  if (!json.txId) {
    throw new Error("Arweave upload failed: missing txId.");
  }
  return json.txId;
};

export const getStorageUrl = (id: string, type: "ipfs" | "arweave"): string => {
  if (type === "ipfs") return getIpfsUrl(id);
  return `https://arweave.net/${id}`;
};
