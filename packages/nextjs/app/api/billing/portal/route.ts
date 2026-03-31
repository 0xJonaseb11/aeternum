import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionForUser } from "~~/lib/billing/getSubscription";
import { createPortalSession } from "~~/lib/billing/stripe";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

export async function POST(req: NextRequest) {
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
  const sub = await getSubscriptionForUser(user.id);
  if (!sub.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account yet" }, { status: 400 });
  }
  const origin = req.nextUrl.origin;
  const url = await createPortalSession(sub.stripeCustomerId, `${origin}/settings`);
  if (!url) {
    return NextResponse.json({ error: "Could not create portal session" }, { status: 500 });
  }
  return NextResponse.json({ url });
}
