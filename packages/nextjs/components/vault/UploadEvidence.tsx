import { useEffect, useRef, useState } from "react";
import {
  CheckCircleIcon,
  ClipboardIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useFolders } from "~~/hooks/useFolders";
import { useVault } from "~~/hooks/vault/useVault";
import type { VaultScope } from "~~/hooks/vault/useVaultScope";
import { notification } from "~~/utils/scaffold-eth";

interface UploadResult {
  fileHash: string;
  secret: string;
  arweaveTxId: string;
  ipfsCid: string;
}

export const UploadEvidence = ({ scope }: { scope?: VaultScope }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [secretSavedConfirmed, setSecretSavedConfirmed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!result || secretSavedConfirmed) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [result, secretSavedConfirmed]);

  const organizationId = scope?.type === "org" ? scope.orgId : undefined;
  const { uploadEvidence, isProcessing, step } = useVault(organizationId);
  const { data: folders } = useFolders(organizationId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [folderId, setFolderId] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) setTitle(selectedFile.name);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      if (!title) setTitle(selectedFile.name);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    setSecretSavedConfirmed(false);
    setTitle("");
    setDescription("");
    setTags("");
    setFolderId("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      const uploadResult = await uploadEvidence(file, {
        title: title || file.name,
        description: description || undefined,
        tags: tags
          ? tags
              .split(",")
              .map(t => t.trim())
              .filter(Boolean)
          : undefined,
        folderId: folderId || null,
      });
      if (uploadResult) setResult(uploadResult);
    } catch (err) {
      console.error("Upload failed:", err);
      notification.error("Upload failed, please try again");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStepText = () => {
    switch (step) {
      case "encrypting":
        return "Encrypting locally...";
      case "uploading_arweave":
        return "Uploading to Arweave...";
      case "uploading_ipfs":
        return "Uploading to IPFS...";
      case "confirming":
        return "Executing transaction...";
      default:
        return "Encrypt & Proof Evidence";
    }
  };

  if (result) {
    return (
      <div className="card bg-base-100 border border-success/30 shadow-lg overflow-hidden animate-in fade-in zoom-in duration-300 min-w-0">
        <div className="card-body p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircleIcon className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-base-content leading-none">Evidence Secured!</h3>
              <p className="text-sm text-base-content/50 mt-1">Your file has been encrypted and proofed on-chain.</p>
            </div>
          </div>

          <div className="space-y-4 min-w-0">
            <div className="p-3 sm:p-4 bg-base-200 rounded-xl border border-base-300 min-w-0 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-base-content/50 shrink-0">
                  <KeyIcon className="h-3.5 w-3.5" />
                  <span>Private secret key</span>
                </div>
                <span className="badge badge-error badge-xs p-2 text-[8px] font-bold shrink-0">
                  CRITICAL: SAVE OFFLINE
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 min-w-0">
                <code className="text-xs sm:text-sm font-mono text-primary break-all bg-base-100 px-2 py-1 rounded min-w-0 overflow-hidden">
                  {result.secret}
                </code>
                <button
                  onClick={() => copyToClipboard(result.secret)}
                  className="btn btn-ghost btn-xs btn-circle text-base-content/30 hover:text-primary"
                >
                  <ClipboardIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-base-200 rounded-xl border border-base-300 min-w-0 overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-base-content/40 mb-1 block">File Hash</span>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-[10px] font-mono truncate text-base-content/70">{result.fileHash}</code>
                  <button
                    onClick={() => copyToClipboard(result.fileHash)}
                    className="btn btn-ghost btn-xs btn-circle text-base-content/30"
                  >
                    <ClipboardIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="p-3 sm:p-4 bg-base-200 rounded-xl border border-base-300 min-w-0 overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-base-content/40 mb-1 block">Arweave ID</span>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-[10px] font-mono truncate text-base-content/70">{result.arweaveTxId}</code>
                  <button
                    onClick={() => copyToClipboard(result.arweaveTxId)}
                    className="btn btn-ghost btn-xs btn-circle text-base-content/30"
                  >
                    <ClipboardIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="p-3 sm:p-4 bg-base-200 rounded-xl border border-base-300 min-w-0 overflow-hidden sm:col-span-2 md:col-span-1">
                <span className="text-[10px] uppercase font-bold text-base-content/40 mb-1 block">IPFS CID</span>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-[10px] font-mono truncate text-base-content/70">{result.ipfsCid}</code>
                  <button
                    onClick={() => copyToClipboard(result.ipfsCid)}
                    className="btn btn-ghost btn-xs btn-circle text-base-content/30"
                  >
                    <ClipboardIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-warning/10 border border-warning/30 rounded-xl">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={secretSavedConfirmed}
                onChange={e => setSecretSavedConfirmed(e.target.checked)}
                className="checkbox checkbox-warning checkbox-sm mt-0.5 shrink-0"
              />
              <span className="text-sm font-medium text-base-content">
                I have saved my secret key offline in a safe place. I understand that without it I cannot recover this
                evidence.
              </span>
            </label>
          </div>

          <button
            onClick={removeFile}
            disabled={!secretSavedConfirmed}
            className="btn btn-outline btn-block mt-6"
            title={secretSavedConfirmed ? undefined : "Confirm you have saved your secret key above"}
          >
            Secure Another File
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden min-w-0">
      <div className="card-body p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CloudArrowUpIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-base-content leading-none">Upload New Evidence</h3>
            <p className="text-xs text-base-content/50 mt-1 uppercase tracking-widest font-bold flex items-center gap-2">
              <span>Secure Local Encryption</span>
              <span className="badge badge-primary badge-xs py-2 px-2 text-[8px] font-bold">ZK-READY</span>
            </p>
            {scope?.type === "org" ? (
              <p className="text-[11px] text-base-content/60 mt-1 flex items-center gap-1.5">
                <UserGroupIcon className="h-3.5 w-3.5 text-primary" />
                <span>
                  Evidence will be owned by team <span className="font-semibold">{scope.name}</span>.
                </span>
              </p>
            ) : (
              <p className="text-[11px] text-base-content/60 mt-1">
                Evidence will be owned by your personal vault only.
              </p>
            )}
          </div>
        </div>

        {!file ? (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`
              relative border-2 border-dashed rounded-2xl p-6 sm:p-8 md:p-12 transition-all duration-200 text-center min-w-0
              ${isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-base-300 bg-base-200/30 hover:bg-base-200/50"}
            `}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-base-100 rounded-full flex items-center justify-center shadow-sm mb-3 sm:mb-4 border border-base-300">
                <DocumentIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-base-content/20" />
              </div>
              <p className="text-sm sm:text-base font-medium mb-1">
                <span className="text-primary font-bold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs sm:text-sm text-base-content/40">
                Documents, images, video, or audio, any evidence up to 50MB
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-base-200/50 rounded-2xl p-4 sm:p-6 border border-base-300 animate-in slide-in-from-bottom duration-300 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-primary-content rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                  <DocumentIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-base-content truncate max-w-[140px] sm:max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-base-content/40">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              </div>
              <button
                onClick={removeFile}
                disabled={isProcessing}
                className="btn btn-ghost btn-circle btn-sm text-base-content/30 hover:text-error"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-base-300 space-y-4">
              <div className="flex flex-col gap-4 bg-base-100/50 p-4 rounded-xl border border-base-300">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-base-content/50 px-1">
                    Evidence Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter a descriptive title..."
                    className="input input-bordered input-sm w-full"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-base-content/50 px-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Optional details about this evidence..."
                    className="textarea textarea-bordered textarea-sm w-full leading-tight"
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-base-content/50 px-1">
                      Folder
                    </label>
                    <select
                      className="select select-bordered select-sm w-full"
                      value={folderId}
                      onChange={e => setFolderId(e.target.value)}
                    >
                      <option value="">No folder</option>
                      {(folders ?? []).map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-base-content/50 px-1">
                      Tags
                    </label>
                    <input
                      type="text"
                      placeholder="tag1, tag2..."
                      className="input input-bordered input-sm w-full font-mono"
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>AES-256-GCM Encryption Ready</span>
                </div>
              </div>

              {isProcessing && (
                <div className="mb-4 p-4 bg-base-200/80 rounded-xl border border-base-300 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50 mb-3">
                    Current step
                  </p>
                  {[
                    { key: "encrypting", label: "Encrypting locally" },
                    { key: "uploading_arweave", label: "Uploading to Arweave" },
                    { key: "uploading_ipfs", label: "Uploading to IPFS" },
                    { key: "confirming", label: "Executing transaction" },
                  ].map(({ key, label }, i) => {
                    const isCurrent = step === key;
                    const isPast =
                      (key === "encrypting" && ["uploading_arweave", "uploading_ipfs", "confirming"].includes(step)) ||
                      (key === "uploading_arweave" && ["uploading_ipfs", "confirming"].includes(step)) ||
                      (key === "uploading_ipfs" && step === "confirming");
                    return (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            isPast
                              ? "bg-success/20 text-success"
                              : isCurrent
                                ? "bg-primary text-primary-content animate-pulse"
                                : "bg-base-300 text-base-content/40"
                          }`}
                        >
                          {isPast ? "✓" : i + 1}
                        </span>
                        <span
                          className={
                            isCurrent
                              ? "font-bold text-primary"
                              : isPast
                                ? "text-base-content/60"
                                : "text-base-content/40"
                          }
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={isProcessing}
                className={`btn btn-primary w-full gap-2 ${isProcessing ? "loading" : ""}`}
              >
                {!isProcessing && <ShieldCheckIcon className="h-5 w-5" />}
                <span>{getStepText()}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
