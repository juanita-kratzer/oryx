import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

/**
 * Public card data — used by the NFC landing page.
 * No auth required. Only returns PAID cards.
 */
export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;

  const card = await prisma.card.findFirst({
    where: { slug, status: "PAID" },
    select: {
      id: true,
      slug: true,
      name: true,
      business: true,
      phone: true,
      email: true,
      website: true,
      fieldValues: true,
      logoUrl: true,
      backgroundColor: true,
      template: {
        select: {
          slug: true,
          name: true,
          category: true,
          passLayout: true,
        },
      },
    },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  return NextResponse.json(card, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
