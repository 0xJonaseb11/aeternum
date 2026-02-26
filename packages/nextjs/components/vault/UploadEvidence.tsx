"use client";

import { useRef, useState } from "react";
import { CloudArrowUpIcon, DocumentIcon, ShieldCheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export const UploadEvidence = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsEncrypting(true);
    // Simulation of encryption and upload
    setTimeout(() => {
      setIsEncrypting(false);
      // Logic for actual encryption and contract call will go here
    }, 2000);
  };

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
              <span className="badge badge-secondary badge-xs py-2 px-2 text-[8px] font-bold">FEAT INCOMING</span>
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
          <div className="bg-base-200/50 rounded-2xl p-6 border border-base-300">
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
                <span className="text-[10px] text-base-content/40 font-bold italic">Network integration pending</span>
              </div>
              <button
                onClick={handleUpload}
                disabled={isEncrypting}
                className={`btn btn-primary w-full gap-2 ${isEncrypting ? "loading" : ""}`}
              >
                {isEncrypting ? "" : <ShieldCheckIcon className="h-5 w-5" />}
                <span>{isEncrypting ? "Encrypting Locally..." : "Encrypt & Proof Evidence"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
