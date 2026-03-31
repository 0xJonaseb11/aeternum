"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowPathIcon,
  CreditCardIcon,
  KeyIcon,
  PlusIcon,
  UserCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";
import { WalletLinkStatus } from "~~/components/auth/WalletLinkStatus";
import { resetOnboardingTour } from "~~/components/ui/OnboardingTour";
import { useUserProfile } from "~~/hooks/useUserProfile";
import { getSupabaseBrowserClient } from "~~/lib/supabaseBrowser";

function NavCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="card bg-base-100/50 backdrop-blur-sm border border-base-300/50 shadow-sm hover:border-primary/30 transition-all hover:shadow-md group rounded-2xl"
    >
      <div className="card-body flex-row items-center gap-5 py-5 px-6">
        <div className="rounded-xl bg-primary/5 p-3 text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base-content text-sm md:text-base">{title}</h2>
          <p className="text-xs text-base-content/50 mt-0.5">{description}</p>
        </div>
        <span className="text-base-content/10 group-hover:text-primary/40 transition-colors text-lg">→</span>
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
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-12">
        <h1 className="text-3xl font-black text-base-content tracking-tight uppercase">Settings</h1>
        <p className="text-sm text-base-content/50 mt-2 font-medium">
          Manage your identity, subscription, and developer tools.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        <section>
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="p-1.5 rounded-lg bg-primary/5">
              <UserCircleIcon className="h-5 w-5 text-primary/70" />
            </div>
            <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary/70">Profile & Identity</h2>
          </div>
          <AccountSection />
          <div className="mt-4">
            <ProfileEditor />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3 mb-2 px-1">
            <div className="p-1.5 rounded-lg bg-primary/5">
              <CreditCardIcon className="h-5 w-5 text-primary/70" />
            </div>
            <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary/70">Billing & Growth</h2>
          </div>
          <NavCard
            href="/billing"
            icon={<CreditCardIcon className="h-5 w-5" />}
            title="Subscription & Usage"
            description="View your plan, billing history, and resource consumption."
          />
          <NavCard
            href="/plans"
            icon={<PlusIcon className="h-5 w-5" />}
            title="Upgrade Plan"
            description="Explore premium features and scale your evidence vault."
          />
        </section>

        <section className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3 mb-2 px-1">
            <div className="p-1.5 rounded-lg bg-primary/5">
              <KeyIcon className="h-5 w-5 text-primary/70" />
            </div>
            <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary/70">Advanced Tools</h2>
          </div>
          <NavCard
            href="/settings/api-keys"
            icon={<KeyIcon className="h-5 w-5" />}
            title="Developer API Keys"
            description="Manage authentication keys for external integrations."
          />
          <NavCard
            href="/team"
            icon={<UserGroupIcon className="h-5 w-5" />}
            title="Team & Organizations"
            description="Collaborate with others and manage access control."
          />
        </section>

        <section className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3 mb-2 px-1">
            <div className="p-1.5 rounded-lg bg-primary/5">
              <ArrowPathIcon className="h-5 w-5 text-primary/70" />
            </div>
            <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary/70">Preferences</h2>
          </div>
          <div className="card bg-base-100/50 backdrop-blur-sm border border-base-300/50 shadow-sm rounded-2xl">
            <div className="card-body flex-row items-center gap-5 py-5 px-6">
              <div className="rounded-xl bg-primary/5 p-3 text-primary">
                <ArrowPathIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base-content text-sm md:text-base">Restart Onboarding Tour</h2>
                <p className="text-xs text-base-content/50 mt-0.5">
                  See the guided walkthrough again on your next visit to the homepage.
                </p>
              </div>
              <button
                className="btn btn-sm btn-outline btn-primary rounded-xl"
                onClick={() => {
                  resetOnboardingTour();
                  toast.success("Tour reset! Visit the homepage to see it again.");
                }}
              >
                Reset Tour
              </button>
            </div>
          </div>
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
    <div className="card bg-base-100/40 border border-base-300/50 shadow-sm overflow-hidden rounded-2xl backdrop-blur-sm">
      <div className="card-body gap-4 py-5 px-6">
        <div className="flex items-center gap-5">
          <div className="rounded-xl bg-primary/5 p-3 text-primary">
            <UserCircleIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base-content md:text-lg">Account</h2>
            <p className="text-xs text-base-content/50 mt-0.5">Manage your identity and wallet link.</p>
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

function ProfileEditor() {
  const { profile, updateProfile, loading } = useUserProfile();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    avatar_url: "",
    bio: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  if (loading || !profile) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (updateProfile) {
        await updateProfile(formData);
        toast.success("Profile updated");
        setEditing(false);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card bg-base-100/40 border border-base-300/50 shadow-sm overflow-hidden mt-4 rounded-2xl backdrop-blur-sm">
      <div className="card-body gap-4 py-5 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="rounded-xl bg-primary/5 p-3 text-primary">
              <UserCircleIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base-content md:text-lg">Public Profile</h2>
              <p className="text-xs text-base-content/50 mt-0.5">How others see you in teams and orgs.</p>
            </div>
          </div>
          {!editing && (
            <button className="btn btn-xs md:btn-sm btn-outline" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4 pt-4">
            <div className="form-control">
              <label className="label" htmlFor="full_name">
                <span className="label-text font-bold">Full Name</span>
              </label>
              <input
                id="full_name"
                type="text"
                placeholder="Jane Doe"
                className="input input-bordered"
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="form-control">
              <label className="label" htmlFor="avatar_url">
                <span className="label-text font-bold">Avatar URL</span>
              </label>
              <input
                id="avatar_url"
                type="url"
                placeholder="https://..."
                className="input input-bordered"
                value={formData.avatar_url}
                onChange={e => setFormData({ ...formData, avatar_url: e.target.value })}
              />
            </div>
            <div className="form-control">
              <label className="label" htmlFor="bio">
                <span className="label-text font-bold">Bio</span>
              </label>
              <textarea
                id="bio"
                className="textarea textarea-bordered h-24"
                placeholder="Tell us a little about yourself..."
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
              ></textarea>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    full_name: profile.full_name || "",
                    avatar_url: profile.avatar_url || "",
                    bio: profile.bio || "",
                  });
                }}
                disabled={saving}
              >
                Cancel
              </button>
              <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex gap-6 items-start rounded-xl border border-base-300 bg-base-200/20 p-6">
            <div className="avatar">
              <div className="w-16 h-16 rounded-full bg-base-300 ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden relative">
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" unoptimized />
                ) : (
                  <span className="text-2xl font-bold flex items-center justify-center h-full w-full opacity-30">
                    {(profile.full_name?.[0] || profile.email?.[0] || "?").toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">
                {profile.full_name || <span className="text-base-content/40 italic">No name set</span>}
              </h3>
              <p className="text-sm mt-2 text-base-content/80 whitespace-pre-wrap">
                {profile.bio || <span className="italic opacity-50">No bio provided.</span>}
              </p>
            </div>
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
