import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isPrivateCardTemplate } from "@/lib/cardTemplates";
import { getFirestoreAdmin } from "@/lib/firebaseAdmin";

/**
 * Maintains the public slug index in Firestore.
 * Card data lives in users/{uid}/cards/{cardId} (written by the mobile app).
 */
export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    externalId: string;
    slug?: string;
    templateId?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.externalId?.trim()) {
    return NextResponse.json({ error: "externalId is required" }, { status: 400 });
  }

  const slug = body.slug?.trim();
  if (!slug || isPrivateCardTemplate(body.templateId)) {
    return NextResponse.json({ ok: true, indexed: false });
  }

  const db = getFirestoreAdmin();
  await db.collection("cardsBySlug").doc(slug).set({
    ownerId: user.uid,
    cardId: body.externalId.trim(),
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, indexed: true, slug });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let externalId: string | undefined;
  let slug: string | undefined;
  try {
    const body = await request.json();
    externalId = body.externalId?.trim();
    slug = body.slug?.trim();
  } catch {
    const url = new URL(request.url);
    externalId = url.searchParams.get("externalId")?.trim();
    slug = url.searchParams.get("slug")?.trim();
  }

  const db = getFirestoreAdmin();
  if (slug) {
    const doc = await db.collection("cardsBySlug").doc(slug).get();
    const data = doc.data();
    if (doc.exists && data?.ownerId === user.uid && data?.cardId === externalId) {
      await doc.ref.delete();
    }
  }

  return NextResponse.json({ ok: true });
}
