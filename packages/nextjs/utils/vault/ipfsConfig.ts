const PINATA_GATEWAY = "https://green-high-bat-939.mypinata.cloud/ipfs/";

export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://green-high-bat-939.mypinata.cloud/ipfs/";

export const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export function getIpfsUrl(cid: string): string {
  const base = IPFS_GATEWAY.endsWith("/") ? IPFS_GATEWAY : `${IPFS_GATEWAY}/`;
  return `${base}${cid}`;
}
