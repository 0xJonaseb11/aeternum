"use client";

import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";

export default function StatusPage() {
  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      <Header />
      <main className="flex-grow flex flex-col">
        <div className="bg-base-100 border-b border-base-300 py-6 px-4">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-2xl font-black tracking-tight">System Status</h1>
            <p className="text-sm opacity-60">Real-time monitoring of Aeternum infrastructure and services.</p>
          </div>
        </div>
        <div className="flex-grow container mx-auto max-w-6xl py-8 px-4 flex">
          <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-base-300 flex-grow relative min-h-[600px]">
            <iframe
              src="https://aeternum.statuspage.io"
              className="absolute inset-0 w-full h-full border-0"
              title="Aeternum System Status"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
