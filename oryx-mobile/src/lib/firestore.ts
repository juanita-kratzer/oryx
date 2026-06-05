import { getFirestore, getAuth, firestore } from "./firebase";
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import type { Card } from "../types";

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
  return {
    id: doc.id,
    slug: data.slug || doc.id,
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
  name?: string;
  business?: string;
  phone?: string;
  email?: string;
  website?: string;
  fieldValues?: Record<string, string>;
  backgroundColor?: string;
}): Promise<Card> {
  const docRef = await cardsCollection().add({
    ...data,
    status: "DRAFT",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    template: {
      slug: data.templateId,
      name: data.templateId,
      category: "general",
    },
  });
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
    logoUrl: string;
    backgroundColor: string;
  }>
): Promise<Card> {
  const ref = cardsCollection().doc(id);
  await ref.update({
    ...data,
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
  await ref.update({
    status: "PAID",
    purchaseId: transactionId,
    updatedAt: serverTimestamp(),
  });
  const doc = await ref.get();
  return docToCard(doc);
}

export function getPassDownloadUrl(cardId: string): string {
  return `https://oryx.app/api/passes/${cardId}`;
}
