import type { DocumentData, Timestamp } from "firebase-admin/firestore";
import { getFirestoreAdmin } from "@/lib/firebaseAdmin";
import { isPrivateCardTemplate } from "@/lib/cardTemplates";
import { getTemplateBySlug, resolveTemplateForMobile } from "@/lib/templates";
import type { CardRecord, CardWithTemplate } from "./types";

function toDate(value: Timestamp | Date | string | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  if (typeof (value as Timestamp).toDate === "function") {
    return (value as Timestamp).toDate();
  }
  return undefined;
}

function docToCard(ownerId: string, cardId: string, data: DocumentData): CardRecord {
  return {
    id: cardId,
    ownerId,
    slug: data.slug || cardId,
    templateId: data.templateId,
    status: data.status === "PAID" ? "PAID" : "DRAFT",
    name: data.name ?? null,
    business: data.business ?? null,
    phone: data.phone ?? null,
    email: data.email ?? null,
    website: data.website ?? null,
    fieldValues: data.fieldValues ?? null,
    logoUrl: data.logoUrl ?? null,
    backgroundColor: data.backgroundColor ?? null,
    purchaseId: data.purchaseId ?? null,
    allowSmartExchange: data.allowSmartExchange ?? true,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    passes: data.passes ?? undefined,
    template: data.template ?? undefined,
  };
}

function withTemplate(card: CardRecord): CardWithTemplate | null {
  const templateSlug =
    card.template?.slug ||
    resolveTemplateForMobile(card.templateId)?.slug ||
    card.templateId;
  const template = getTemplateBySlug(templateSlug) ?? resolveTemplateForMobile(card.templateId);
  if (!template) return null;
  return { ...card, template };
}

export async function findPublicCardBySlug(slug: string): Promise<CardWithTemplate | null> {
  const db = getFirestoreAdmin();
  const index = await db.collection("cardsBySlug").doc(slug).get();
  if (!index.exists) return null;

  const { ownerId, cardId } = index.data() as { ownerId: string; cardId: string };
  return findOwnerCard(ownerId, cardId, { publicOnly: true });
}

export async function findOwnerCard(
  ownerId: string,
  cardId: string,
  options?: { publicOnly?: boolean }
): Promise<CardWithTemplate | null> {
  const db = getFirestoreAdmin();
  const doc = await db.collection("users").doc(ownerId).collection("cards").doc(cardId).get();
  if (!doc.exists) return null;

  const card = docToCard(ownerId, doc.id, doc.data()!);
  if (options?.publicOnly && card.status !== "PAID") return null;
  if (isPrivateCardTemplate(card.templateId)) {
    if (options?.publicOnly) return null;
  }
  return withTemplate(card);
}

export async function listOwnerCards(ownerId: string): Promise<CardWithTemplate[]> {
  const db = getFirestoreAdmin();
  const snap = await db
    .collection("users")
    .doc(ownerId)
    .collection("cards")
    .orderBy("updatedAt", "desc")
    .get();

  const cards: CardWithTemplate[] = [];
  for (const doc of snap.docs) {
    const card = withTemplate(docToCard(ownerId, doc.id, doc.data()));
    if (card) cards.push(card);
  }
  return cards;
}

export async function slugIndexExists(slug: string): Promise<boolean> {
  const db = getFirestoreAdmin();
  const doc = await db.collection("cardsBySlug").doc(slug).get();
  return doc.exists;
}

export async function updateApplePassMeta(
  ownerId: string,
  cardId: string,
  meta: {
    fileUrl: string;
    version: number;
    formatVersion?: number;
    generatedAt: string;
  }
): Promise<void> {
  const db = getFirestoreAdmin();
  await db.collection("users").doc(ownerId).collection("cards").doc(cardId).update({
    "passes.apple": meta,
    updatedAt: new Date(),
  });
}

export async function getOwnerEmail(ownerId: string): Promise<string | null> {
  const db = getFirestoreAdmin();
  const userDoc = await db.collection("users").doc(ownerId).get();
  const email = userDoc.data()?.email;
  if (typeof email === "string" && email) return email;
  return null;
}
