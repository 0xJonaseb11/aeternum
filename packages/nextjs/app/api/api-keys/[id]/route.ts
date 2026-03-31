import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "~~/lib/supabase";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, status } = await getCurrentUserFromRequest(req);
  if (status === "maintenance") {
    return NextResponse.json({ error: "System under maintenance. Please try again later." }, { status: 503 });
  }
  if (status === "blocked") {
    return NextResponse.json({ error: "Account blocked." }, { status: 403 });
  }
  if (!user || status === "unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing key id" }, { status: 400 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
  const { error } = await supabase.from("api_keys").delete().eq("id", id).eq("user_id", user.id);
  if (error) {
    console.error("api-keys DELETE error:", error);
    return NextResponse.json({ error: "Failed to revoke key" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
