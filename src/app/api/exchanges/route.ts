import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { findOwnerCard } from "@/lib/firestore/cards";
import { listOwnerExchanges } from "@/lib/firestore/exchanges";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exchanges = await listOwnerExchanges(user.uid);
  const enriched = await Promise.all(
    exchanges.map(async (exchange) => {
      const card = await findOwnerCard(user.uid, exchange.cardId);
      return {
        ...exchange,
        card: {
          id: exchange.cardId,
          slug: exchange.cardSlug,
          name: card?.name ?? null,
          business: card?.business ?? null,
        },
      };
    })
  );

  return NextResponse.json(enriched);
}
