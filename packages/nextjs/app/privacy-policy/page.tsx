import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { AppLogo } from "~~/components/AppLogo";

export const metadata: Metadata = {
  title: "Privacy Policy | Aeternum",
  description: "Privacy policy for Aeternum Evidence Vault.",
};

export default function PrivacyPolicyPage() {
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
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-base-200 overflow-hidden">
            <AppLogo className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-base-content">Privacy Policy</h1>
            <p className="text-sm text-base-content/50">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none text-base-content/80 space-y-6">
          <p>
            Aeternum (&quot;we&quot;, &quot;our&quot;) is a zero-knowledge evidence vault. We are committed to
            protecting your privacy. This policy describes how we handle information in connection with the Aeternum
            application.
          </p>

          <h2 className="text-lg font-bold text-base-content mt-8">Information we do not collect</h2>
          <p>
            Encryption and hashing of your files are performed locally in your browser. We do not receive, store, or
            transmit the contents of your files. We do not collect personal data from your use of the vault.
          </p>

          <h2 className="text-lg font-bold text-base-content mt-8">Blockchain and third-party services</h2>
          <p>
            When you create a proof, transaction data (such as wallet address and proof metadata) is recorded on the
            blockchain and is public. Encrypted file data may be stored on decentralized networks (e.g. Arweave, IPFS).
            We do not control these networks. Your wallet provider and network RPC providers may log usage data
            according to their own policies.
          </p>

          <h2 className="text-lg font-bold text-base-content mt-8">Contact</h2>
          <p>
            For questions about this privacy policy, please open an issue or contact the project maintainers via the
            Aeternum repository.
          </p>
        </div>
      </div>
    </div>
  );
}
