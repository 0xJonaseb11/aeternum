import { NextRequest, NextResponse } from "next/server";
import type { PlanId } from "~~/lib/billing/plans";
import { getPriceId } from "~~/lib/billing/stripe";
import { createCheckoutSession } from "~~/lib/billing/stripe";
import { logger } from "~~/lib/logger";
import { getCurrentUserFromRequest } from "~~/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
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
    let body: { plan?: string; priceId?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const plan = (body.plan ?? "pro") as PlanId;
    if (!["pro", "business", "enterprise"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    const priceId = getPriceId(plan, body.priceId as "discounted" | "standard" | undefined);
    if (!priceId) {
      logger.error("Stripe Checkout price ID not found", { plan, priceId: body.priceId });
      return NextResponse.json(
        { error: "Plan option not configured. Check STRIPE_PRICE environment variables." },
        { status: 400 },
      );
    }
    const origin = req.nextUrl.origin;
    const url = await createCheckoutSession(
      user.id,
      user.email ?? null,
      plan,
      `${origin}/settings?billing=success`,
      `${origin}/settings?billing=cancel`,
      body.priceId,
    );
    if (!url) {
      return NextResponse.json({ error: "Could not create checkout session" }, { status: 500 });
    }
    return NextResponse.json({ url });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("Stripe checkout uncaught error", { error: error.message });
    return NextResponse.json(
      { error: error.message || "Internal Server Error", details: String(err) },
      { status: 500 },
    );
  }
}
