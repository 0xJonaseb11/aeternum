"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BuildingOfficeIcon, RocketLaunchIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";
import { notification } from "~~/utils/scaffold-eth";

export default function NewOrganizationPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useSupabaseAuth();
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !session?.access_token) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, "-"),
        }),
      });

      if (res.ok) {
        const org = await res.json();
        notification.success("Organization created successfully!");
        router.push(`/org/${org.id}`);
      } else {
        const error = await res.json();
        notification.error(error.error || "Failed to create organization");
      }
    } catch (err) {
      console.error(err);
      notification.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-pattern min-h-[80vh]">
      <div className="max-w-md w-full glass p-8 rounded-3xl border border-primary/10 shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <BuildingOfficeIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create Organization</h1>
          <p className="text-base-content/60 text-sm mt-2">
            Establish a secure collaborative vault for your team's evidence.
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-base-content/50 ml-1">
              Organization Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40 group-focus-within:text-primary transition-colors">
                <UserGroupIcon className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="e.g. Acme Investigations"
                className="input input-bordered w-full pl-10 bg-base-100/50 border-base-300 focus:border-primary transition-all rounded-xl"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-base-content/50 ml-1">URL Slug</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-base-300/30 rounded-xl border border-base-300/50">
              <span className="text-xs text-base-content/40 font-mono">aeternum.app/org/</span>
              <input
                type="text"
                placeholder="acme-inv"
                className="bg-transparent border-none outline-none text-xs font-mono flex-1 text-primary"
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className={`btn btn-primary w-full rounded-xl gap-2 h-12 ${isLoading ? "loading" : ""}`}
            >
              {!isLoading && <RocketLaunchIcon className="w-5 h-5" />}
              {isLoading ? "Creating..." : "Launch Organization"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-base-content/40 leading-relaxed px-4">
          By creating an organization, you agree to our terms of service regarding data privacy and permanence.
        </p>
      </div>
    </div>
  );
}
