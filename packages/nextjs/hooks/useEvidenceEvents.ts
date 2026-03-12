"use client";

import { useQuery } from "@tanstack/react-query";

export type EvidenceEvent = {
  id: string;
  user_id: string | null;
  file_hash: string;
  event_type: string;
  at: string;
  data: unknown;
};

async function fetchEvents(fileHash: string): Promise<EvidenceEvent[]> {
  const params = new URLSearchParams({ fileHash });
  const res = await fetch(`/api/events?${params}`);
  if (!res.ok) {
    throw new Error(`Events API failed: ${res.status}`);
  }
  const json = (await res.json()) as { items: EvidenceEvent[] };
  return json.items ?? [];
}

export function useEvidenceEvents(fileHash: string | undefined) {
  return useQuery({
    queryKey: ["evidenceEvents", fileHash],
    queryFn: () => fetchEvents(fileHash!),
    enabled: Boolean(fileHash),
    staleTime: 30_000,
  });
}
