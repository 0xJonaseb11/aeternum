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

const Home = () => {
  const { address: connectedAddress } = useAccount();
  const words = useMemo(() => ["Digital Truth", "Critical Evidence", "Private Records", "Permanent Legacy"], []);
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const staticPart = "SECURITY FOR YOUR ";

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const currentFullWord = words[wordIndex];
    const fullPhrase = staticPart + currentFullWord;

    if (isTyping) {
      if (displayText.length < fullPhrase.length) {
        timeoutId = setTimeout(() => {
          setDisplayText(fullPhrase.substring(0, displayText.length + 1));
        }, 180);
      } else {
        timeoutId = setTimeout(() => setIsTyping(false), 3000);
      }
    } else {
      if (displayText.length > staticPart.length) {
        timeoutId = setTimeout(() => {
          setDisplayText(fullPhrase.substring(0, displayText.length - 1));
        }, 80);
      } else {
        timeoutId = setTimeout(() => {
          setIsTyping(true);
          setWordIndex(prev => (prev + 1) % words.length);
        }, 500);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayText, isTyping, wordIndex, words, staticPart]);

  const line1 = staticPart;
  const line2 = displayText.substring(staticPart.length);

  return (
    <div className="flex flex-col grow w-full min-w-0 bg-base-100 selection:bg-primary/10 selection:text-primary">
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-36 w-full">
        {/* Premium Background Effects — Exactly as on Verification Page */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 right-1/3 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(var(--color-primary-rgb),0.12),transparent_70%)]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-7xl">
          <div className="max-w-4xl mx-auto text-center">
            {/* Waved centered feature badge — no distinct pill shape */}
            <div className="flex flex-col items-center mb-10 md:mb-14 animate-fade-in group cursor-default">
              <div className="w-px h-6 bg-gradient-to-b from-transparent to-primary/20 mb-4 group-hover:h-10 transition-all duration-700 ease-in-out" />
              <div className="relative w-full max-w-md">
                {/* Diffused light wave background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent blur-2xl opacity-60" />

                <div className="relative py-2 flex justify-center text-center">
                  <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.45em] text-primary/60">
                    Zero-Knowledge Evidence Vault
                  </span>
                </div>
              </div>
            </div>

            <h1
              suppressHydrationWarning
              className="text-4xl md:text-7xl font-black text-base-content mb-10 md:mb-16 leading-[1.2] md:leading-[1.1] flex flex-col items-center uppercase overflow-hidden"
            >
              <span className="tracking-[0.1em] text-base-content/80 mb-2 md:mb-4">{line1}</span>
              <span className="text-3xl md:text-6xl text-primary italic drop-shadow-2xl min-h-[1.2em] tracking-tight normal-case">
                {line2}
                <span className="inline-block w-[3px] h-[0.9em] bg-primary ml-3 animate-pulse align-middle" />
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-base-content/50 max-w-2xl mx-auto leading-relaxed mb-16 font-medium">
              Only you hold the key to your evidence. Encrypt locally, store forever on Arweave, and prove ownership
              without ever revealing the content.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/vault"
                className="btn btn-primary btn-lg px-12 h-16 rounded-2xl text-lg gap-3 shadow-2xl shadow-primary/30 group hover:scale-105 active:scale-95 transition-all w-auto"
              >
                <span>Access your Vault</span>
                <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1 shrink-0" />
              </Link>
              <Link
                href="/verification"
                className="btn glass btn-lg px-12 h-16 rounded-2xl text-lg border-base-300 hover:bg-base-200 transition-all w-auto"
              >
                Verify Evidence
              </Link>
            </div>

            {!connectedAddress && (
              <div className="mt-16 flex items-center justify-center gap-3 opacity-40 hover:opacity-100 transition-opacity duration-500">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] leading-none">
                  Connect wallet to unlock full encryption
                </p>
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-24 bg-base-100 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Permanent Storage",
                desc: "Your evidence lives on Arweave, a permanent decentralized web that keeps it available for decades. No monthly fees, no risk of deletion.",
                icon: CloudArrowUpIcon,
                color: "primary",
                link: "https://docs.arweave.org/",
              },
              {
                title: "Zero-Knowledge",
                desc: "Prove you own a file without sharing it. Your secret stays on your device; we use ZK proofs so only you hold the key to the content.",
                icon: FingerPrintIcon,
                color: "primary",
                link: "https://docs.circom.io/",
              },
              {
                title: "Immutable Proofs",
                desc: "Every proof is anchored on Base L2, creating an unalterable timestamp. Verified by code, not intermediaries. Fully audit-ready.",
                icon: Squares2X2Icon,
                color: "primary",
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
                    Explore Technology
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual "How it Works" Section */}
      <section className="py-24 bg-base-200/50 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">How it works</h2>
            <p className="text-lg md:text-xl text-base-content/50 font-medium leading-relaxed">
              Three levels of protection ensuring your digital truth is never compromised.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-12" />

            {[
              {
                step: "01",
                title: "Local Encryption",
                desc: "Your file is encrypted locally in your browser using AES-256-GCM. We never see your raw data.",
                icon: LockClosedIcon,
              },
              {
                step: "02",
                title: "On-Chain Proof",
                desc: "A cryptographic commitment (ZK Proof) is anchored to Base L2, establishing the exact moment of existence.",
                icon: ShieldCheckIcon,
              },
              {
                step: "03",
                title: "Permanent Deposit",
                desc: "The encrypted file is stored on Arweave's blockweave, ensuring it remains accessible for centuries.",
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
                <p className="text-sm text-base-content/60 leading-relaxed font-medium max-w-[240px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Integrity Section (Logos/Trust) */}
      <section className="py-24 border-t border-base-300 overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 opacity-50 hover:opacity-100 transition-opacity duration-1000 grayscale hover:grayscale-0">
            <div className="flex items-center gap-6 group/tech">
              <div className="bg-white p-4 rounded-[1.5rem] shadow-xl shadow-blue-500/10 transition-transform group-hover/tech:scale-110 border border-base-200/50">
                <Image src="/base-logo.png" alt="Base L2" width={48} height={48} className="object-contain" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-base-content whitespace-nowrap">BASE L2</span>
            </div>
            <div className="flex items-center gap-6 group/tech">
              <div className="bg-white p-4 rounded-[1.5rem] shadow-xl shadow-black/5 transition-transform group-hover/tech:scale-110 border border-base-200/50">
                <Image src="/arweave.png" alt="Arweave" width={48} height={48} className="object-contain" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase text-base-content whitespace-nowrap">
                Arweave
              </span>
            </div>
            <div className="flex items-center gap-6 group/tech">
              <div className="bg-white p-4 rounded-[1.5rem] shadow-xl shadow-primary/10 transition-transform group-hover/tech:scale-110 overflow-hidden border border-base-200/50">
                <Image src="/zkproofs.jpeg" alt="ZK-Proof" width={48} height={48} className="object-cover" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase text-base-content whitespace-nowrap">
                ZK-PROOF
              </span>
            </div>
            <div className="flex items-center gap-6 group/tech">
              <div className="bg-primary/5 p-4 rounded-[1.5rem] text-primary shadow-xl shadow-primary/5 transition-transform group-hover/tech:scale-110 border border-primary/10">
                <ShieldCheckIcon className="h-10 w-10" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase text-base-content whitespace-nowrap">
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

      {/* Final "Winning Project" CTA */}
      <section className="py-24 mb-16">
        <div className="container mx-auto px-4">
          <div className="relative group p-12 lg:p-24 rounded-[3.5rem] bg-base-content text-base-100 overflow-hidden text-center shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent opacity-30 group-hover:opacity-50 transition-opacity duration-1000" />
            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">
                The future of evidence is here.
              </h2>
              <p className="text-lg md:text-xl text-base-100/60 mb-12 font-medium max-w-xl">
                Start protecting your legacy today with the world&apos;s most advanced private evidence vault.
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
    </div>
  );
};

export default Home;
