"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

export type EvidenceMetadata = {
  id: string;
  user_id: string | null;
  file_hash: string;
  title: string | null;
  description: string | null;
  case_id: string | null;
  tags: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

async function fetchEvidence(
  fileHash: string,
  userId?: string | null,
  organizationId?: string | null,
  accessToken?: string | null,
): Promise<EvidenceMetadata | null> {
  const params = new URLSearchParams({ fileHash });
  if (userId) params.set("userId", userId);
  if (organizationId) params.set("organizationId", organizationId ?? "");
  const headers: HeadersInit = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(`/api/evidence?${params}`, { headers });
  if (!res.ok) {
    throw new Error(`Evidence API failed: ${res.status}`);
  }
  const json = (await res.json()) as { item: EvidenceMetadata | null };
  return json.item ?? null;
}

async function saveEvidence(input: {
  fileHash: string;
  userId?: string | null;
  organizationId?: string | null;
  title?: string;
  description?: string;
  accessToken?: string | null;
}) {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (input.accessToken) headers.Authorization = `Bearer ${input.accessToken}`;
  const res = await fetch("/api/evidence", {
    method: "POST",
    headers,
    body: JSON.stringify({
      fileHash: input.fileHash,
      userId: input.userId,
      organizationId: input.organizationId ?? undefined,
      title: input.title,
      description: input.description,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to save evidence metadata: ${res.status}`);
  }
  const json = (await res.json()) as { item: EvidenceMetadata };
  return json.item;
}

export function useEvidenceMetadata(fileHash: string | undefined, organizationId?: string | null) {
  const { user, session } = useSupabaseAuth();
  const userId = user?.id ?? null;
  const accessToken = session?.access_token;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["evidenceMetadata", fileHash, userId, organizationId],
    queryFn: () => fetchEvidence(fileHash!, userId, organizationId, accessToken),
    enabled: Boolean(fileHash),
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: (input: { title?: string; description?: string }) =>
      saveEvidence({
        fileHash: fileHash!,
        userId,
        organizationId,
        accessToken,
        ...input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["evidenceMetadata", fileHash, userId, organizationId],
      });
    },
  });

  return {
    metadata: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    save: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}
