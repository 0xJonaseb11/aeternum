import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "~~/lib/supabase";
import { eventsPostSchema } from "~~/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const fileHash = searchParams.get("fileHash");

  if (!fileHash) {
    return NextResponse.json({ error: "Missing fileHash" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("file_hash", fileHash)
    .order("at", { ascending: false })
    .limit(20);
  if (error) {
    console.error("Supabase GET /api/events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = eventsPostSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] ?? parsed.error.message;
    return NextResponse.json({ error: "Validation failed", details: msg }, { status: 400 });
  }
  const { fileHash, eventType, data } = parsed.data;

  const { error } = await supabase
    .from("events")
    .insert({ user_id: null, file_hash: fileHash, event_type: eventType, data: data ?? null });

  if (error) {
    console.error("Supabase POST /api/events error:", error);
    return NextResponse.json({ error: "Failed to save event" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
