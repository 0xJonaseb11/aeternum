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

  let query = supabase.from("evidence").select("*").eq("file_hash", fileHash).limit(1);
  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Supabase GET /api/evidence error:", error);
    return NextResponse.json({ error: "Failed to fetch evidence" }, { status: 500 });
  }

  return NextResponse.json({ item: data ?? null });
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  let body: {
    userId?: string;
    fileHash: string;
    title?: string;
    description?: string;
    caseId?: string;
    tags?: string[];
    notes?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userId, fileHash, title, description, caseId, tags, notes } = body;
  if (!fileHash) {
    return NextResponse.json({ error: "Missing fileHash" }, { status: 400 });
  }

  const payload = {
    title: title ?? null,
    description: description ?? null,
    case_id: caseId ?? null,
    tags: tags ?? null,
    notes: notes ?? null,
    updated_at: new Date().toISOString(),
  };

  // Select-then-update-or-insert: evidence table has no UNIQUE(file_hash), so we can't use upsert.
  const { data: existing } = await supabase
    .from("evidence")
    .select("id")
    .eq("file_hash", fileHash)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { data: updated, error } = await supabase
      .from("evidence")
      .update(payload)
      .eq("id", existing.id)
      .select("*")
      .maybeSingle();
    if (error) {
      console.error("Supabase POST /api/evidence update error:", error);
      return NextResponse.json({ error: "Failed to save evidence" }, { status: 500 });
    }
    return NextResponse.json({ item: updated });
  }

  const { data: inserted, error } = await supabase
    .from("evidence")
    .insert({
      user_id: userId ?? null,
      file_hash: fileHash,
      ...payload,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Supabase POST /api/evidence insert error:", error);
    return NextResponse.json({ error: "Failed to save evidence" }, { status: 500 });
  }

  return NextResponse.json({ item: inserted });
}
