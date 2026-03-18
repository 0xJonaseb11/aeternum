import Link from "next/link";
import {
  ClockIcon,
  CloudArrowUpIcon,
  CpuChipIcon,
  FingerPrintIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

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
      <section className="relative py-24 lg:py-40 overflow-hidden border-b border-base-300 bg-base-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-70" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-base-200 border border-base-300 text-xs font-bold uppercase tracking-widest text-base-content/60 mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Our Digital Heritage
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9] text-base-content">
            Secure your <span className="text-primary">Truth</span>.<br />
            Forever.
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-2xl text-base-content/50 leading-relaxed font-medium mb-12">
            Aeternum is the world&apos;s first private, permanent, and zero-knowledge verifiable vault for your most
            critical digital records.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/vault" className="btn btn-primary btn-lg rounded-2xl px-12 shadow-xl shadow-primary/20">
              Get Started
            </Link>
            <Link href="/verify" className="btn btn-ghost btn-lg rounded-2xl px-8 hover:bg-base-200 transition-all">
              Verify Evidence
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 relative overflow-hidden bg-base-200/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -left-8 -top-8 text-[12rem] font-black text-primary/5 select-none leading-none">
                01
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight relative z-10">
                A Mission of <br />
                <span className="text-primary italic">Immutability</span>
              </h2>
              <div className="space-y-6 text-lg text-base-content/70 leading-relaxed">
                <p>
                  In an era of fleeting data and centralized control, your most important records deserve a sanctuary
                  that is immune to time, censorship, and corporate failure.
                </p>
                <p>
                  Aeternum leverages the power of mathematics and decentralized protocols to strip away human
                  vulnerabilities, ensuring your legacy is protected by code and anchored in eternity.
                </p>
              </div>

              <div className="mt-12 p-8 bg-base-100 rounded-3xl border border-base-300 shadow-sm relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-xl font-bold italic text-primary relative z-10">
                  &quot;Your evidence, protected by code, anchored in eternity.&quot;
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-xl group hover:-translate-y-2 transition-transform">
                  <ShieldCheckIcon className="h-10 w-10 text-primary mb-6" />
                  <h3 className="font-bold text-lg mb-2">Sovereignty</h3>
                  <p className="text-sm text-base-content/50">Only you hold the keys to your history.</p>
                </div>
                <div className="bg-primary p-8 rounded-3xl text-primary-content shadow-xl shadow-primary/20 group hover:-translate-y-2 transition-transform">
                  <LockClosedIcon className="h-10 w-10 mb-6" />
                  <h3 className="font-bold text-lg mb-2">Privacy</h3>
                  <p className="text-sm text-primary-content/70">Zero-knowledge proofs hide your data from us.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-xl group hover:-translate-y-2 transition-transform">
                  <ClockIcon className="h-10 w-10 text-primary mb-6" />
                  <h3 className="font-bold text-lg mb-2">Permatime</h3>
                  <p className="text-sm text-base-content/50">Stored for centuries on the Arweave network.</p>
                </div>
                <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-xl group hover:-translate-y-2 transition-transform">
                  <FingerPrintIcon className="h-10 w-10 text-primary mb-6" />
                  <h3 className="font-bold text-lg mb-2">Identity</h3>
                  <p className="text-sm text-base-content/50">On-chain verification for complete trust.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-20">
            <h2 className="text-4xl font-black mb-6">The Aeternum Standard</h2>
            <p className="text-xl text-base-content/60">
              We operate at the intersection of cryptography and permanence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {values.map(value => (
              <div key={value.name} className="group flex flex-col items-start bg-base-100 p-4 rounded-3xl">
                <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-primary/10 group-hover:bg-primary group-hover:text-primary-content group-hover:scale-110 transition-all duration-500">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors">{value.name}</h3>
                <p className="text-base-content/60 leading-relaxed font-medium">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA */}
      <section className="py-32 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="relative group p-12 lg:p-24 rounded-[3.5rem] bg-base-content text-base-100 overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-transparent opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="absolute top-0 right-0 p-12 opacity-5 select-none -z-0">
              <ShieldCheckIcon className="h-64 w-64" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Ready to secure your truth?</h2>
              <p className="text-xl md:text-2xl text-base-100/60 mb-12 font-medium">
                Join thousands of users who trust Aeternum for private, permanent record keeping.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
                <Link
                  href="/vault"
                  className="btn btn-primary btn-lg rounded-2xl px-12 h-16 text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20"
                >
                  Enter the Vault
                </Link>
                <Link
                  href="/plans"
                  className="btn btn-outline btn-lg rounded-2xl px-12 h-16 text-lg border-base-100/20 text-base-100 hover:bg-base-100 hover:text-base-content transition-all"
                >
                  Explore Plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
