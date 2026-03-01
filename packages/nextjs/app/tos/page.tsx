import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeftIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Terms of Service | Aeternum",
  description: "Terms of service for Aeternum Evidence Vault.",
};

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col grow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-base-content/60 hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-10">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-content">
            <LockClosedIcon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-base-content">Terms of Service</h1>
            <p className="text-sm text-base-content/50">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none text-base-content/80 space-y-6">
          <p>
            By using Aeternum Evidence Vault (&quot;the Service&quot;), you agree to these terms. If you do not agree,
            do not use the Service.
          </p>

          <h2 className="text-lg font-bold text-base-content mt-8">Use of the Service</h2>
          <p>
            The Service allows you to encrypt files locally, store them on decentralized networks, and create on-chain
            proofs of ownership. You are responsible for securing your private keys and secret keys. Loss of keys may
            result in permanent loss of access to your encrypted data.
          </p>

          <h2 className="text-lg font-bold text-base-content mt-8">No warranty</h2>
          <p>
            The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee availability,
            accuracy, or suitability for any purpose. Use of blockchain and third-party storage is at your own risk.
          </p>

          <h2 className="text-lg font-bold text-base-content mt-8">Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, the project and its contributors shall not be liable for any damages
            arising from your use of the Service, including loss of data or funds.
          </p>

          <h2 className="text-lg font-bold text-base-content mt-8">Changes</h2>
          <p>
            We may update these terms. Continued use of the Service after changes constitutes acceptance of the updated
            terms.
          </p>
        </div>
      </div>
    </div>
  );
}
