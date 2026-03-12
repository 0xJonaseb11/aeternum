import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "~~/lib/supabase";

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const fileHash = searchParams.get("fileHash");
  const userId = searchParams.get("userId");

  if (!fileHash) {
    return NextResponse.json({ error: "Missing fileHash" }, { status: 400 });
  }

  let query = supabase.from("events").select("*").eq("file_hash", fileHash).order("at", { ascending: false }).limit(20);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
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

  let body: {
    userId?: string;
    fileHash: string;
    eventType: string;
    data?: unknown;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userId, fileHash, eventType, data } = body;
  if (!fileHash || !eventType) {
    return NextResponse.json({ error: "Missing fileHash or eventType" }, { status: 400 });
  }

  const { error } = await supabase.from("events").insert({
    user_id: userId ?? null,
    file_hash: fileHash,
    event_type: eventType,
    data: data ?? null,
  });

  if (error) {
    console.error("Supabase POST /api/events error:", error);
    return NextResponse.json({ error: "Failed to save event" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
