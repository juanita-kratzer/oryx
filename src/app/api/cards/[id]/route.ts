import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const card = await prisma.card.findFirst({
    where: { id, userId: user.id },
    include: {
      template: true,
      passes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  return NextResponse.json(card);
}

export async function PUT(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.card.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  let body: {
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

  const card = await prisma.card.update({
    where: { id },
    data: {
      name: body.name !== undefined ? (body.name || null) : undefined,
      business: body.business !== undefined ? (body.business || null) : undefined,
      phone: body.phone !== undefined ? (body.phone || null) : undefined,
      email: body.email !== undefined ? (body.email || null) : undefined,
      website: body.website !== undefined ? (body.website || null) : undefined,
      fieldValues: body.fieldValues !== undefined ? body.fieldValues : undefined,
      logoUrl: body.logoUrl !== undefined ? (body.logoUrl || null) : undefined,
      backgroundColor: body.backgroundColor !== undefined ? (body.backgroundColor || null) : undefined,
    },
    include: {
      template: { select: { slug: true, name: true, category: true } },
    },
  });

  return NextResponse.json(card);
}

export async function DELETE(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.card.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  await prisma.card.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
