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

/**
 * Uploads data to Arweave.
 * Primary recommendation is to use Irys (Bundlr) for Web3 apps.
 * This is a placeholder for the integration.
 */
export const uploadToArweave = async (data: ArrayBuffer): Promise<string> => {
  console.log("Arweave upload initiated (Placeholder)");
  // Simulation of Arweave TxID (43 characters)
  const mockTxId = "MOCK_ARWEAVE_TXID_" + Math.random().toString(36).substring(2, 28);
  return mockTxId.padEnd(43, "X");
};

/**
 * Helper to get the public URL for a storage ID (uses Pinata gateway for IPFS).
 */
export const getStorageUrl = (id: string, type: "ipfs" | "arweave"): string => {
  if (type === "ipfs") return getIpfsUrl(id);
  return `https://arweave.net/${id}`;
};
