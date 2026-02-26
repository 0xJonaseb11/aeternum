import { useRef, useState } from "react";
import {
  CheckCircleIcon,
  ClipboardIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  KeyIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useVault } from "~~/hooks/vault/useVault";

interface UploadResult {
  fileHash: string;
  secret: string;
  arweaveTxId: string;
}

export const UploadEvidence = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadEvidence, isProcessing, step } = useVault();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
      setFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      const uploadResult = await uploadEvidence(file);
      setResult(uploadResult);
    } catch (e) {
      // Error handled in hook
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStepText = () => {
    switch (step) {
      case "encrypting":
        return "Encrypting Locally...";
      case "uploading":
        return "Storing Decentralized...";
      case "confirming":
        return "Confirming On-chain...";
      default:
        return "Encrypt & Proof Evidence";
    }
  };

  if (result) {
    return (
      <div className="card bg-base-100 border border-success/30 shadow-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="card-body p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircleIcon className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-base-content leading-none">Evidence Secured!</h3>
              <p className="text-sm text-base-content/50 mt-1">Your file has been encrypted and proofed on-chain.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-base-200 rounded-xl border border-base-300">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-base-content/50">
                  <KeyIcon className="h-3.5 w-3.5" />
                  <span>Private Secret Key</span>
                </div>
                <span className="badge badge-error badge-xs p-2 text-[8px] font-bold">CRITICAL: SAVE OFFLINE</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm font-mono text-primary break-all bg-base-100 px-2 py-1 rounded">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-base-200 rounded-xl border border-base-300">
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
              <div className="p-4 bg-base-200 rounded-xl border border-base-300">
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
            </div>
          </div>

          <button onClick={removeFile} className="btn btn-outline btn-block mt-8">
            Secure Another File
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
      <div className="card-body p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CloudArrowUpIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-base-content leading-none">Upload New Evidence</h3>
            <p className="text-xs text-base-content/50 mt-1 uppercase tracking-widest font-bold flex items-center gap-2">
              <span>Secure Local Encryption</span>
              <span className="badge badge-primary badge-xs py-2 px-2 text-[8px] font-bold">ZK-READY</span>
            </p>
          </div>
        </div>

        {!file ? (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`
              relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 text-center
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
              <div className="w-16 h-16 bg-base-100 rounded-full flex items-center justify-center shadow-sm mb-4 border border-base-300">
                <DocumentIcon className="h-8 w-8 text-base-content/20" />
              </div>
              <p className="text-base font-medium mb-1">
                <span className="text-primary font-bold">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-base-content/40">Any file up to 50MB</p>
            </div>
          </div>
        ) : (
          <div className="bg-base-200/50 rounded-2xl p-6 border border-base-300 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary text-primary-content rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <DocumentIcon className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base-content truncate max-w-[200px]">{file.name}</span>
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

            <div className="mt-8 pt-6 border-t border-base-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>AES-256-GCM Encryption Ready</span>
                </div>
              </div>
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
