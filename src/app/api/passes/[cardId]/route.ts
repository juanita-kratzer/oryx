import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { findOwnerCard } from "@/lib/firestore/cards";
import { deliverApplePass } from "@/lib/passkit/deliverApplePass";

type Params = { params: Promise<{ cardId: string }> };

export async function GET(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;
  const card = await findOwnerCard(user.uid, cardId);

  if (!card || card.status !== "PAID") {
    return NextResponse.json(
      { error: "Card not found or not yet purchased" },
      { status: 404 }
    );
  }

  return deliverApplePass(card, { analyticsContext: "owner" });
}
