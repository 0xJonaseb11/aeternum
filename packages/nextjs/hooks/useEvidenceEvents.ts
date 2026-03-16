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

async function fetchEvents(
  fileHash: string,
  userId?: string | null,
  organizationId?: string | null,
  accessToken?: string | null,
): Promise<EvidenceEvent[]> {
  const params = new URLSearchParams({ fileHash });
  if (userId) {
    params.set("userId", userId);
    if (organizationId) params.set("organizationId", organizationId ?? "");
  }
  const headers: HeadersInit = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(`/api/events?${params}`, { headers });
  if (!res.ok) {
    throw new Error(`Events API failed: ${res.status}`);
  }
  const json = (await res.json()) as { items: EvidenceEvent[] };
  return json.items ?? [];
}

export function useEvidenceEvents(fileHash: string | undefined, organizationId?: string | null) {
  const { user, session } = useSupabaseAuth();
  const userId = user?.id;
  const accessToken = session?.access_token;

  return useQuery({
    queryKey: ["evidenceEvents", fileHash, userId, organizationId],
    queryFn: () => fetchEvents(fileHash!, userId, organizationId, accessToken),
    enabled: Boolean(fileHash),
    staleTime: 30_000,
  });
}
