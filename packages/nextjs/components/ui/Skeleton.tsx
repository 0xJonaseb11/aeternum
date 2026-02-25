"use client";

import { type HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement> & { className?: string };

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return <div aria-hidden className={`animate-pulse rounded-md bg-base-300 ${className}`} {...props} />;
}

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-4 w-full max-w-[theme(spacing.48)] ${className}`} />;
}

export function ProofCardSkeleton() {
  return (
    <div className="card bg-base-100 rounded-box border border-base-300 shadow-sm overflow-hidden">
      <div className="card-body gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-8 w-20 rounded-btn" />
          <Skeleton className="h-8 w-20 rounded-btn" />
        </div>
      </div>
    </div>
  );
}

export function ProofListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <ProofCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Skeleton className="h-10 w-64 rounded-lg" />
      <Skeleton className="h-5 w-80 max-w-full rounded" />
      <Skeleton className="h-12 w-44 rounded-btn" />
    </div>
  );
}
