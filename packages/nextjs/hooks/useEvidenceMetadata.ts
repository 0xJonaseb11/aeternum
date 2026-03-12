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

async function fetchEvidence(fileHash: string, userId?: string | null): Promise<EvidenceMetadata | null> {
  const params = new URLSearchParams({ fileHash });
  if (userId) params.set("userId", userId);
  const res = await fetch(`/api/evidence?${params}`);
  if (!res.ok) {
    throw new Error(`Evidence API failed: ${res.status}`);
  }
  const json = (await res.json()) as { item: EvidenceMetadata | null };
  return json.item ?? null;
}

async function saveEvidence(input: { fileHash: string; userId?: string | null; title?: string; description?: string }) {
  const res = await fetch("/api/evidence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileHash: input.fileHash,
      userId: input.userId,
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

export function useEvidenceMetadata(fileHash: string | undefined) {
  const { user } = useSupabaseAuth();
  const userId = user?.id ?? null;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["evidenceMetadata", fileHash, userId],
    queryFn: () => fetchEvidence(fileHash!, userId),
    enabled: Boolean(fileHash),
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: (input: { title?: string; description?: string }) =>
      saveEvidence({ fileHash: fileHash!, userId, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidenceMetadata", fileHash, userId] });
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
