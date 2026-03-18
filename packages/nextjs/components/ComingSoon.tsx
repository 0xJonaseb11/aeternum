"use client";

import Link from "next/link";
import { CheckCircleIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";

export default function ComingSoon({ title = "Documentation" }: { title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-primary/10 p-6 rounded-full mb-8">
        <RocketLaunchIcon className="h-12 w-12 text-primary animate-bounce" />
      </div>
      <h1 className="text-4xl font-black mb-4">{title} Coming Soon</h1>
      <p className="text-base-content/60 max-w-md mx-auto mb-10 leading-relaxed">
        We&apos;re currently perfecting our technical documentation to ensure you have the best experience building on
        Aeternum. Check back soon for guides, API references, and ZK-proof tutorials.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Link href="/" className="btn btn-primary rounded-2xl px-8">
          Back to Home
        </Link>
        <Link href="/help" className="btn btn-ghost rounded-2xl px-8 border border-base-300">
          Visit Help Center
        </Link>
      </div>

      <div className="mt-16 pt-8 border-t border-base-200 w-full max-w-lg">
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 mb-4">What to expect</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-xs font-medium opacity-60">
            <CheckCircleIcon className="h-4 w-4 text-success" /> SDK Documentation
          </div>
          <div className="flex items-center gap-2 text-xs font-medium opacity-60">
            <CheckCircleIcon className="h-4 w-4 text-success" /> ZK-Proof Guides
          </div>
          <div className="flex items-center gap-2 text-xs font-medium opacity-60">
            <CheckCircleIcon className="h-4 w-4 text-success" /> API Reference
          </div>
          <div className="flex items-center gap-2 text-xs font-medium opacity-60">
            <CheckCircleIcon className="h-4 w-4 text-success" /> Arweave Integration
          </div>
        </div>
      </div>
    </div>
  );
}
