"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/verification");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="loading loading-spinner text-primary"></span>
    </div>
  );
}
