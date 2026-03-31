"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import {
  ArrowRightIcon,
  CloudArrowUpIcon,
  FingerPrintIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { OnboardingTour } from "~~/components/ui/OnboardingTour";

const Home = () => {
  const { address: connectedAddress } = useAccount();

  // ── Rotating subtitle for the hero ──────────────────────────
  const subtitles = useMemo(
    () => [
      "Prove ownership without exposure.",
      "Anchored on-chain, stored on Arweave.",
      "Zero-knowledge. Zero compromise.",
      "Your keys, your truth, your legacy.",
    ],
    [],
  );
  const [subIndex, setSubIndex] = useState(0);
  const [subText, setSubText] = useState("");
  const [isSubTyping, setIsSubTyping] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const current = subtitles[subIndex];

    if (isSubTyping) {
      if (subText.length < current.length) {
        timer = setTimeout(() => setSubText(current.substring(0, subText.length + 1)), 60);
      } else {
        timer = setTimeout(() => setIsSubTyping(false), 2800);
      }
    } else {
      if (subText.length > 0) {
        timer = setTimeout(() => setSubText(current.substring(0, subText.length - 1)), 30);
      } else {
        timer = setTimeout(() => {
          setIsSubTyping(true);
          setSubIndex(prev => (prev + 1) % subtitles.length);
        }, 400);
      }
    }

    return () => clearTimeout(timer);
  }, [subText, isSubTyping, subIndex, subtitles]);

  return (
    <div className="flex flex-col grow w-full min-w-0 bg-base-100 selection:bg-primary/10 selection:text-primary">
      {/* ══════════════════════════════════════════════════════════
          HERO SECTION — Bold, Emotive, Welcoming
          ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-20 pb-28 lg:pt-36 lg:pb-44 w-full">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[900px] h-[900px] bg-primary/10 rounded-full blur-[180px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[900px] h-[900px] bg-accent/10 rounded-full blur-[180px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(var(--color-primary-rgb),0.15),transparent_70%)]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-7xl">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="flex flex-col items-center mb-10 md:mb-14">
              <div className="w-px h-8 bg-gradient-to-b from-transparent to-primary/30 mb-4" />
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md">
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.35em] text-primary/70">
                  The World&apos;s First Private Evidence Vault
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-8xl font-black text-base-content mb-6 md:mb-8 leading-[1.05] tracking-tight text-center">
              Your Truth.
              <br />
              <span
                className="bg-gradient-to-r from-primary via-pink-400 to-primary bg-[length:200%_auto] bg-clip-text text-transparent italic"
                style={{ animation: "gradient-shift 4s ease-in-out infinite" }}
              >
                Encrypted Forever.
              </span>
            </h1>

            {/* Sub-copy */}
            <p className="text-lg md:text-2xl text-base-content/50 max-w-2xl mx-auto leading-relaxed mb-6 font-medium text-center">
              Encrypt your evidence locally, anchor it permanently on-chain, and prove ownership, without ever
              revealing the content.
            </p>

            {/* Rotating subtitle */}
            <div className="h-10 flex items-center justify-center mb-14">
              <p
                suppressHydrationWarning
                className="text-sm md:text-base font-bold text-primary/60 font-mono tracking-wide"
              >
                {subText}
                <span className="inline-block w-[2px] h-[1em] bg-primary/60 ml-1 animate-pulse align-middle" />
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link
                id="hero-cta"
                href="/vault"
                className="btn btn-primary btn-lg px-14 h-16 rounded-2xl text-lg gap-3 shadow-2xl shadow-primary/30 group hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
              >
                <span>Start Protecting</span>
                <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1 shrink-0" />
              </Link>
              <a
                href="#how-it-works"
                className="btn glass btn-lg px-14 h-16 rounded-2xl text-lg border-base-300 hover:bg-base-200 transition-all w-full sm:w-auto"
              >
                Watch How It Works
              </a>
            </div>

            {/* Wallet prompt */}
            {!connectedAddress && (
              <div className="mt-14 flex items-center justify-center gap-3 opacity-40 hover:opacity-100 transition-opacity duration-500">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] leading-none">
                  Connect your wallet to unlock full encryption
                </p>
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURE SHOWCASE GRID
          ══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-base-100 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Permanent Storage",
                desc: "Your evidence lives on Arweave. A permanent, decentralized network that keeps your files available for decades. No monthly fees, no risk of deletion.",
                icon: CloudArrowUpIcon,
                link: "https://docs.arweave.org/",
              },
              {
                title: "Zero-Knowledge Privacy",
                desc: "Prove you own a file without sharing it. Your secret key stays on your device. Only you can unlock the content. Total privacy by design.",
                icon: FingerPrintIcon,
                link: "https://docs.circom.io/",
              },
              {
                title: "Immutable On-Chain Proofs",
                desc: "Every proof is timestamped and anchored on Base L2, creating a permanent, tamper-proof record. Verified by code, not intermediaries.",
                icon: Squares2X2Icon,
                link: "https://docs.base.org/",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group glass p-10 rounded-[2.5rem] border border-base-300 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 min-w-0 flex flex-col items-center text-center"
              >
                <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-primary/10 group-hover:bg-primary group-hover:text-primary-content group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-base text-base-content/60 leading-relaxed font-medium mb-8">{feature.desc}</p>
                <div className="mt-auto">
                  <a
                    href={feature.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all hover:gap-3"
                  >
                    Learn More
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 bg-base-200/50 relative overflow-hidden scroll-mt-20">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">How It Works</h2>
            <p className="text-lg md:text-xl text-base-content/50 font-medium leading-relaxed">
              Three layers of protection that keep your digital truth safe from upload to verification.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-12" />

            {[
              {
                step: "01",
                title: "Encrypt Locally",
                desc: "Your file is encrypted right in your browser using military-grade AES-256-GCM encryption. Your raw data never leaves your device.",
                icon: LockClosedIcon,
              },
              {
                step: "02",
                title: "Anchor On-Chain",
                desc: "A unique cryptographic proof is recorded on Base L2, creating a permanent timestamp that proves exactly when you secured the evidence.",
                icon: ShieldCheckIcon,
              },
              {
                step: "03",
                title: "Store Permanently",
                desc: "The encrypted file is deposited to Arweave's permanent storage network. Accessible for centuries, deletion-proof by design.",
                icon: CloudArrowUpIcon,
              },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center px-4 relative group">
                <div className="w-24 h-24 rounded-full bg-base-100 border-2 border-primary/20 flex items-center justify-center mb-8 shadow-xl group-hover:border-primary group-hover:scale-110 transition-all duration-500 relative z-10">
                  <step.icon className="h-10 w-10 text-primary" />
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-content text-[10px] font-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-base-200">
                    {step.step}
                  </div>
                </div>
                <h4 className="text-xl font-black mb-4 tracking-tight">{step.title}</h4>
                <p className="text-sm text-base-content/60 leading-relaxed font-medium max-w-[260px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PLATFORM TRUST LOGOS
          ══════════════════════════════════════════════════════════ */}
      <section className="py-24 border-t border-base-300 overflow-hidden bg-base-100/50">
        <div className="container mx-auto px-6 sm:px-12 lg:px-20 max-w-none">
          <div className="flex flex-row flex-wrap items-center justify-center md:justify-between gap-8 md:gap-12 opacity-50 hover:opacity-100 transition-opacity duration-1000 grayscale hover:grayscale-0">
            <div className="flex items-center gap-4 md:gap-6 group/tech">
              <div className="bg-white p-3 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] shadow-xl shadow-blue-500/10 transition-transform group-hover/tech:scale-110 border border-base-200/50 block">
                <Image src="/base-logo.png" alt="Base L2" width={48} height={48} className="object-contain w-8 h-8 md:w-12 md:h-12" />
              </div>
              <span className="text-lg md:text-2xl font-black tracking-tighter text-base-content whitespace-nowrap">BASE L2</span>
            </div>
            <div className="flex items-center gap-4 md:gap-6 group/tech">
              <div className="bg-white p-3 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] shadow-xl shadow-black/5 transition-transform group-hover/tech:scale-110 border border-base-200/50 block">
                <Image src="/arweave.png" alt="Arweave" width={48} height={48} className="object-contain w-8 h-8 md:w-12 md:h-12" />
              </div>
              <span className="text-lg md:text-2xl font-black tracking-tighter uppercase text-base-content whitespace-nowrap">
                Arweave
              </span>
            </div>
            <div className="flex items-center gap-4 md:gap-6 group/tech">
              <div className="bg-white p-3 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] shadow-xl shadow-primary/10 transition-transform group-hover/tech:scale-110 overflow-hidden border border-base-200/50 block">
                <Image src="/zkproofs.jpeg" alt="ZK-Proof" width={48} height={48} className="object-cover w-8 h-8 md:w-12 md:h-12" />
              </div>
              <span className="text-lg md:text-2xl font-black tracking-tighter uppercase text-base-content whitespace-nowrap">
                ZK-PROOF
              </span>
            </div>
            <div className="flex items-center gap-4 md:gap-6 group/tech">
              <div className="bg-primary/5 p-3 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] text-primary shadow-xl shadow-primary/5 transition-transform group-hover/tech:scale-110 border border-primary/10 block">
                <ShieldCheckIcon className="h-8 w-8 md:h-10 md:w-10 text-primary" />
              </div>
              <span className="text-lg md:text-2xl font-black tracking-tighter uppercase text-base-content whitespace-nowrap">
                Verifiable
              </span>
            </div>
          </div>

          <div className="mt-20 text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-base-content/30">
              Built on battle-tested decentralized protocols
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FINAL CTA
          ══════════════════════════════════════════════════════════ */}
      <section className="py-24 mb-16">
        <div className="container mx-auto px-4">
          <div className="relative group p-12 lg:p-24 rounded-[3.5rem] bg-base-content text-base-100 overflow-hidden text-center shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent opacity-30 group-hover:opacity-50 transition-opacity duration-1000" />
            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">
                Your evidence deserves
                <br />
                <span className="text-primary">to last forever.</span>
              </h2>
              <p className="text-lg md:text-xl text-base-100/60 mb-12 font-medium max-w-xl">
                Join the new standard in digital evidence protection. Encrypt, anchor, and prove, all in one vault.
              </p>
              <Link
                href="/vault"
                className="btn btn-primary btn-lg rounded-2xl px-16 h-16 text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40 w-full sm:w-auto"
              >
                Enter the Vault
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Tour — only renders on first visit */}
      <OnboardingTour />
    </div>
  );
};

export default Home;
