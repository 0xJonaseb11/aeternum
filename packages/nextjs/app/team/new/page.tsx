"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PlusIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

export default function TeamNewPage() {
  const router = useRouter();
  const { session, user } = useSupabaseAuth();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!session?.access_token || !name.trim()) return;
      setSubmitting(true);
      setError(null);
      try {
        const res = await fetch("/api/organizations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ name: name.trim(), slug: slug.trim() || undefined }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError((data as { error?: string }).error ?? "Failed to create organization");
          return;
        }
        const org = (data as { organization?: { id: string } }).organization;
        if (org?.id) router.push(`/team/${org.id}`);
        else router.push("/team");
      } finally {
        setSubmitting(false);
      }
    },
    [session?.access_token, name, slug, router],
  );

  if (!user) {
    return (
      <section className="flex flex-col grow items-center justify-center min-h-[50vh] px-4 py-8">
        <div className="glass p-8 md:p-10 rounded-[2.5rem] border border-primary/20 text-center max-w-lg shadow-2xl relative overflow-hidden group">
          <UserGroupIcon className="h-16 w-16 text-primary mx-auto mb-6 animate-bounce-slow" />
          <h1 className="text-2xl md:text-3xl font-black mb-3 tracking-tight">Access restricted</h1>
          <p className="text-base text-base-content/60 mb-8 leading-relaxed max-w-sm mx-auto">
            You must be signed in to your vault to create a new organization.
          </p>
          <Link
            href="/login"
            className="btn btn-primary btn-lg rounded-2xl px-10 h-14 text-base hover:scale-105 transition-all shadow-xl shadow-primary/20"
          >
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col grow w-full min-w-0">
      <section className="relative pt-8 pb-10 lg:pt-12 lg:pb-16 overflow-hidden border-b border-base-300/50">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(var(--color-primary-rgb),0.08),transparent_70%)]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Link
              href="/team"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-focus mb-6 transition-colors"
            >
              <ArrowLeftIcon className="h-3 w-3" />
              Back to teams
            </Link>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight text-base-content">
              Begin a <br />
              <span className="text-primary italic drop-shadow-sm text-gradient">new organization</span>
            </h1>
            <p className="text-lg md:text-xl text-base-content/60 max-w-2xl mx-auto font-medium leading-relaxed">
              Create a secure workspace to collaborate with your team. <br />
              You will be granted full ownership of the vault.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-base-100 flex-1">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="glass p-8 md:p-12 rounded-[2.5rem] border border-base-300/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-primary/10">
              <PlusIcon className="h-24 w-24" />
            </div>

            {error && (
              <div className="rounded-2xl bg-error/10 text-error text-sm p-4 mb-8 border border-error/20 flex items-center gap-3 font-semibold animate-in fade-in slide-in-from-top-2">
                <div className="h-2 w-2 rounded-full bg-error animate-pulse" />
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-8 relative z-10">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-xs font-black uppercase tracking-widest text-base-content/40 px-1"
                >
                  Organization Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="input input-bordered input-lg w-full bg-base-100/50 focus:bg-base-100 transition-all border-base-300 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Acme Evidence Corp"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
                <p className="text-[10px] text-base-content/40 px-1">
                  The official name of your team workspace as it appears on certificates.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="slug"
                  className="text-xs font-black uppercase tracking-widest text-base-content/40 px-1"
                >
                  Custom Slug (optional)
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 font-bold">@</span>
                  <input
                    id="slug"
                    type="text"
                    className="input input-bordered input-lg w-full pl-10 bg-base-100/50 focus:bg-base-100 transition-all border-base-300 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm"
                    placeholder="acme"
                    value={slug}
                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  />
                </div>
                <p className="text-[10px] text-base-content/40 px-1">
                  Unique identifier used for your team vault URL and internal references.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className={`btn btn-primary btn-lg rounded-2xl flex-1 h-16 text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all ${
                    submitting ? "loading" : ""
                  }`}
                  disabled={submitting || !name.trim()}
                >
                  Create organization
                </button>
                <Link
                  href="/team"
                  className="btn btn-ghost btn-lg rounded-2xl px-8 h-16 text-lg hover:bg-base-200 transition-all"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
