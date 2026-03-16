import type { CertificateData } from "~~/utils/vault/certificatePdf";

/**
 * Certificate data as JSON for export (legal-friendly, machine-readable).
 * Matches the structure used in PDF; verificationUrl should point to the live page.
 */
export function certificateToJson(data: CertificateData): string {
  const payload = {
    issuer: "Aeternum",
    type: "Evidence Certificate",
    fileHash: data.fileHash,
    timestamp: data.timestamp,
    timestampUtc: new Date(data.timestamp * 1000).toISOString(),
    storageId: data.storageId,
    ipfsCid: data.ipfsCid ?? null,
    owner: data.owner ?? null,
    chainName: data.chainName ?? null,
    transactionHash: data.transactionHash ?? null,
    verificationUrl: data.verificationUrl ?? null,
    generatedAt: new Date().toISOString(),
  };
  return JSON.stringify(payload, null, 2);
}
