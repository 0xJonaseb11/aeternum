"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";
import { WalletLinkStatus } from "~~/components/auth/WalletLinkStatus";
import { getSupabaseBrowserClient } from "~~/lib/supabaseBrowser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const { user, isLoading, signOut } = useSupabaseAuth();

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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send sign-in email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col grow w-full">
      <section className="bg-pattern pt-12 pb-10 sm:pt-16 sm:pb-14 border-b border-base-300 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-base-content mb-2">Account</h1>
          <p className="text-sm text-base-content/70">Sign in with your email to manage your vault and settings.</p>
        </div>
      </section>

      <section className="py-10 sm:py-14 bg-base-100 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
            <div className="card-body p-5 sm:p-7">
              {isLoading ? (
                <div className="text-sm text-base-content/60">Loading…</div>
              ) : user ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-base-300 bg-base-200/40 p-4 space-y-2">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-base-content/40">
                      Signed in
                    </div>
                    <div className="text-sm break-all">{user.email ?? "Email account"}</div>
                  </div>

                  <div className="rounded-xl border border-base-300 bg-base-200/40 p-4 space-y-2">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-base-content/40">
                      Wallet link
                    </div>
                    <p className="text-xs text-base-content/60">
                      Connect your wallet in the header, then link it to this account so new evidence is clearly tied to
                      you.
                    </p>
                    <WalletLinkStatus />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        router.push("/");
                      }}
                    >
                      Continue
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={async () => {
                        await signOut();
                        setMessage("Signed out.");
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text font-bold">Email</span>
                    </div>
                    <input
                      type="email"
                      className="input input-bordered w-full"
                      placeholder="you@company.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </label>

                  {error && <div className="alert alert-error text-sm">{error}</div>}
                  {message && <div className="alert alert-success text-sm">{message}</div>}

                  <button
                    className={`btn btn-primary w-full ${sending ? "loading" : ""}`}
                    disabled={sending || !email.includes("@")}
                    onClick={sendMagicLink}
                  >
                    Send magic link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
