import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logCardAnalyticsEvent } from "@/lib/analytics";
import { sendExchangeNotificationEmail } from "@/lib/email/exchangeNotification";
import { isValidEmail, sanitizeOptionalText, sanitizeText } from "@/lib/sanitize";
import { parseExchangeSource } from "@/lib/cardVisitSource";

type Params = { params: Promise<{ slug: string }> };

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
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

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;

  const ip = getClientIp(request);
  if (!checkRateLimit(slug, ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Try again later." },
      { status: 429 }
    );
  }

  let body: {
    name?: string;
    phone?: string;
    email?: string;
    company?: string;
    jobTitle?: string;
    notes?: string;
    consentGiven?: boolean;
    source?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.consentGiven) {
    return NextResponse.json(
      { error: "Consent is required to share your details." },
      { status: 400 }
    );
  }

  const name = sanitizeText(body.name ?? "", 120);
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const phone = sanitizeOptionalText(body.phone, 40);
  const email = sanitizeOptionalText(body.email, 120);
  const company = sanitizeOptionalText(body.company, 120);
  const jobTitle = sanitizeOptionalText(body.jobTitle, 120);
  const notes = sanitizeOptionalText(body.notes, 1000);

  if (!phone && !email) {
    return NextResponse.json(
      { error: "Provide at least a phone number or email." },
      { status: 400 }
    );
  }

  if (email && !isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const card = await prisma.card.findFirst({
    where: { slug, status: "PAID" },
    include: {
      user: { select: { id: true, email: true } },
      template: { select: { name: true, category: true } },
    },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found." }, { status: 404 });
  }

  if (!card.allowSmartExchange) {
    return NextResponse.json(
      { error: "Smart Exchange is not enabled for this card." },
      { status: 403 }
    );
  }

  const source = parseExchangeSource(body.source);

  const exchange = await prisma.businessCardExchange.create({
    data: {
      cardId: card.id,
      ownerId: card.userId,
      name,
      phone,
      email,
      company,
      jobTitle,
      notes,
      consentGiven: true,
      source,
    },
  });

  logCardAnalyticsEvent(card.id, "exchange_submitted", {
    exchangeId: exchange.id,
    source,
  }).catch(() => {});

  const ownerEmail = card.user.email;
  if (ownerEmail) {
    sendExchangeNotificationEmail({
      to: ownerEmail,
      cardName: card.business || card.name || "Business Card",
      exchange: { name, phone, email, company, jobTitle, notes },
    }).catch(() => {});
  }

  return NextResponse.json({
    ok: true,
    id: exchange.id,
    appleWalletPassUrl: `/api/public/cards/${slug}/pass`,
  });
}
