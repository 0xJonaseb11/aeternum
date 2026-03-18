"use client";


export default function StatusPage() {
  return (
    <div className="w-full h-screen bg-base-200 overflow-hidden">
      <iframe
        src="https://aeternum.statuspage.io"
        className="w-full h-full border-0"
        title="Aeternum System Status"
      />
    </div>
  );
}
