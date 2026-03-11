export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://green-high-bat-939.mypinata.cloud/ipfs/";

export function getIpfsUrl(cid: string): string {
  const base = IPFS_GATEWAY.endsWith("/") ? IPFS_GATEWAY : `${IPFS_GATEWAY}/`;
  return `${base}${cid}`;
}
