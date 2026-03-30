"use client";

import { useEffect, useState } from "react";
import { ConfirmationModal } from "~~/components/ui/ConfirmationModal";

interface RevokeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  fileHash: string;
}

export const RevokeConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  fileHash,
}: RevokeConfirmationModalProps) => {
  const [confirmText, setConfirmText] = useState("");
  const REQUIRED_TEXT = "revoke evidence";

  useEffect(() => {
    if (!isOpen) {
      setConfirmText("");
    }
  }, [isOpen]);

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Permanently Revoke Proof"
      message={`You are about to permanently revoke the ownership proof for evidence #${fileHash.slice(
        2,
        10,
      )}. This action is irreversible on-chain.`}
      confirmText="Revoke Proof"
      variant="error"
      isLoading={isLoading}
      disabled={(confirmText || "").trim().toLowerCase() !== REQUIRED_TEXT}
    >
      <div className="space-y-3 mt-2">
        <label
          htmlFor="revoke-confirm-input"
          className="text-[10px] font-bold uppercase tracking-widest text-base-content/40 px-1"
        >
          Type <span className="text-error italic lowercase">&quot;{REQUIRED_TEXT}&quot;</span> to confirm
        </label>
        <input
          id="revoke-confirm-input"
          type="text"
          className="input input-bordered w-full font-mono text-sm transition-all"
          placeholder={REQUIRED_TEXT}
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          autoFocus
        />
      </div>
    </ConfirmationModal>
  );
};
