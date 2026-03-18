import Link from "next/link";
import {
  ClockIcon,
  CloudArrowUpIcon,
  CpuChipIcon,
  FingerPrintIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { AppLogo } from "~~/components/AppLogo";

export default function AboutPage() {
  const values = [
    {
      name: "Permanent Storage",
      description:
        "Leveraging Arweave's permaweb, your files are stored for 200+ years. No monthly fees, no risk of deletion.",
      icon: ClockIcon,
    },
    {
      name: "Zero-Knowledge Privacy",
      description:
        "We never see your files. Encryption happens client-side, and we only store cryptographic commitments.",
      icon: LockClosedIcon,
    },
    {
      name: "On-Chain Verifiability",
      description: "Every file proof is anchored to the Base L2 blockchain, providing immutable timestamping.",
      icon: ShieldCheckIcon,
    },
    {
      name: "Biometric Identity",
      description: "Access your vault with decentralized identity and biometric-secured keys.",
      icon: FingerPrintIcon,
    },
    {
      name: "Decentralized Infrastructure",
      description: "No single point of failure. Your data lives on a distributed network, not a corporate server.",
      icon: CloudArrowUpIcon,
    },
    {
      name: "ZK-Proof Generation",
      description: "Generate mathematical proofs of existence without revealing the sensitive content itself.",
      icon: CpuChipIcon,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden border-b border-base-200">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -z-10" />

        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <AppLogo className="h-20 w-20 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-base-content to-primary">
            Aeternum: The Immortal Vault
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-base-content/60 leading-relaxed">
            In a digital world that forgets, Aeternum remembers. We provide a private, permanent, and zero-knowledge
            verifiable environment for your most critical records.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-base-200/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <div className="space-y-4 text-base-content/70">
                  <p>
                    Aeternum was built on the belief that digital legacy should be as durable as physical evidence, but
                    far more secure.
                  </p>
                  <p>
                    Traditional storage providers can lose your data, go bankrupt, or succumb to censorship. Aeternum
                    removes these human vulnerabilities by using mathematics and decentralized protocols.
                  </p>
                  <p className="font-bold text-primary italic">
                    &quot;Your evidence, protected by code, anchored in eternity.&quot;
                  </p>
                </div>
              </div>
              <div className="bg-base-100 p-8 rounded-3xl shadow-xl border border-base-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShieldCheckIcon className="h-32 w-32" />
                </div>
                <h3 className="text-xl font-bold mb-4 relative z-10">Total Sovereignty</h3>
                <p className="text-sm text-base-content/60 relative z-10">
                  We empower whistleblowers, journalists, legal professionals, and individuals to secure their truth
                  without fear of tampering or loss.
                </p>
                <div className="mt-8 flex gap-2">
                  <div className="h-1 w-12 bg-primary rounded-full" />
                  <div className="h-1 w-4 bg-primary/30 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features/Values Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Core Principles</h2>
            <p className="text-base-content/60">
              The pillars that make Aeternum the gold standard for evidence storage.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map(value => (
              <div
                key={value.name}
                className="p-8 rounded-2xl bg-base-100 border border-base-200 hover:border-primary/30 transition-all hover:shadow-lg group"
              >
                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.name}</h3>
                <p className="text-sm text-base-content/60 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 border-t border-base-200">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-[3rem] p-12 text-center text-primary-content relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-black mb-6">Ready to secure your truth?</h2>
              <p className="mb-10 text-primary-content/80 text-lg">
                Join thousands of users who trust Aeternum for permanent and private record keeping.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/vault" className="btn btn-neutral btn-lg border-primary-content/20 rounded-full px-8">
                  Enter the Vault
                </Link>
                <Link href="/plans" className="btn btn-ghost btn-lg underline rounded-full px-8">
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
