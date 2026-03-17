"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { CreditCardIcon, KeyIcon, TrashIcon, UserCircleIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";
import { WalletLinkStatus } from "~~/components/auth/WalletLinkStatus";
import { type PlanId, getPlanLimits } from "~~/lib/billing/plans";
import { getSupabaseBrowserClient } from "~~/lib/supabaseBrowser";

type ApiKeyRow = {
  id: string;
  name: string | null;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
};

function ApiKeysSection() {
  const { session, user } = useSupabaseAuth();
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/api-keys", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError((j as { error?: string }).error ?? "Failed to load keys");
        return;
      }
      const data = (await res.json()) as { keys: ApiKeyRow[] };
      setKeys(data.keys ?? []);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  const createKey = useCallback(async () => {
    if (!session?.access_token) return;
    setCreating(true);
    setError(null);
    setNewKey(null);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ name: "My API key" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Failed to create key");
        return;
      }
      setNewKey((data as { key: string }).key ?? null);
      void fetchKeys();
    } finally {
      setCreating(false);
    }
  }, [session?.access_token, fetchKeys]);

  const revokeKey = useCallback(
    async (id: string) => {
      if (!session?.access_token) return;
      try {
        const res = await fetch(`/api/api-keys/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) void fetchKeys();
      } catch {
        setError("Failed to revoke");
      }
    },
    [session?.access_token, fetchKeys],
  );

  useEffect(() => {
    if (user && session?.access_token) void fetchKeys();
  }, [user, session?.access_token, fetchKeys]);

  if (!user) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body flex-row items-center gap-4">
          <div className="rounded-lg bg-base-300/50 p-3">
            <KeyIcon className="h-6 w-6 text-base-content/60" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base-content">API keys</h2>
            <p className="text-xs text-base-content/60">Sign in to create and manage keys for the developer API.</p>
          </div>
          <Link href="/login" className="btn btn-primary btn-sm">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <KeyIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-base-content">API keys</h2>
              <p className="text-xs text-base-content/60">Use keys to authenticate with the developer API.</p>
            </div>
          </div>
          <button type="button" onClick={fetchKeys} disabled={loading} className="btn btn-ghost btn-sm">
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        {newKey && (
          <div className="rounded-lg bg-success/10 border border-success/30 p-3">
            <p className="text-xs font-bold text-success mb-1">New key — copy it now; it won’t be shown again.</p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="text-xs font-mono break-all flex-1">{newKey}</code>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  void navigator.clipboard.writeText(newKey);
                  setNewKey(null);
                }}
              >
                Copy & dismiss
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {keys.length === 0 && !loading && (
            <p className="text-sm text-base-content/50">No API keys yet. Create one to use the developer API.</p>
          )}
          {keys.map(k => (
            <div
              key={k.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-base-300 bg-base-200/50 p-3"
            >
              <div className="min-w-0">
                <p className="font-mono text-sm truncate">{k.key_prefix}…</p>
                <p className="text-xs text-base-content/50">
                  {k.name ?? "Unnamed"} · {new Date(k.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-xs text-error"
                onClick={() => revokeKey(k.id)}
                aria-label="Revoke key"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm w-full sm:w-auto"
          onClick={createKey}
          disabled={creating}
        >
          {creating ? "Creating…" : "Create API key"}
        </button>
      </div>
    </div>
  );
}

type SubscriptionData = {
  plan: PlanId;
  status: string;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  proofsThisMonth: number;
  proofsLimit: number; // -1 = unlimited
};

type UsageSummary = {
  plan: PlanId;
  proofs: { used: number; limit: number };
  apiRequests: { used: number; limit: number };
};

function BillingSection() {
  const { session, user } = useSupabaseAuth();
  const [sub, setSub] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanId | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

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
      setSub(data);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (user && session?.access_token) void fetchSubscription();
  }, [user, session?.access_token, fetchSubscription]);

  const startCheckout = useCallback(
    async (plan: PlanId, priceId?: string) => {
      if (!session?.access_token || plan === "free") return;
      setCheckoutPlan(plan);
      setError(null);
      try {
        const base = typeof window !== "undefined" ? window.location.origin : "";
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({
            plan,
            priceId,
            successUrl: `${base}/settings?billing=success`,
            cancelUrl: `${base}/settings?billing=cancel`,
          }),
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok) {
          setError(data.error ?? "Checkout failed");
          return;
        }
        if (data.url) window.location.href = data.url;
      } finally {
        setCheckoutPlan(null);
      }
    },
    [session?.access_token],
  );

  const openPortal = useCallback(async () => {
    if (!session?.access_token) return;
    setPortalLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          returnUrl: typeof window !== "undefined" ? `${window.location.origin}/settings` : "/settings",
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not open portal");
        return;
      }
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }, [session?.access_token]);

  if (!user) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body flex-row items-center gap-4">
          <div className="rounded-lg bg-base-300/50 p-3">
            <CreditCardIcon className="h-6 w-6 text-base-content/60" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base-content">Billing</h2>
            <p className="text-xs text-base-content/60">Sign in to view plans and manage your subscription.</p>
          </div>
          <Link href="/login" className="btn btn-primary btn-sm">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const limits = sub ? getPlanLimits(sub.plan) : null;
  const canManage = Boolean(sub?.stripeCustomerId);
  const isPaid = sub && sub.plan !== "free";

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm relative overflow-hidden">
      {isPaid && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-[10px] font-bold text-primary-content uppercase tracking-widest rounded-bl-lg">
          Premium
        </div>
      )}
      <div className="card-body gap-4">
        <div className="flex items-center gap-4">
          <div className={`rounded-lg p-3 ${isPaid ? "bg-primary/10" : "bg-base-300/50"}`}>
            <CreditCardIcon className={`h-6 w-6 ${isPaid ? "text-primary" : "text-base-content/60"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base-content">Billing</h2>
            <p className="text-xs text-base-content/60">Plans and subscription</p>
          </div>
        </div>
        {error && <div className="rounded-lg bg-error/10 text-error text-sm p-3">{error}</div>}
        {loading ? (
          <p className="text-sm text-base-content/60">Loading…</p>
        ) : sub ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`badge badge-lg capitalize ${isPaid ? "badge-primary" : ""}`}>{sub.plan}</span>
              <span className="text-sm text-base-content/70">{sub.status}</span>
              {sub.currentPeriodEnd && (
                <span className="text-xs text-base-content/50">
                  Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </span>
              )}
            </div>
            {limits && (
              <p className="text-xs text-base-content/60">
                {sub.proofsLimit === -1 ? (
                  <>{sub.proofsThisMonth} proofs this month (unlimited)</>
                ) : (
                  <strong className="text-base-content/80">
                    {sub.proofsThisMonth} / {sub.proofsLimit}
                  </strong>
                )}{" "}
                proofs this month
                {limits.apiRequestsPerMonth !== -1 &&
                  ` · ${limits.apiRequestsPerMonth.toLocaleString()} API requests/month`}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                className="btn btn-primary btn-sm h-12 flex flex-col items-center justify-center gap-0.5"
                disabled={sub.plan === "pro" || checkoutPlan !== null}
                onClick={() => startCheckout("pro")}
              >
                <span className="text-xs capitalize">{sub.plan === "pro" ? "Current Plan" : "Upgrade to Pro"}</span>
                <span className="text-[10px] opacity-70 font-normal">$20 / month</span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm h-12 flex flex-col items-center justify-center gap-0.5"
                disabled={sub.plan === "business" || checkoutPlan !== null}
                onClick={() => startCheckout("business")}
              >
                <span className="text-xs capitalize">
                  {sub.plan === "business" ? "Current Plan" : "Upgrade to Business"}
                </span>
                <span className="text-[10px] opacity-70 font-normal">$100 / month</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm h-12 flex flex-col items-center justify-center gap-0.5"
                disabled={sub.plan === "enterprise" || checkoutPlan !== null}
                onClick={() => startCheckout("enterprise")}
              >
                <span className="text-xs capitalize">
                  {sub.plan === "enterprise" ? "Current Plan" : "Enterprise Monthly"}
                </span>
                <span className="text-[10px] opacity-70 font-normal">$150 / month</span>
              </button>

              <button
                type="button"
                className="btn btn-accent btn-sm h-12 flex flex-col items-center justify-center gap-0.5"
                disabled={sub.plan === "enterprise" || checkoutPlan !== null}
                onClick={() => startCheckout("enterprise", "discounted")}
              >
                <span className="text-xs capitalize">Enterprise Quarter</span>
                <span className="text-[10px] opacity-70 font-normal">$399 / 3 months (Best Value)</span>
              </button>
            </div>
            {canManage && (
              <button
                type="button"
                className="btn btn-ghost btn-sm w-full mt-2"
                disabled={portalLoading}
                onClick={openPortal}
              >
                {portalLoading ? "Opening…" : "Manage subscription in Stripe Dashboard"}
              </button>
            )}
          </>
        ) : (
          <p className="text-sm text-base-content/60">Free plan. Upgrade for more proofs and API usage.</p>
        )}
      </div>
    </div>
  );
}

function UsageSection() {
  const { session, user } = useSupabaseAuth();
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/usage", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError((j as { error?: string }).error ?? "Failed to load usage");
        return;
      }
      const data = (await res.json()) as UsageSummary;
      setUsage(data);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (user && session?.access_token) void fetchUsage();
  }, [user, session?.access_token, fetchUsage]);

  if (!user) return null;

  const planLimits = usage ? getPlanLimits(usage.plan) : null;
  const proofsUsed = usage?.proofs.used ?? 0;
  const proofsLimit = usage?.proofs.limit ?? planLimits?.proofsPerMonth ?? 0;
  const apiUsed = usage?.apiRequests.used ?? 0;
  const apiLimit = usage?.apiRequests.limit ?? planLimits?.apiRequestsPerMonth ?? 0;

  const formatLimit = (v: number) => (v < 0 ? "∞" : v.toLocaleString());

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <UserGroupIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-base-content">Usage this month</h2>
              <p className="text-xs text-base-content/60">
                Track proofs and API requests against your{" "}
                <span className="font-semibold">{usage?.plan ?? "free"}</span> plan.
              </p>
            </div>
          </div>
          <button type="button" onClick={fetchUsage} disabled={loading} className="btn btn-ghost btn-sm">
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-base-content/60 mb-1">
              <span>Proofs this month</span>
              <span>
                <span className="font-semibold text-base-content">
                  {proofsUsed.toLocaleString()} / {formatLimit(proofsLimit)}
                </span>
              </span>
            </div>
            <progress
              className="progress progress-primary w-full"
              value={proofsLimit > 0 ? Math.min((proofsUsed / proofsLimit) * 100, 100) : 0}
              max={100}
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-base-content/60 mb-1">
              <span>API requests this month</span>
              <span>
                <span className="font-semibold text-base-content">
                  {apiUsed.toLocaleString()} / {formatLimit(apiLimit)}
                </span>
              </span>
            </div>
            <progress
              className="progress progress-secondary w-full"
              value={apiLimit > 0 ? Math.min((apiUsed / apiLimit) * 100, 100) : 0}
              max={100}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountSection() {
  const { user, isLoading, signOut } = useSupabaseAuth();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendMagicLink = async () => {
    setError(null);
    setMessage(null);
    setSending(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}/auth/callback`;
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (signInError) throw signInError;
      setMessage("Check your email for the sign-in link.");
      toast.success("Magic link sent!");
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Failed to send sign-in email.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
      <div className="card-body gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <UserCircleIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base-content">Account</h2>
            <p className="text-xs text-base-content/60">Manage your identity and wallet link.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-sm text-base-content/60 py-2">Loading…</div>
        ) : user ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-base-300 bg-base-200/40 p-4 space-y-2">
                <div className="text-[10px] uppercase tracking-widest font-bold text-base-content/40">Signed in</div>
                <div className="text-sm break-all font-medium">{user.email ?? "Email account"}</div>
              </div>

              <div className="rounded-xl border border-base-300 bg-base-200/40 p-4 space-y-2">
                <div className="text-[10px] uppercase tracking-widest font-bold text-base-content/40">Wallet link</div>
                <WalletLinkStatus />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                className="btn btn-outline btn-error btn-sm"
                onClick={async () => {
                  await signOut();
                  toast.success("Signed out successfully");
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold">Sign in with email</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  className="input input-bordered grow sm:w-auto"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <button
                  className={`btn btn-primary ${sending ? "loading" : ""}`}
                  disabled={sending || !email.includes("@")}
                  onClick={sendMagicLink}
                >
                  Send link
                </button>
              </div>
              {error && <p className="mt-2 text-xs text-error">{error}</p>}
              {message && <p className="mt-2 text-xs text-success">{message}</p>}
            </div>
            <p className="text-xs text-base-content/50">
              New to Aeternum? Just enter your email to create an account instantly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const billing = searchParams.get("billing");
    if (billing === "success") {
      toast.success("Subscription updated.");
      window.history.replaceState({}, "", "/settings");
    } else if (billing === "cancel") {
      toast("Checkout cancelled.");
      window.history.replaceState({}, "", "/settings");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-base-content mb-2">Settings</h1>
        <p className="text-sm text-base-content/60 mb-8">Manage your account, API keys, and billing.</p>

        <div className="flex flex-col gap-4">
          <AccountSection />
          <ApiKeysSection />
          <BillingSection />
          <UsageSection />
          <Link
            href="/team"
            className="card bg-base-100 border border-base-300 shadow-sm hover:border-primary/30 transition-colors"
          >
            <div className="card-body flex-row items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <UserGroupIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base-content">Team</h2>
                <p className="text-xs text-base-content/60">Organizations and members</p>
              </div>
              <span className="text-base-content/40">→</span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}
