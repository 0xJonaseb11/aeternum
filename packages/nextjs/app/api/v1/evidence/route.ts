import { NextRequest, NextResponse } from "next/server";
import { getApiKeyAuth } from "~~/lib/api/withApiKey";
import { checkAndIncrementApiUsage } from "~~/lib/billing/apiUsage";
import { logger } from "~~/lib/logger";
import { getClientIdentifier, rateLimit } from "~~/lib/rateLimit";
import { getSupabase } from "~~/lib/supabase";
import { evidencePostSchema } from "~~/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const auth = await getApiKeyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }
  const clientId = getClientIdentifier(req);
  if (!(await rateLimit(clientId, "v1"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const usage = await checkAndIncrementApiUsage(auth.userId);
  if (!usage.allowed) {
    return NextResponse.json({ error: usage.reason ?? "API limit exceeded" }, { status: 429 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
  const { searchParams } = new URL(req.url);
  const fileHash = searchParams.get("fileHash");
  if (fileHash) {
    const { data, error } = await supabase
      .from("evidence")
      .select("*")
      .eq("file_hash", fileHash)
      .eq("user_id", auth.userId)
      .limit(1)
      .maybeSingle();
    if (error) {
      logger.error("v1 evidence GET error", { error: error.message });
      return NextResponse.json({ error: "Failed to fetch evidence" }, { status: 500 });
    }
    return NextResponse.json({ item: data ?? null });
  }
  const { data, error } = await supabase
    .from("evidence")
    .select("*")
    .eq("user_id", auth.userId)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) {
    console.error("v1 evidence GET error:", error);
    return NextResponse.json({ error: "Failed to fetch evidence" }, { status: 500 });
  }
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await getApiKeyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }
  const clientId = getClientIdentifier(req);
  if (!(await rateLimit(clientId, "v1"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const usage = await checkAndIncrementApiUsage(auth.userId);
  if (!usage.allowed) {
    return NextResponse.json({ error: usage.reason ?? "API limit exceeded" }, { status: 429 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = evidencePostSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] ?? parsed.error.message;
    return NextResponse.json({ error: "Validation failed", details: msg }, { status: 400 });
  }
  const { fileHash, title, description, caseId, tags, notes } = parsed.data;
  const payload = {
    title: title ?? null,
    description: description ?? null,
    case_id: caseId ?? null,
    tags: tags ?? null,
    notes: notes ?? null,
    updated_at: new Date().toISOString(),
  };
  const { data: existing } = await supabase
    .from("evidence")
    .select("id")
    .eq("file_hash", fileHash)
    .eq("user_id", auth.userId)
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
      logger.error("v1 evidence POST update error", { error: error.message });
      return NextResponse.json({ error: "Failed to save evidence" }, { status: 500 });
    }
    return NextResponse.json({ item: updated });
  }
  const { data: inserted, error } = await supabase
    .from("evidence")
    .insert({
      user_id: auth.userId,
      file_hash: fileHash,
      ...payload,
    })
    .select("*")
    .maybeSingle();
  if (error) {
    logger.error("v1 evidence POST insert error", { error: error.message });
    return NextResponse.json({ error: "Failed to save evidence" }, { status: 500 });
  }
  return NextResponse.json({ item: inserted });
}
