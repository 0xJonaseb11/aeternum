"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
          setError((data as { error?: string }).error ?? "Failed to create");
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
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-base-content/70">Sign in to create an organization.</p>
        <Link href="/login" className="btn btn-primary btn-sm">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/team" className="text-xs font-medium text-base-content/60 hover:text-primary">
          ← Back to Team
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-base-content mb-2">New organization</h1>
      <p className="text-sm text-base-content/60 mb-6">
        Create an organization to collaborate with others. You’ll be the owner.
      </p>
      {error && <div className="rounded-lg bg-error/10 text-error text-sm p-3 mb-4">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            id="name"
            type="text"
            className="input input-bordered w-full"
            placeholder="Acme Inc."
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="slug" className="label">
            <span className="label-text">Slug (optional)</span>
          </label>
          <input
            id="slug"
            type="text"
            className="input input-bordered w-full"
            placeholder="acme"
            value={slug}
            onChange={e => setSlug(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={submitting || !name.trim()}>
            {submitting ? "Creating…" : "Create organization"}
          </button>
          <Link href="/team" className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
