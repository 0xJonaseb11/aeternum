import { useState } from "react";
import { decryptFile } from "~~/utils/vault/crypto";
import { notification } from "~~/utils/scaffold-eth";

export const useRecover = () => {
    const [isRecovering, setIsRecovering] = useState(false);

    const recoverFile = async (storageId: string, secret: string, fileName: string = "recovered_evidence") => {
        setIsRecovering(true);
        try {
            // 1. Fetch from Arweave (proxy through gateway)
            const url = `https://arweave.net/${storageId}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch from storage");

            const combined = await response.arrayBuffer();

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
