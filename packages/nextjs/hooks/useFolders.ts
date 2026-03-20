"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";

export type FolderItem = {
  id: string;
  name: string;
  created_at: string;
};

async function fetchFolders(organizationId?: string | null, accessToken?: string | null): Promise<FolderItem[]> {
  const params = new URLSearchParams();
  if (organizationId) params.set("organizationId", organizationId);
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(`/api/folders?${params}`, { headers });
  if (!res.ok) {
    throw new Error(`Folders API failed: ${res.status}`);
  }
  const json = (await res.json()) as { folders: FolderItem[] };
  return json.folders ?? [];
}

export function useFolders(organizationId?: string | null) {
  const { session } = useSupabaseAuth();
  const accessToken = session?.access_token;

  return useQuery({
    queryKey: ["folders", organizationId],
    queryFn: () => fetchFolders(organizationId, accessToken),
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });
}
