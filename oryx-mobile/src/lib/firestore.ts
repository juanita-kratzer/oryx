import { getFirestore, getAuth, firestore } from "./firebase";
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import type { Card } from "../types";
import { buildCardLinkFields } from "./cardLinks";

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

function docToCard(doc: FirebaseFirestoreTypes.DocumentSnapshot): Card {
  const data = doc.data()!;
  const slug = data.slug || doc.id;
  const links = buildCardLinkFields(slug);
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
  const linkFields = slug ? buildCardLinkFields(slug) : {};
  const docRef = await cardsCollection().add({
    ...data,
    slug,
    ...linkFields,
    allowSmartExchange: data.allowSmartExchange ?? true,
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
      ...buildCardLinkFields(docRef.id),
      updatedAt: serverTimestamp(),
    });
  }
  const doc = await docRef.get();
  return docToCard(doc);
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
  const slug = data.slug || existing.data()?.slug || id;
  await ref.update({
    ...data,
    ...buildCardLinkFields(slug),
    slug,
    updatedAt: serverTimestamp(),
  });
  const doc = await ref.get();
  return docToCard(doc);
}

export async function markCardPaid(
  cardId: string,
  transactionId: string
): Promise<Card> {
  const ref = cardsCollection().doc(cardId);
  const existing = await ref.get();
  const slug = existing.data()?.slug || cardId;
  await ref.update({
    status: "PAID",
    purchaseId: transactionId,
    ...buildCardLinkFields(slug),
    updatedAt: serverTimestamp(),
  });
  const doc = await ref.get();
  return docToCard(doc);
}

export function getPassDownloadUrl(cardId: string): string {
  return `https://oryx.app/api/passes/${cardId}`;
}

export async function deleteCard(id: string): Promise<void> {
  const ref = cardsCollection().doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw new Error("Card not found");

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
