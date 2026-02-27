import { PINATA_JWT, getIpfsUrl } from "~~/utils/vault/ipfsConfig";

/**
 * Service for decentralized storage uploads.
 * IPFS: Pinata gateway for backup; uploads go only to Pinata (requires NEXT_PUBLIC_PINATA_JWT).
 */

const PINATA_PIN_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

async function uploadToPinata(data: ArrayBuffer): Promise<string> {
  if (!PINATA_JWT) throw new Error("Pinata JWT not configured");
  const blob = new Blob([data]);
  const form = new FormData();
  form.append("file", blob, "evidence.enc");
  const res = await fetch(PINATA_PIN_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: form,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinata upload failed: ${res.status} ${err}`);
  }
  const json = (await res.json()) as { IpfsHash?: string };
  if (!json.IpfsHash) throw new Error("Pinata did not return IpfsHash");
  return json.IpfsHash;
}

/**
 * Uploads a buffer to IPFS using Pinata. Requires NEXT_PUBLIC_PINATA_JWT and never falls back to Infura.
 */
export const uploadToIPFS = async (data: ArrayBuffer): Promise<string> => {
  if (!PINATA_JWT) {
    throw new Error("IPFS upload failed: NEXT_PUBLIC_PINATA_JWT is not configured.");
  }
  return uploadToPinata(data);
};

export const uploadToArweave = async (data: ArrayBuffer): Promise<string> => {
  const res = await fetch("/api/arweave-upload", {
    method: "POST",
    body: data,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => undefined);
    console.error("Arweave upload failed:", error ?? res.statusText);
    throw new Error("Arweave upload failed.");
  }
  const json = (await res.json()) as { txId?: string };
  if (!json.txId) {
    throw new Error("Arweave upload failed: missing txId.");
  }
  return json.txId;
};

/**
 * Helper to get the public URL for a storage ID (uses Pinata gateway for IPFS).
 */
export const getStorageUrl = (id: string, type: "ipfs" | "arweave"): string => {
  if (type === "ipfs") return getIpfsUrl(id);
  return `https://arweave.net/${id}`;
};
