"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";
import { getPlanLimits } from "~~/lib/billing/plans";

type BillingData = {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  proofsThisMonth: number;
  proofsLimit: number;
};

export default function BillingPage() {
  const { session, user } = useSupabaseAuth();
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  const fetchBilling = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/billing/subscription", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to load subscription");
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error("Billing error:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (user) void fetchBilling();
  }, [user, fetchBilling]);

  const openPortal = async () => {
    if (!session?.access_token) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });
      const d = await res.json();
      if (d.url) window.open(d.url, "_blank");
    } finally {
      setPortalLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-2xl font-bold mb-4">Billing & Usage</h1>
        <p className="text-base-content/60 mb-6">Sign in to view your subscription details.</p>
        <Link href="/login" className="btn btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center">Loading subscription details…</div>;

  const isPaid = data && data.plan !== "free";
  const limits = data ? getPlanLimits(data.plan as any) : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Billing & Usage</h1>
          <p className="text-sm text-base-content/60">Manage your subscription and track resource consumption.</p>
        </div>
        <Link href="/plans" className="btn btn-primary btn-sm">
          Compare Plans
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body p-6">
            <span className="text-[10px] uppercase font-bold text-base-content/40 mb-1">Current Plan</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black capitalize">{data?.plan || "Free"}</span>
              {isPaid && <span className="badge badge-primary badge-sm">Active</span>}
            </div>
            {data?.currentPeriodEnd && (
              <p className="text-[10px] text-base-content/50 mt-2">
                Renews {new Date(data.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="card bg-base-200 border border-base-300">
          <div className="card-body p-6">
            <span className="text-[10px] uppercase font-bold text-base-content/40 mb-1">Usage (Proofs)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black">{data?.proofsThisMonth || 0}</span>
              <span className="text-sm text-base-content/50">
                / {data?.proofsLimit === -1 ? "∞" : data?.proofsLimit}
              </span>
            </div>
            <progress
              className="progress progress-primary mt-2"
              value={data?.proofsThisMonth || 0}
              max={data?.proofsLimit === -1 ? 100 : data?.proofsLimit || 10}
            />
          </div>
        </div>

        <div className="card bg-base-200 border border-base-300">
          <div className="card-body p-6">
            <span className="text-[10px] uppercase font-bold text-base-content/40 mb-1">API Requests</span>
            <div className="text-2xl font-black">
              {limits?.apiRequestsPerMonth === -1 ? "Unlimited" : limits?.apiRequestsPerMonth.toLocaleString() || 0}
            </div>
            <p className="text-[10px] text-base-content/50 mt-2">Per Month Capacity</p>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="card-body p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="rounded-2xl bg-primary/10 p-4">
              <CreditCardIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Stripe Billing Portal</h2>
              <p className="text-sm text-base-content/60">
                Update payment methods, download invoices, and manage your billing address securelly.
              </p>
            </div>
          </div>

          <div className="bg-base-200/50 rounded-2xl p-6 border border-base-300 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="font-bold text-base-content">Manage your subscription</p>
              <p className="text-xs text-base-content/60 italic">Opens Stripe in a new secure window</p>
            </div>
            <button
              onClick={openPortal}
              disabled={portalLoading || !data?.stripeCustomerId}
              className="btn btn-primary btn-md gap-2"
            >
              {portalLoading ? "Opening…" : "Launch Portal"}
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </button>
          </div>

          {!data?.stripeCustomerId && (
            <p className="text-[10px] text-center text-base-content/40 mt-4">
              You don&apos;t have a Stripe customer history yet. Upgrade to a paid plan to enable the portal.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
