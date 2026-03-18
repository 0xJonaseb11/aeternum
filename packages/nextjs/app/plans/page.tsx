"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";
import { PLAN_IDS } from "~~/lib/billing/plans";

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

const PLAN_PRICES: Record<
  string,
  { monthly: string; monthlyPriceId?: string; quarterly?: string; quarterlyPriceId?: string }
> = {
  pro: { monthly: "$20" },
  business: { monthly: "$100" },
  enterprise: {
    monthly: "$150",
    quarterly: "$399",
    quarterlyPriceId: "discounted",
  },
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
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
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
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4 tracking-tight">
          Choose Your <span className="text-primary italic">Permanence</span>
        </h1>
        <p className="text-lg text-base-content/60 max-w-2xl mx-auto">
          Scale your evidence vault from personal verification to enterprise-grade compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {PLAN_IDS.map(plan => {
          const features = PLAN_FEATURES[plan] || [];
          const price = PLAN_PRICES[plan];

          return (
            <div
              key={plan}
              className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 ${
                plan === "business"
                  ? "border-primary bg-primary/5 shadow-2xl scale-105 z-10"
                  : "border-base-300 bg-base-100 hover:border-primary/30"
              }`}
            >
              {plan === "business" && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-content text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                  Recommended
                </div>
              )}
              {plan === "pro" && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary text-secondary-content text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-xl font-bold capitalize text-base-content mb-2">{plan}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{price?.monthly || "$0"}</span>
                  <span className="text-sm text-base-content/50">/month</span>
                </div>
              </div>

              <div className="flex-1">
                <ul className="space-y-4 mb-8">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-base-content/70">
                      <CheckIcon className="h-5 w-5 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan === "enterprise" && (
                    <li className="flex items-start gap-3 text-sm font-medium text-primary bg-primary/5 p-2 rounded-lg border border-primary/10">
                      <CheckIcon className="h-5 w-5 shrink-0" />
                      <span>Best Deal: Save with quarterly billing</span>
                    </li>
                  )}
                </ul>
              </div>

              {plan === "enterprise" ? (
                <div className="space-y-3">
                  <button
                    onClick={() => startCheckout(plan)}
                    disabled={loadingPlan !== null}
                    className={`btn btn-block btn-outline ${loadingPlan === "enterprise" ? "loading" : ""}`}
                  >
                    Monthly ($150/mo)
                  </button>
                  <button
                    onClick={() => startCheckout(plan, "discounted")}
                    disabled={loadingPlan !== null}
                    className={`btn btn-block btn-primary ${loadingPlan === "enterprise-discounted" ? "loading" : ""}`}
                  >
                    Quarterly ($399/3mo)
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startCheckout(plan)}
                  disabled={loadingPlan !== null || plan === "free"}
                  className={`btn btn-block ${plan === "business" ? "btn-primary" : "btn-outline"} ${
                    loadingPlan === plan ? "loading" : ""
                  }`}
                >
                  {plan === "free" ? "Default Plan" : `Upgrade to ${plan}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-20 rounded-3xl bg-base-200/50 border border-base-300 p-8 md:p-12 text-center">
        <h3 className="text-2xl font-bold mb-4">Need something custom?</h3>
        <p className="text-base-content/60 max-w-xl mx-auto mb-8">
          We offer specialized solutions for law firms, government agencies, and clinical research teams.
        </p>
        <button className="btn btn-primary px-8">Contact Sales</button>
      </div>
    </div>
  );
}
