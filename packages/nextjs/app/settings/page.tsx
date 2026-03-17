"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { CreditCardIcon, KeyIcon, PlusIcon, UserCircleIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";
import { WalletLinkStatus } from "~~/components/auth/WalletLinkStatus";
import { getSupabaseBrowserClient } from "~~/lib/supabaseBrowser";

function NavCard({ href, icon, title, description }: { href: string; icon: any; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="card bg-base-100 border border-base-300 shadow-sm hover:border-primary/30 transition-all hover:shadow-md group"
    >
      <div className="card-body flex-row items-center gap-4 py-6">
        <div className="rounded-xl bg-primary/10 p-3 group-hover:scale-110 transition-transform">{icon}</div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base-content">{title}</h2>
          <p className="text-xs text-base-content/60">{description}</p>
        </div>
        <span className="text-base-content/20 group-hover:text-primary transition-colors">→</span>
      </div>
    </Link>
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-base-content tracking-tight">Settings</h1>
        <p className="text-sm text-base-content/60 mt-1">Manage your identity, subscription, and developer tools.</p>
      </div>

      <div className="flex flex-col gap-8">
        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <UserCircleIcon className="h-4 w-4 text-primary" />
            <h2 className="text-[10px] uppercase font-black tracking-widest text-base-content/40">
              Profile & Identity
            </h2>
          </div>
          <AccountSection />
        </section>

        <section className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-2 mb-1 px-1">
            <CreditCardIcon className="h-4 w-4 text-primary" />
            <h2 className="text-[10px] uppercase font-black tracking-widest text-base-content/40">Billing & Growth</h2>
          </div>
          <NavCard
            href="/billing"
            icon={<CreditCardIcon className="h-6 w-6 text-primary" />}
            title="Subscription & Usage"
            description="View your plan, billing history, and resource consumption."
          />
          <NavCard
            href="/plans"
            icon={<PlusIcon className="h-6 w-6 text-primary" />}
            title="Upgrade Plan"
            description="Explore premium features and scale your evidence vault."
          />
        </section>

        <section className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-2 mb-1 px-1">
            <KeyIcon className="h-4 w-4 text-primary" />
            <h2 className="text-[10px] uppercase font-black tracking-widest text-base-content/40">Advanced Tools</h2>
          </div>
          <NavCard
            href="/settings/api-keys"
            icon={<KeyIcon className="h-6 w-6 text-primary" />}
            title="Developer API Keys"
            description="Manage authentication keys for external integrations."
          />
          <NavCard
            href="/team"
            icon={<UserGroupIcon className="h-6 w-6 text-primary" />}
            title="Team & Organizations"
            description="Collaborate with others and manage access control."
          />
        </section>
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

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}
