"use client";

import { useState } from "react";

export default function StatusPage() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="w-full h-screen bg-base-200 overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-100 z-10 transition-opacity">
          <p className="text-sm font-black opacity-30 uppercase tracking-[0.3em] animate-pulse">
            Loading Status Board...
          </p>
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
