import { NextRequest, NextResponse } from "next/server";
import { isPlatformAdmin } from "~~/lib/rbac/isAdmin";
import { getSupabase } from "~~/lib/supabase";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const { user, status } = await getCurrentUserFromRequest(req);
  const walletAddress = req.headers.get("x-wallet-address") || undefined;

  if (status === "maintenance") {
    return NextResponse.json({ error: "System under maintenance" }, { status: 503 });
  }

  if (!isPlatformAdmin(user, walletAddress)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "DB error" }, { status: 500 });

  const { data, error } = await supabase
    .from("blocked_addresses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest) {
  const { user, status } = await getCurrentUserFromRequest(req);
  const walletAddress = req.headers.get("x-wallet-address") || undefined;

  if (status === "maintenance") {
    return NextResponse.json({ error: "System under maintenance" }, { status: 503 });
  }

  if (!isPlatformAdmin(user, walletAddress)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "DB error" }, { status: 500 });

  try {
    const { address: targetAddress, reason } = await req.json();

    if (!targetAddress) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const { error } = await supabase.from("blocked_addresses").insert({
      address: targetAddress.toLowerCase(),
      reason,
      blocked_by: user?.id,
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { user, status } = await getCurrentUserFromRequest(req);
  const walletAddress = req.headers.get("x-wallet-address") || undefined;

  if (status === "maintenance") {
    return NextResponse.json({ error: "System under maintenance" }, { status: 503 });
  }

  if (!isPlatformAdmin(user, walletAddress)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const targetAddress = searchParams.get("address");

  if (!targetAddress) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "DB error" }, { status: 500 });

  const { error } = await supabase.from("blocked_addresses").delete().eq("address", targetAddress.toLowerCase());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
