import Image from "next/image";
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
    <div className="flex flex-col min-h-screen bg-base-100 selection:bg-primary/10 selection:text-primary">
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 lg:pt-20 lg:pb-16 overflow-hidden">
        {/* Advanced Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-60" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-10 animate-fade-in shadow-lg shadow-primary/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Our Digital Heritage
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight text-base-content">
              Secure your <span className="text-primary italic">Truth</span>.
              <br />
              Forever.
            </h1>

            <p className="max-w-xl text-base md:text-lg text-base-content/60 leading-relaxed font-medium mb-10">
              Aeternum is the world&apos;s first private, permanent, and zero-knowledge verifiable vault for your most
              critical digital records.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full">
              <Link
                href="/vault"
                className="btn btn-primary btn-lg rounded-2xl px-12 h-16 text-lg shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
              >
                Get Started
              </Link>
              <Link
                href="/verify"
                className="btn glass btn-lg rounded-2xl px-12 h-16 text-lg border-base-300 hover:bg-base-200 transition-all w-full sm:w-auto"
              >
                Verify Evidence
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section with Glassmorphism */}
      <section className="bg-base-200 py-12 text-base-content relative overflow-hidden border-b border-base-300">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            <div className="relative">
              <div className="absolute -left-12 -top-12 text-[15rem] font-black text-primary/5 select-none leading-none -z-10">
                01
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight tracking-tight">
                A Mission of <br />
                <span className="text-primary italic">Immutability</span>
              </h2>
              <div className="space-y-8 text-xl text-base-content/60 leading-relaxed font-medium">
                <p>
                  In an era of fleeting data and centralized control, your most important records deserve a sanctuary
                  that is immune to time, censorship, and corporate failure.
                </p>
                <p>
                  Aeternum leverages the power of mathematics and decentralized protocols to strip away human
                  vulnerabilities, ensuring your legacy is protected by code and anchored in eternity.
                </p>
              </div>

              <div className="mt-16 p-10 glass rounded-[2.5rem] border border-primary/20 shadow-2xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <p className="text-xl md:text-2xl font-black italic text-primary relative z-10 leading-tight">
                  &quot;Your evidence, protected by code, anchored in eternity.&quot;
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 relative">
              {/* Decorative Blur */}
              <div className="absolute inset-0 bg-primary/5 blur-[100px] -z-10" />

              <div className="space-y-6 pt-16">
                <div className="glass p-8 rounded-[2rem] border border-base-300 shadow-xl group hover:-translate-y-3 transition-all duration-500 flex flex-col items-center text-center">
                  <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-content transition-all">
                    <ShieldCheckIcon className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">Sovereignty</h3>
                  <p className="text-sm text-base-content/50 leading-relaxed font-medium">
                    Only you hold the keys to your history.
                  </p>
                </div>
                <div className="bg-primary p-8 rounded-[2rem] text-primary-content shadow-2xl shadow-primary/20 group hover:-translate-y-3 transition-all duration-500 flex flex-col items-center text-center">
                  <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                    <LockClosedIcon className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">Privacy</h3>
                  <p className="text-sm text-primary-content/80 leading-relaxed font-medium">
                    Zero-knowledge proofs hide your data from us.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="glass p-8 rounded-[2rem] border border-base-300 shadow-xl group hover:-translate-y-3 transition-all duration-500 flex flex-col items-center text-center">
                  <div className="bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary transition-all p-2.5">
                    <Image
                      src="/arweave.png"
                      alt="Arweave"
                      width={56}
                      height={56}
                      className="h-full w-full object-contain grayscale group-hover:grayscale-0 transition-all"
                    />
                  </div>
                  <h3 className="font-bold text-xl mb-3">Permatime</h3>
                  <p className="text-sm text-base-content/50 leading-relaxed font-medium">
                    Stored for centuries on the Arweave network.
                  </p>
                </div>
                <div className="glass p-8 rounded-[2rem] border border-base-300 shadow-xl group hover:-translate-y-3 transition-all duration-500 flex flex-col items-center text-center">
                  <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-content transition-all">
                    <FingerPrintIcon className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">Identity</h3>
                  <p className="text-sm text-base-content/50 leading-relaxed font-medium">
                    On-chain verification for complete trust.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Section */}
      <section className="py-32 bg-base-200/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-20 mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight leading-none">The Aeternum Standard</h2>
            <p className="text-lg md:text-xl text-base-content/50 font-medium leading-relaxed">
              We operate at the intersection of cryptography and permanence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {values.map(value => (
              <div
                key={value.name}
                className="group flex flex-col items-center text-center bg-base-100 p-10 rounded-[2.5rem] border border-transparent hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
              >
                <div className="bg-primary/5 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-10 border border-primary/10 group-hover:bg-primary group-hover:text-primary-content group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <value.icon className="h-10 w-10" />
                </div>
                <h3 className="text-3xl font-black mb-6 group-hover:text-primary transition-colors tracking-tight">
                  {value.name}
                </h3>
                <p className="text-lg text-base-content/60 leading-relaxed font-medium">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Footer Section */}
      <section className="py-32 mb-20">
        <div className="container mx-auto px-4">
          <div className="relative group p-12 lg:p-32 rounded-[4rem] bg-base-content text-base-100 overflow-hidden text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />
            <div className="absolute top-0 right-0 p-24 opacity-5 select-none -z-0 group-hover:scale-110 transition-transform duration-1000">
              <ShieldCheckIcon className="h-96 w-96" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">
                Ready to secure your truth?
              </h2>
              <p className="text-lg md:text-xl text-base-100/60 mb-12 font-medium max-w-2xl">
                Join thousands of users who trust Aeternum for private, permanent record keeping.
              </p>
              <div className="flex flex-col sm:flex-row gap-8 w-full justify-center">
                <Link
                  href="/vault"
                  className="btn btn-primary btn-lg rounded-2xl px-16 h-20 text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40 border-none w-full sm:w-auto"
                >
                  Enter the Vault
                </Link>
                <Link
                  href="/plans"
                  className="btn btn-ghost btn-lg rounded-2xl px-16 h-20 text-xl border-base-100/20 text-base-100 hover:bg-base-100 hover:text-base-content transition-all w-full sm:w-auto"
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
