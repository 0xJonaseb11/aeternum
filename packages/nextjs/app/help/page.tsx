"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LifebuoyIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const faqs = [
  {
    question: "What is Aeternum?",
    answer:
      "Aeternum is a private, permanent, zero-knowledge evidence vault. We allow you to store critical documents permanently using Arweave and verify their existence on-chain (Base L2) without revealing their content.",
  },
  {
    question: "How secure is my data?",
    answer:
      "Extremely. Your files are encrypted client-side using AES-256-GCM before they ever leave your browser. We only store the encrypted ciphertext and a ZK-commitment. Only you have the secret key to decrypt them.",
  },
  {
    question: "What happens if Aeternum goes out of business?",
    answer:
      "Your data is stored on Arweave, a decentralized permanent storage network. Even if Aeternum disappears, your data remains accessible on the permaweb forever via any Arweave gateway.",
  },
  {
    question: "What is a ZK-commitment?",
    answer:
      "A Zero-Knowledge commitment is a cryptographic value that proves you possess a specific file without revealing any information about the file itself. It's like a digital fingerprint that can be verified on the blockchain.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "Currently, our vault supports files up to 50MB. For larger files, please contact our Enterprise support team.",
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      {/* Header / Search Area */}
      <section className="bg-base-200 py-24 text-base-content relative overflow-hidden border-b border-base-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />
        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">How can we help you?</h1>
          <div className="relative group max-w-2xl mx-auto">
            <MagnifyingGlassIcon className="h-6 w-6 absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" />
            <input
              type="text"
              placeholder="Search for articles, guides, and more..."
              className="w-full bg-base-100 hover:bg-base-100 focus:bg-base-100 text-base-content border border-base-300 rounded-2xl py-5 pl-14 pr-6 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-lg shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Quick Links */}
          <div className="grid md:grid-cols-4 gap-6 mb-20 -mt-32 relative z-10">
            {[
              { name: "Getting Started", icon: BookOpenIcon, desc: "New to Aeternum? Start here." },
              { name: "Security", icon: LifebuoyIcon, desc: "Encryption and privacy details." },
              { name: "Billing", icon: ChatBubbleLeftRightIcon, desc: "Invoices and subscription help." },
              { name: "Troubleshooting", icon: QuestionMarkCircleIcon, desc: "Common issues and fixes." },
            ].map(box => (
              <div
                key={box.name}
                className="bg-base-100 p-8 rounded-3xl shadow-xl border border-base-300 hover:border-primary transition-all group cursor-pointer"
              >
                <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-content transition-all">
                  <box.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{box.name}</h3>
                <p className="text-sm text-base-content/60">{box.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-16">
            {/* FAQs */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-black mb-10 flex items-center gap-4">
                <span className="bg-primary text-primary-content w-10 h-10 rounded-full flex items-center justify-center text-xl">
                  ?
                </span>
                Frequently Asked Questions
              </h2>

              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border border-base-200 rounded-2xl overflow-hidden bg-base-200/30">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full p-6 text-left flex justify-between items-center hover:bg-base-200 transition-colors"
                    >
                      <span className="font-bold text-lg">{faq.question}</span>
                      {openFaq === idx ? (
                        <ChevronUpIcon className="h-5 w-5 opacity-50" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 opacity-50" />
                      )}
                    </button>
                    {openFaq === idx && (
                      <div className="p-6 pt-0 text-base-content/70 leading-relaxed border-t border-base-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar / Contact */}
            <div className="space-y-8">
              <div className="bg-base-200 p-10 rounded-[2.5rem] border border-base-300 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-5">
                  <ChatBubbleLeftRightIcon className="h-40 w-40" />
                </div>
                <h3 className="text-2xl font-black mb-4">Still need help?</h3>
                <p className="text-base-content/60 mb-8 text-sm leading-relaxed">
                  Can&apos;t find what you&apos;re looking for? Our dedicated support team is here to assist you with
                  any technical or billing inquiries.
                </p>
                <div className="space-y-4">
                  <Link href="/contact" className="btn btn-primary btn-block rounded-2xl">
                    Contact Support
                  </Link>
                  <p className="text-center text-[10px] uppercase font-bold tracking-widest opacity-40">
                    Average response: 2 hours
                  </p>
                </div>
              </div>

              <div className="p-8 border border-base-200 rounded-[2rem]">
                <h4 className="font-bold mb-4">Community Support</h4>
                <p className="text-sm text-base-content/60 mb-6">
                  Join our Discord to chat with other users and developers.
                </p>
                <Link href="#" className="flex items-center gap-3 text-sm font-bold text-primary hover:underline">
                  Join Discord Community →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
