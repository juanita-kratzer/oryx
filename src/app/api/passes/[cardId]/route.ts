import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deliverApplePass } from "@/lib/passkit/deliverApplePass";

type Params = { params: Promise<{ cardId: string }> };

/**
 * Generate (or return cached) Apple Wallet .pkpass for a card owned by the user.
 */
export async function GET(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;

  const card = await prisma.card.findFirst({
    where: {
      userId: user.id,
      status: "PAID",
      OR: [{ id: cardId }, { externalId: cardId }],
    },
    include: { template: true },
  });

  if (!card) {
    return NextResponse.json(
      { error: "Card not found or not yet purchased" },
      { status: 404 }
    );
  }

  return deliverApplePass(card, { analyticsContext: "owner" });
}
