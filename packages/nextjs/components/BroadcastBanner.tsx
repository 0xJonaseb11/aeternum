"use client";

import { useEffect, useState } from "react";
import { MegaphoneIcon, XMarkIcon } from "@heroicons/react/24/outline";

export const BroadcastBanner = () => {
  const [broadcast, setBroadcast] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchBroadcast = async () => {
      try {
        const res = await fetch("/api/broadcast");
        const data = await res.json();
        if (data.broadcast) {
          const dismissedId = localStorage.getItem("aeternum_dismissed_broadcast");
          if (dismissedId !== data.broadcast.title + data.broadcast.sent_at) {
            setBroadcast(data.broadcast);
            setVisible(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch broadcast:", err);
      }
    };

    fetchBroadcast();
  }, []);

  const handleDismiss = () => {
    if (broadcast) {
      localStorage.setItem("aeternum_dismissed_broadcast", broadcast.title + broadcast.sent_at);
    }
    setVisible(false);
  };

  if (!visible || !broadcast) return null;

  const bgClass =
    broadcast.type === "warning"
      ? "bg-warning text-warning-content shadow-warning/20"
      : broadcast.type === "error"
        ? "bg-error text-error-content shadow-error/20"
        : broadcast.type === "success"
          ? "bg-success text-success-content shadow-success/20"
          : "bg-primary text-primary-content shadow-primary/20";

  return (
    <div
      className={`w-full py-2 px-4 shadow-xl border-b border-black/10 flex items-center justify-center gap-4 relative z-[100] animate-in fade-in slide-in-from-top-4 duration-700 ${bgClass}`}
    >
      <div className="flex items-center gap-3 max-w-5xl overflow-hidden truncate">
        <div className="bg-white/20 p-1 rounded-md shrink-0">
          <MegaphoneIcon className="h-3.5 w-3.5 shrink-0" />
        </div>
        <div className="flex items-center gap-2 truncate">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 shrink-0">Announcement</span>
          <div className="h-3 w-px bg-current opacity-20 hidden sm:block"></div>
          <span className="text-sm font-black truncate">{broadcast.title}</span>
          <span className="text-sm opacity-90 truncate font-medium">— {broadcast.content}</span>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors flex items-center justify-center"
      >
        <XMarkIcon className="h-3.5 w-3.5 stroke-[3]" />
      </button>
    </div>
  );
};
