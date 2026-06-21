import { NextResponse } from "next/server";
import type { CardStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateUniqueSlug } from "@/lib/slug";

/**
 * Upsert a mobile (Firestore) business card into Postgres for public landing,
 * PassKit, and Smart Exchange.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    externalId: string;
    templateId?: string;
    slug?: string;
    status?: "DRAFT" | "PAID";
    name?: string;
    business?: string;
    phone?: string;
    email?: string;
    website?: string;
    fieldValues?: Record<string, string>;
    logoUrl?: string;
    backgroundColor?: string;
    purchaseId?: string;
    allowSmartExchange?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.externalId?.trim()) {
    return NextResponse.json({ error: "externalId is required" }, { status: 400 });
  }

  const template =
    (await prisma.template.findFirst({
      where: { category: "BUSINESS", active: true },
      orderBy: { sortOrder: "asc" },
    })) ??
    (await prisma.template.findFirst({ where: { active: true }, orderBy: { sortOrder: "asc" } }));

  if (!template) {
    return NextResponse.json({ error: "No active template" }, { status: 500 });
  }

  const existing = await prisma.card.findUnique({
    where: { externalId: body.externalId.trim() },
  });

  const slug =
    body.slug?.trim() ||
    existing?.slug ||
    (await generateUniqueSlug());

  const status: CardStatus = body.status === "PAID" ? "PAID" : "DRAFT";

  const data = {
    userId: user.id,
    templateId: template.id,
    slug,
    externalId: body.externalId.trim(),
    status,
    name: body.name ?? null,
    business: body.business ?? null,
    phone: body.phone ?? null,
    email: body.email ?? null,
    website: body.website ?? null,
    fieldValues: body.fieldValues ?? undefined,
    logoUrl: body.logoUrl ?? null,
    backgroundColor: body.backgroundColor ?? template.defaultBgColor,
    purchaseId: body.purchaseId ?? null,
    allowSmartExchange: body.allowSmartExchange ?? existing?.allowSmartExchange ?? true,
  };

  const card = existing
    ? await prisma.card.update({
        where: { id: existing.id },
        data,
        include: { template: { select: { slug: true, name: true, category: true } } },
      })
    : await prisma.card.create({
        data,
        include: { template: { select: { slug: true, name: true, category: true } } },
      });

  return NextResponse.json(card);
}

/**
 * Remove a mobile-synced card from Postgres by Firestore externalId.
 */
export async function DELETE(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let externalId: string | undefined;
  try {
    const body = await request.json();
    externalId = body.externalId?.trim();
  } catch {
    externalId = new URL(request.url).searchParams.get("externalId")?.trim();
  }

  if (!externalId) {
    return NextResponse.json({ error: "externalId is required" }, { status: 400 });
  }

  const existing = await prisma.card.findFirst({
    where: { externalId, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ ok: true });
  }

  await prisma.card.delete({ where: { id: existing.id } });

  return NextResponse.json({ ok: true });
}
