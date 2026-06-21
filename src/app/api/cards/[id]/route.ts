import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { findOwnerCard } from "@/lib/firestore/cards";
import { getFirestoreAdmin } from "@/lib/firebaseAdmin";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const card = await findOwnerCard(user.uid, id);
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  return NextResponse.json(card);
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const card = await findOwnerCard(user.uid, id);
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const db = getFirestoreAdmin();
  await db.collection("users").doc(user.uid).collection("cards").doc(id).update({
    ...body,
    updatedAt: new Date(),
  });

  const updated = await findOwnerCard(user.uid, id);
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const card = await findOwnerCard(user.uid, id);
  if (!card) {
    return NextResponse.json({ ok: true });
  }

  const db = getFirestoreAdmin();
  await db.collection("users").doc(user.uid).collection("cards").doc(id).delete();
  if (card.slug) {
    await db.collection("cardsBySlug").doc(card.slug).delete().catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
