import { NextResponse } from "next/server";
import { findPublicCardBySlug } from "@/lib/firestore/cards";

type Params = { params: Promise<{ slug: string }> };

/**
 * Public card data — used by the landing page.
 * No auth required. Only returns PAID cards.
 */
export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const card = await findPublicCardBySlug(slug);

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      id: card.id,
      slug: card.slug,
      name: card.name,
      business: card.business,
      phone: card.phone,
      email: card.email,
      website: card.website,
      fieldValues: card.fieldValues,
      logoUrl: card.logoUrl,
      backgroundColor: card.backgroundColor,
      allowSmartExchange: card.allowSmartExchange,
      template: {
        slug: card.template.slug,
        name: card.template.name,
        category: card.template.category,
        passLayout: card.template.passLayout,
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
