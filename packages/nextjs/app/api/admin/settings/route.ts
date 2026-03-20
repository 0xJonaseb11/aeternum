import { NextRequest, NextResponse } from "next/server";
import { isPlatformAdmin } from "~~/lib/rbac/isAdmin";
import { getSupabase } from "~~/lib/supabase";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req);
  const walletAddress = req.headers.get("x-wallet-address") || undefined;

  if (!isPlatformAdmin(user, walletAddress)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "DB error" }, { status: 500 });

  const { data, error } = await supabase.from("platform_settings").select("*");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const settings = data.reduce((acc: any, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req);
  const walletAddress = req.headers.get("x-wallet-address") || undefined;

  if (!isPlatformAdmin(user, walletAddress)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "DB error" }, { status: 500 });

  try {
    const { key, value } = await req.json();

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const { error } = await supabase.from("platform_settings").upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
      updated_by: user?.id,
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
