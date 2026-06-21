import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { findOwnerCard } from "@/lib/firestore/cards";
import { getFirestoreAdmin } from "@/lib/firebaseAdmin";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const card = await findOwnerCard(user.uid, id);
  if (!card || card.status !== "DRAFT") {
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

  const db = getFirestoreAdmin();
  await db.collection("users").doc(user.uid).collection("cards").doc(id).update({
    status: "PAID",
    purchaseId: body.transactionId,
    updatedAt: new Date(),
  });

  const updated = await findOwnerCard(user.uid, id);
  return NextResponse.json(updated);
}
