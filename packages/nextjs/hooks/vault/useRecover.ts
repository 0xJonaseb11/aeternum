import { useState } from "react";
import { decryptFile } from "~~/utils/vault/crypto";
import { notification } from "~~/utils/scaffold-eth";

const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

function isLikelyIpfsCid(id: string): boolean {
    if (!id || id.length < 20) return false;
    return id.startsWith("Qm") || id.startsWith("ba") || id.startsWith("k51") || /^[Qmb][a-zA-Z0-9]{40,}$/.test(id);
}

async function fetchFromStorage(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch from storage");
    return response.arrayBuffer();
}

export const useRecover = () => {
    const [isRecovering, setIsRecovering] = useState(false);

    const recoverFile = async (
        storageId: string,
        secret: string,
        fileName: string = "recovered_evidence",
        ipfsCid?: string,
    ) => {
        setIsRecovering(true);
        try {
            let combined: ArrayBuffer;
            if (isLikelyIpfsCid(storageId)) {
                combined = await fetchFromStorage(`${IPFS_GATEWAY}${storageId}`);
            } else {
                const arweaveUrl = `https://arweave.net/${storageId}`;
                try {
                    combined = await fetchFromStorage(arweaveUrl);
                } catch {
                    if (ipfsCid && isLikelyIpfsCid(ipfsCid)) {
                        combined = await fetchFromStorage(`${IPFS_GATEWAY}${ipfsCid}`);
                    } else {
                        throw new Error("Failed to fetch from storage");
                    }
                }
            }

            // 2. Decrypt locally
            const decrypted = await decryptFile(combined, secret);

            // 3. Create blob and download
            const blob = new Blob([decrypted]);
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);

            notification.success("Evidence recovered and decrypted successfully!");
        } catch (e) {
            console.error("Recovery Error:", e);
            notification.error("Failed to recover evidence. Ensure your secret key is correct.");
        } finally {
            setIsRecovering(false);
        }
    };

    return {
        recoverFile,
        isRecovering,
    };
};
