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
          // Check if this broadcast ID has been dismissed
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
      ? "bg-[#b45309] text-white" // Deep Amber/Orange from screenshot
      : broadcast.type === "error"
        ? "bg-error text-error-content"
        : broadcast.type === "success"
          ? "bg-success text-success-content"
          : "bg-[#d81b60] text-white"; // Vibrant Magenta from screenshot

  return (
    <div
      className={`w-full py-1.5 px-4 shadow-lg border-b border-black/20 flex items-center justify-center gap-4 relative z-[100] animate-in fade-in slide-in-from-top-4 duration-500 ${bgClass}`}
    >
      <div className="flex items-center gap-2 max-w-5xl overflow-hidden truncate">
        <MegaphoneIcon className="h-4 w-4 shrink-0" />
        <span className="text-xs font-black uppercase tracking-widest opacity-60 shrink-0">Update</span>
        <span className="text-sm font-bold truncate">{broadcast.title}:</span>
        <span className="text-sm opacity-90 truncate">{broadcast.content}</span>
      </div>
      <button onClick={handleDismiss} className="btn btn-ghost btn-xs btn-circle opacity-60 hover:opacity-100">
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
