import { Suspense } from "react";
import { AuthCallbackClient } from "./ui";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-6">
                <div className="text-[10px] uppercase tracking-widest font-bold text-base-content/40 mb-2">
                  Auth callback
                </div>
                <div className="font-bold text-base-content mb-2">Signing you in</div>
                <div className="text-sm text-base-content/70 break-words">Completing sign-in…</div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
