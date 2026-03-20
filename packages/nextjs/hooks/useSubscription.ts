"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";
import type { PlanId } from "~~/lib/billing/plans";

export type SubscriptionData = {
  plan: PlanId;
  status: string;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  proofsThisMonth: number;
  proofsLimit: number;
};

export function useSubscription() {
  const { session, user } = useSupabaseAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/subscription", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError((j as { error?: string }).error ?? "Failed to load subscription");
        return;
      }
      const data = (await res.json()) as SubscriptionData;
      setSubscription(data);
    } catch (err: any) {
      setError(err.message || "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (user && session?.access_token) {
      void fetchSubscription();
    } else if (!user) {
      setSubscription(null);
    }
  }, [user, session?.access_token, fetchSubscription]);

  return {
    subscription,
    loading,
    error,
    refresh: fetchSubscription,
    isPaid: subscription && subscription.plan !== "free",
  };
}
