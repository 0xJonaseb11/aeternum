import { NextRequest, NextResponse } from "next/server";
import { logger } from "~~/lib/logger";
import { getMembership } from "~~/lib/rbac/getMembership";
import { getSupabase } from "~~/lib/supabase";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";
import { eventsPostSchema } from "~~/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const fileHash = searchParams.get("fileHash");
  const userIdParam = searchParams.get("userId");
  const organizationIdParam = searchParams.get("organizationId");

  if (!fileHash) {
    return NextResponse.json({ error: "Missing fileHash" }, { status: 400 });
  }

  let query = supabase.from("events").select("*").eq("file_hash", fileHash).order("at", { ascending: false }).limit(20);

  if (userIdParam != null || (organizationIdParam != null && organizationIdParam !== "")) {
    const user = await getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (organizationIdParam != null && organizationIdParam !== "") {
      const membership = await getMembership(user.id, organizationIdParam);
      if (!membership) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      query = query.eq("user_id", user.id).eq("organization_id", organizationIdParam);
    } else {
      query = query.eq("user_id", user.id).is("organization_id", null);
    }
  }

  const { data, error } = await query;
  if (error) {
    logger.error("Supabase events GET error", { error: error.message });
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

  const user = await getCurrentUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let organizationId: string | null = null;
  const orgIdFromBody = parsed.data.organizationId;
  if (orgIdFromBody != null && orgIdFromBody !== "") {
    const membership = await getMembership(user.id, orgIdFromBody);
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    organizationId = orgIdFromBody;
  }

  const { error } = await supabase.from("events").insert({
    user_id: user.id,
    organization_id: organizationId,
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
