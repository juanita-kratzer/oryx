import { getFirestore, getAuth, firestore } from "./firebase";
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import type { Card } from "../types";
import { buildCardLinkFields } from "./cardLinks";
import { isPrivateCardTemplate } from "../constants/cardTemplates";

function getUid(): string {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.uid;
}

function cardsCollection() {
  const uid = getUid();
  return getFirestore().collection("users").doc(uid).collection("cards");
}

function serverTimestamp() {
  return firestore.FieldValue.serverTimestamp();
}

async function syncPublicSlugIndex(
  slug: string | undefined,
  cardId: string,
  templateId: string | undefined,
  remove = false
) {
  if (!slug || isPrivateCardTemplate(templateId)) return;

  const uid = getUid();
  const indexRef = getFirestore().collection("cardsBySlug").doc(slug);

  if (remove) {
    const existing = await indexRef.get();
    if (existing.exists && existing.data()?.cardId === cardId) {
      await indexRef.delete();
    }
    return;
  }

  await indexRef.set({
    ownerId: uid,
    cardId,
    updatedAt: serverTimestamp(),
  });
}

function docToCard(doc: FirebaseFirestoreTypes.DocumentSnapshot): Card {
  const data = doc.data()!;
  const slug = data.slug || doc.id;
  const privateCard = isPrivateCardTemplate(data.templateId);
  const links = privateCard
    ? { publicUrl: null, nfcUrl: null, qrUrl: null }
    : buildCardLinkFields(slug);
  return {
    id: doc.id,
    slug,
    templateId: data.templateId,
    status: data.status || "DRAFT",
    name: data.name || null,
    business: data.business || null,
    phone: data.phone || null,
    email: data.email || null,
    website: data.website || null,
    fieldValues: data.fieldValues || null,
    logoUrl: data.logoUrl || null,
    backgroundColor: data.backgroundColor || null,
    purchaseId: data.purchaseId || null,
    allowSmartExchange: data.allowSmartExchange ?? true,
    publicUrl: data.publicUrl || links.publicUrl,
    nfcUrl: data.nfcUrl || links.nfcUrl,
    qrUrl: data.qrUrl || links.qrUrl,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    template: data.template || {
      slug: data.templateId,
      name: data.templateId,
      category: "general",
    },
    passes: data.passes || undefined,
  };
}

export async function fetchMyCards(): Promise<Card[]> {
  const snapshot = await cardsCollection()
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map(docToCard);
}

export async function fetchCard(id: string): Promise<Card> {
  const doc = await cardsCollection().doc(id).get();
  if (!doc.exists) throw new Error("Card not found");
  return docToCard(doc);
}

export async function createCard(data: {
  templateId: string;
  slug?: string;
  name?: string;
  business?: string;
  phone?: string;
  email?: string;
  website?: string;
  fieldValues?: Record<string, string>;
  backgroundColor?: string;
  allowSmartExchange?: boolean;
}): Promise<Card> {
  const slug = data.slug;
  const privateCard = isPrivateCardTemplate(data.templateId);
  const linkFields = privateCard || !slug ? {} : buildCardLinkFields(slug);
  const docRef = await cardsCollection().add({
    ...data,
    slug,
    ...linkFields,
    allowSmartExchange: privateCard
      ? false
      : data.allowSmartExchange ?? true,
    status: "PAID",
    purchaseId: "build_test",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    template: {
      slug: data.templateId,
      name: data.templateId,
      category: "general",
    },
  });
  if (!slug) {
    await docRef.update({
      slug: docRef.id,
      ...(privateCard ? {} : buildCardLinkFields(docRef.id)),
      updatedAt: serverTimestamp(),
    });
  }
  const doc = await docRef.get();
  const card = docToCard(doc);
  await syncPublicSlugIndex(card.slug, card.id, card.templateId);
  return card;
}

export async function updateCard(
  id: string,
  data: Partial<{
    name: string;
    business: string;
    phone: string;
    email: string;
    website: string;
    fieldValues: Record<string, string>;
    logoUrl: string | null;
    backgroundColor: string;
    allowSmartExchange: boolean;
  }>
): Promise<Card> {
  const ref = cardsCollection().doc(id);
  const existing = await ref.get();
  if (!existing.exists) throw new Error("Card not found");
  const existingData = existing.data()!;
  const slug = existingData.slug || id;
  const privateCard = isPrivateCardTemplate(existingData.templateId);
  await ref.update({
    ...data,
    ...(privateCard ? {} : buildCardLinkFields(slug)),
    slug,
    updatedAt: serverTimestamp(),
  });
  const doc = await ref.get();
  const card = docToCard(doc);
  await syncPublicSlugIndex(card.slug, card.id, card.templateId);
  return card;
}

export async function markCardPaid(
  cardId: string,
  transactionId: string
): Promise<Card> {
  const ref = cardsCollection().doc(cardId);
  const existing = await ref.get();
  const slug = existing.data()?.slug || cardId;
  const privateCard = isPrivateCardTemplate(existing.data()?.templateId);
  await ref.update({
    status: "PAID",
    purchaseId: transactionId,
    ...(privateCard ? {} : buildCardLinkFields(slug)),
    updatedAt: serverTimestamp(),
  });
  const doc = await ref.get();
  const card = docToCard(doc);
  await syncPublicSlugIndex(card.slug, card.id, card.templateId);
  return card;
}

export function getPassDownloadUrl(cardId: string): string {
  return `https://oryx.app/api/passes/${cardId}`;
}

export async function deleteCard(id: string): Promise<void> {
  const ref = cardsCollection().doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw new Error("Card not found");

  const data = doc.data()!;
  const slug = data.slug || id;
  await syncPublicSlugIndex(slug, id, data.templateId, true);
  await ref.delete();

  try {
    const publicRef = getFirestore().collection("publicCards").doc(id);
    const publicDoc = await publicRef.get();
    if (publicDoc.exists) {
      await publicRef.delete();
    }
  } catch {
    // public card doc is optional
  }
}
