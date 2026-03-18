"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon, ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface StatusSummary {
  page: {
    id: string;
    name: string;
    url: string;
  };
  incidents: Array<{
    id: string;
    name: string;
    status: string;
    impact: string;
    shortlink: string;
    updated_at: string;
  }>;
  status: {
    indicator: string;
    description: string;
  };
}

export const StatusAlert = () => {
  const [summary, setSummary] = useState<StatusSummary | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Statuspage.io public summary API
        const res = await fetch("https://aeternum.statuspage.io/api/v2/summary.json");
        if (!res.ok) return;
        const data: StatusSummary = await res.json();

        if (data.incidents && data.incidents.length > 0) {
          const activeIncident = data.incidents[0]; // Get the most recent one

          // Check if this incident ID has been dismissed
          const dismissedId = localStorage.getItem("aeternum_dismissed_incident");
          if (dismissedId !== activeIncident.id) {
            setSummary(data);
            setVisible(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch status:", err);
      }
    };

    fetchStatus();
    // Poll every 5 minutes
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    if (summary?.incidents?.[0]) {
      localStorage.setItem("aeternum_dismissed_incident", summary.incidents[0].id);
    }
    setVisible(false);
  };

  if (!visible || !summary || summary.incidents.length === 0) return null;

  const incident = summary.incidents[0];

  // Format the time since last update
  const lastUpdated = new Date(incident.updated_at);
  const timeDiff = Math.floor((new Date().getTime() - lastUpdated.getTime()) / (1000 * 60));
  const timeString = timeDiff < 60 ? `${timeDiff} minutes ago` : `${Math.floor(timeDiff / 60)} hours ago`;

  return (
    <div className="fixed bottom-6 left-6 z-[100] animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="w-[340px] bg-[#9a3412] text-white shadow-2xl border border-white/10 overflow-hidden">
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-lg leading-tight">{incident.name}</h3>
                <p className="text-[10px] uppercase tracking-wider font-bold opacity-70">Last updated {timeString}</p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-white/40 hover:text-white transition-colors cursor-pointer">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <Link
              href="/status"
              className="flex items-center justify-between text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all active:scale-95"
            >
              <span>View latest updates</span>
              <ArrowTopRightOnSquareIcon className="h-4 w-4 opacity-60" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
