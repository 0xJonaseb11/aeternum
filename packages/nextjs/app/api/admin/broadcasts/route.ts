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

  const { data, error } = await supabase.from("broadcasts").select("*").order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req);
  const walletAddress = req.headers.get("x-wallet-address") || undefined;

  if (!isPlatformAdmin(user, walletAddress)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "DB error" }, { status: 500 });

  try {
    const { id, title, content, status, type } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const payload: any = {
      title,
      content,
      status,
      type,
    };

    if (status === "sent") {
      payload.sent_at = new Date().toISOString();
    }

    let result;
    if (id) {
      // Update existing
      result = await supabase.from("broadcasts").update(payload).eq("id", id).select();
    } else {
      // Create new
      result = await supabase.from("broadcasts").insert(payload).select();
    }

    if (result.error) throw result.error;

    return NextResponse.json({ ok: true, item: result.data?.[0] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
