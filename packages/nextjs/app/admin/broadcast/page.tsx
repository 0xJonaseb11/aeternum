"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeftIcon, MegaphoneIcon } from "@heroicons/react/24/outline";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

export default function AdminBroadcast() {
  const { user } = useSupabaseAuth();

  if (!user) return <div className="p-8 text-center mt-20">Sign in to access admin tools.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin" className="btn btn-ghost btn-circle">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <MegaphoneIcon className="h-8 w-8 text-secondary" />
            Broadcast Update
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            Send a global notification or update alert to all active users.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="text-lg font-bold mb-4">Draft Broadcast</h2>
            <div className="form-control w-full space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-bold">Subject / Title</span>
                </label>
                <input type="text" placeholder="e.g. System Maintenance" className="input input-bordered w-full" />
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-bold">Message Content</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-32 w-full"
                  placeholder="Describe the update..."
                ></textarea>
              </div>
              <div className="flex gap-4">
                <button className="btn btn-primary px-8" disabled>
                  Send Broadcast
                </button>
                <button className="btn btn-ghost">Save Draft</button>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="text-lg font-bold mb-4">Preview</h2>
            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <MegaphoneIcon className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">System Notification</span>
              </div>
              <h4 className="font-bold text-sm">System Maintenance</h4>
              <p className="text-xs mt-1 text-base-content/70">Describe the update...</p>
            </div>
            <p className="text-[10px] text-base-content/40 mt-4 italic">
              Broadcasts appear as sticky banners or modal alerts for all active organization members.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
