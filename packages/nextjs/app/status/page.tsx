"use client";

import { useState } from "react";

export default function StatusPage() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="w-full h-screen bg-base-200 overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-100 z-10 animate-pulse">
          <div className="w-24 h-24 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
          <p className="text-sm font-bold opacity-40 uppercase tracking-widest">Loading Status Board...</p>
        </div>
      )}
      <iframe
        src="https://aeternum.statuspage.io"
        className={`w-full h-full border-0 transition-opacity duration-1000 ${loading ? "opacity-0" : "opacity-100"}`}
        title="Aeternum System Status"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}
