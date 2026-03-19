"use client";

import { useEffect, useMemo, useState } from "react";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { useSupabaseAuth } from "~~/components/auth/SupabaseAuthProvider";
import { getSupabaseBrowserClient } from "~~/lib/supabaseBrowser";

export type UserProfile = {
  id: string;
  email: string | null;
  primary_wallet_address: string | null;
  created_at: string;
};

export function useUserProfile() {
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProfile(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      const { data, error: fetchError }: PostgrestSingleResponse<UserProfile> = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (cancelled) return;

      if (fetchError && fetchError.code !== "PGRST116") {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      if (!data) {
        const insert = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
          })
          .select("*")
          .single<UserProfile>();

        if (insert.error) {
          setError(insert.error.message);
          setLoading(false);
          return;
        }
        setProfile(insert.data);
        setLoading(false);
      } else {
        setProfile(data);
        setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, supabase, user]);

  const linkWallet = async (walletAddress: string) => {
    if (!user) {
      setError("You must be signed in to link a wallet.");
      return;
    }
    setError(null);
    const { data, error: upsertError } = await supabase
      .from("profiles")
      .update({ primary_wallet_address: walletAddress })
      .eq("id", user.id)
      .select("*")
      .single<UserProfile>();

    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    setProfile(data);
  };

  return {
    profile,
    loading: authLoading || loading,
    error,
    linkWallet,
  };
}
