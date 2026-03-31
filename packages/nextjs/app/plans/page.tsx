"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { CheckIcon } from "@heroicons/react/24/outline";
import ContactForm from "~~/components/ContactForm";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

const PLAN_FEATURES: Record<string, string[]> = {
  free: [
    "10 proofs per month",
    "100 MB decentralized storage",
    "100 API requests per month",
    "Single user organization",
    "Basic evidence verification",
  ],
  pro: [
    "100 proofs per month",
    "1 GB decentralized storage",
    "10,000 API requests per month",
    "Priority support",
    "Advanced ZK proof metadata",
  ],
  business: [
    "1,000 proofs per month",
    "10 GB decentralized storage",
    "100,000 API requests per month",
    "10 team members",
    "Audit-ready logs",
    "Custom retention policies",
  ],
  enterprise: [
    "Unlimited proofs",
    "Unlimited storage",
    "Unlimited API usage",
    "Unlimited team members",
    "Dedicated support engineer",
    "Private deployment options",
    "Custom ZK circuit integration",
  ],
};

const DISPLAY_PLANS = [
  { id: "free", name: "Free" },
  { id: "pro", name: "Pro" },
  { id: "business", name: "Business" },
  { id: "enterprise_monthly", name: "Enterprise Monthly", basePlan: "enterprise" },
  { id: "enterprise_quarterly", name: "Enterprise Quarterly", basePlan: "enterprise" },
];

const PLAN_PRICES: Record<string, { displayPrice: string; unit: string; priceId?: string }> = {
  free: { displayPrice: "$0", unit: "/month" },
  pro: { displayPrice: "$20", unit: "/month" },
  business: { displayPrice: "$100", unit: "/month" },
  enterprise_monthly: { displayPrice: "$150", unit: "/month" },
  enterprise_quarterly: { displayPrice: "$399", unit: "/3 months", priceId: "discounted" },
};

export default function PlansPage() {
  const { session } = useSupabaseAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const startCheckout = useCallback(
    async (plan: string, priceId?: string) => {
      if (!session?.access_token) {
        toast.error("Please sign in to upgrade");
        return;
      }
      setLoadingPlan(priceId ? `${plan}-${priceId}` : plan);
      try {
        const base = typeof window !== "undefined" ? window.location.origin : "";
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify({
            plan,
            priceId,
            successUrl: `${base}/billing?success=true`,
            cancelUrl: `${base}/plans`,
          }),
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok) {
          toast.error(data.error ?? "Checkout failed");
          return;
        }
        if (data.url) window.location.href = data.url;
      } finally {
        setLoadingPlan(null);
      }
    },
    [session?.access_token],
  );

  return (
    <div className="flex flex-col grow w-full min-w-0">
      <section className="relative pt-8 pb-10 lg:pt-12 lg:pb-16 overflow-hidden border-b border-base-300/50">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[130px] animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[130px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(var(--color-primary-rgb),0.06),transparent_70%)]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight text-base-content">
              Choose Your <br />
              <span className="text-primary italic drop-shadow-sm">Permanence</span>
            </h1>
            <p className="text-lg md:text-xl text-base-content/60 max-w-2xl mx-auto font-medium leading-relaxed">
              Scale your evidence vault from personal verification to enterprise-grade compliance. <br />
              Transparent pricing for infinite history.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {DISPLAY_PLANS.map(({ id, name, basePlan }) => {
            const features = PLAN_FEATURES[basePlan || id] || [];
            const price = PLAN_PRICES[id];

            return (
              <div
                key={id}
                className={`relative flex flex-col p-6 rounded-3xl border transition-all duration-300 ${
                  id === "business"
                    ? "border-primary bg-primary/5 shadow-2xl scale-105 z-10"
                    : "border-base-300 bg-base-100 hover:border-primary/30 shadow-sm"
                }`}
              >
                {id === "business" && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-content text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full whitespace-nowrap">
                    Recommended
                  </div>
                )}
                {id === "pro" && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary text-secondary-content text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                {id === "enterprise_quarterly" && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-accent-content text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full whitespace-nowrap">
                    Best Deal
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-lg font-bold text-base-content mb-2 leading-tight h-12 flex items-center">
                    {name}
                  </h2>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">{price?.displayPrice || "$0"}</span>
                    <span className="text-[10px] text-base-content/50 font-medium uppercase tracking-tighter">
                      {price?.unit || "/month"}
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <ul className="space-y-3 mb-8">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-base-content/70">
                        <CheckIcon className="h-4 w-4 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => startCheckout(basePlan || id, price?.priceId)}
                  disabled={loadingPlan !== null || id === "free"}
                  className={`btn btn-sm btn-block ${id === "business" ? "btn-primary" : "btn-outline"} ${
                    loadingPlan === (price?.priceId ? `${basePlan || id}-${price.priceId}` : basePlan || id)
                      ? "loading"
                      : ""
                  }`}
                >
                  {id === "free" ? "Default Plan" : `Upgrade`}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-20">
          <ContactForm
            type="sales"
            title="Need something custom?"
            subtitle="We offer specialized solutions for law firms, government agencies, and clinical research teams. Let's build your enterprise vault."
            formId={process.env.NEXT_PUBLIC_FORMSPREE_SALES_ID}
          />
        </div>
      </div>
    </div>
  );
}
