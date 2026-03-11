"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "~~/lib/supabaseBrowser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [status, setStatus] = useState<"working" | "done" | "error">("working");
  const [message, setMessage] = useState<string>("Completing sign-in…");

  useEffect(() => {
    const run = async () => {
      try {
        const code = searchParams.get("code");
        const errorDescription = searchParams.get("error_description");
        if (errorDescription) throw new Error(errorDescription);
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        setStatus("done");
        setMessage("Signed in. Redirecting…");
        router.replace("/");
      } catch (e) {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Sign-in failed.");
      }
    };
    run();
  }, [router, searchParams, supabase]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6">
            <div className="text-[10px] uppercase tracking-widest font-bold text-base-content/40 mb-2">
              Auth callback
            </div>
            <div className="font-bold text-base-content mb-2">
              {status === "working" ? "Signing you in" : status === "done" ? "Done" : "Error"}
            </div>
            <div className="text-sm text-base-content/70 break-words">{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

