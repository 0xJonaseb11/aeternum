"use client";

import { ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Portal } from "~~/components/Portal";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "error" | "warning" | "info";
  isLoading?: boolean;
  children?: ReactNode;
  disabled?: boolean;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
  children,
  disabled = false,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  const variantClass = {
    primary: "btn-primary",
    error: "btn-error",
    warning: "btn-warning",
    info: "btn-info",
  }[variant];

  return (
    <Portal>
      <div className="modal modal-open">
        <div className="modal-box relative border border-base-300 shadow-2xl glass bg-base-100/90 backdrop-blur-md">
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3 text-base-content/50 hover:text-base-content"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <div className="flex flex-col gap-4">
            <div className="pr-8">
              <h3 className="font-bold text-xl tracking-tight text-base-content">{title}</h3>
              <p className="py-2 text-sm text-base-content/60 leading-relaxed">{message}</p>
            </div>

            {children && <div className="py-2">{children}</div>}

            <div className="modal-action gap-2 mt-2">
              <button
                className="btn btn-ghost btn-sm h-10 px-6 rounded-xl font-bold uppercase tracking-wider text-base-content/40 hover:bg-base-200"
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelText}
              </button>
              <button
                className={`btn btn-sm h-10 px-8 rounded-xl font-bold uppercase tracking-wider ${variantClass} ${
                  isLoading ? "loading" : ""
                }`}
                onClick={onConfirm}
                disabled={isLoading || disabled}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
        <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      </div>
    </Portal>
  );
};
