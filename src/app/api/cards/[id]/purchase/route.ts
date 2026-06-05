import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

/**
 * Mark a card as PAID after RevenueCat purchase verification.
 * The mobile app calls this after a successful IAP, passing the transaction ID.
 * Full server-side receipt validation with RevenueCat API can be added
 * once product identifiers are configured.
 */
export async function POST(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const card = await prisma.card.findFirst({
    where: { id, userId: user.id, status: "DRAFT" },
  });
  if (!card) {
    return NextResponse.json({ error: "Card not found or already paid" }, { status: 404 });
  }

  let body: { transactionId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.transactionId) {
    return NextResponse.json({ error: "transactionId is required" }, { status: 400 });
  }

  // TODO: Verify transaction with RevenueCat REST API
  // POST https://api.revenuecat.com/v1/receipts
  // This ensures the purchase is legitimate before marking PAID.
  // For now, trust the client (add verification once RC keys are set up).

  const updated = await prisma.card.update({
    where: { id },
    data: {
      status: "PAID",
      purchaseId: body.transactionId,
    },
    include: {
      template: true,
    },
  });

  return NextResponse.json(updated);
}
