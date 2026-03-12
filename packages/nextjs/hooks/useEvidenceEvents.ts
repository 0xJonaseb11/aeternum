"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

export type EvidenceEvent = {
  id: string;
  user_id: string | null;
  file_hash: string;
  event_type: string;
  at: string;
  data: unknown;
};

async function fetchEvents(fileHash: string, userId?: string | null): Promise<EvidenceEvent[]> {
  const params = new URLSearchParams({ fileHash });
  if (userId) params.set("userId", userId);
  const res = await fetch(`/api/events?${params}`);
  if (!res.ok) {
    throw new Error(`Events API failed: ${res.status}`);
  }
  const json = (await res.json()) as { items: EvidenceEvent[] };
  return json.items ?? [];
}

export function useEvidenceEvents(fileHash: string | undefined) {
  const { user } = useSupabaseAuth();
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: ["evidenceEvents", fileHash, userId],
    queryFn: () => fetchEvents(fileHash!, userId),
    enabled: Boolean(fileHash),
    staleTime: 30_000,
  });
}
