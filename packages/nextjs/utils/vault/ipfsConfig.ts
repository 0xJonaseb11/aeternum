/**
 * IPFS config: Pinata gateway as primary for reliable backup and retrieval.
 * Set NEXT_PUBLIC_IPFS_GATEWAY to override (must end with /ipfs/).
 * Set NEXT_PUBLIC_PINATA_JWT to upload directly to your Pinata account (optional).
 */

const PINATA_GATEWAY = "https://green-high-bat-939.mypinata.cloud/ipfs/";

function getEnv(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  return (process as NodeJS.Process & { env?: Record<string, string> }).env?.[name];
}

export const IPFS_GATEWAY = getEnv("NEXT_PUBLIC_IPFS_GATEWAY") || PINATA_GATEWAY;

export const PINATA_JWT = getEnv("NEXT_PUBLIC_PINATA_JWT");

export function getIpfsUrl(cid: string): string {
  const base = IPFS_GATEWAY.endsWith("/") ? IPFS_GATEWAY : `${IPFS_GATEWAY}/`;
  return `${base}${cid}`;
}
