import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isQrBarcodeCardTemplate } from "@/lib/cardTemplates";
import { deliverApplePass } from "@/lib/passkit/deliverApplePass";

type Params = { params: Promise<{ slug: string }> };

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function checkRateLimit(slug: string, ip: string): boolean {
  const key = `${slug}:${ip}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

/**
 * Public Apple Wallet pass download for a PAID card (reciprocal exchange / landing).
 */
export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  const ip = getClientIp(request);

  if (!checkRateLimit(slug, ip)) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  const card = await prisma.card.findFirst({
    where: { slug, status: "PAID" },
    include: { template: true },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found." }, { status: 404 });
  }

  if (isQrBarcodeCardTemplate(card.template.slug)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return deliverApplePass(card, { analyticsContext: "reciprocal" });
}
