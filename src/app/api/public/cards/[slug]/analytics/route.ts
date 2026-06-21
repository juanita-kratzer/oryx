import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logCardAnalyticsEvent } from "@/lib/analytics";
import { parseVisitSource } from "@/lib/cardVisitSource";

type Params = { params: Promise<{ slug: string }> };

const ALLOWED = new Set([
  "qr_view",
  "exchange_form_view",
  "reciprocal_pass_offer",
]);

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;

  let body: { event?: string; source?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = body.event;
  if (!event || !ALLOWED.has(event)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const card = await prisma.card.findFirst({
    where: { slug, status: "PAID" },
    select: { id: true },
  });

  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const source = parseVisitSource(body.source);

  await logCardAnalyticsEvent(card.id, event as "qr_view" | "exchange_form_view" | "reciprocal_pass_offer", {
    source,
  });

  return NextResponse.json({ ok: true });
}
