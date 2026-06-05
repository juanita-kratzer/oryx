import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateUniqueSlug } from "@/lib/slug";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cards = await prisma.card.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      template: { select: { slug: true, name: true, category: true, thumbnailUrl: true } },
      passes: { where: { platform: "APPLE" }, take: 1, orderBy: { createdAt: "desc" } },
    },
  });

  return NextResponse.json(cards);
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    templateId: string;
    name?: string;
    business?: string;
    phone?: string;
    email?: string;
    website?: string;
    fieldValues?: Record<string, string>;
    logoUrl?: string;
    backgroundColor?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.templateId) {
    return NextResponse.json({ error: "templateId is required" }, { status: 400 });
  }

  const template = await prisma.template.findUnique({
    where: { id: body.templateId, active: true },
  });
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const slug = await generateUniqueSlug();

  const card = await prisma.card.create({
    data: {
      userId: user.id,
      templateId: body.templateId,
      slug,
      status: "DRAFT",
      name: body.name ?? null,
      business: body.business ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      website: body.website ?? null,
      fieldValues: body.fieldValues ?? undefined,
      logoUrl: body.logoUrl ?? null,
      backgroundColor: body.backgroundColor ?? template.defaultBgColor,
    },
    include: {
      template: { select: { slug: true, name: true, category: true } },
    },
  });

  return NextResponse.json(card);
}
