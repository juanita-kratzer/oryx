import { randomUUID } from "crypto";
import { getFirestoreAdmin } from "@/lib/firebaseAdmin";
import type { BusinessCardExchangeRecord } from "./types";

export async function createBusinessCardExchange(data: {
  ownerId: string;
  cardId: string;
  cardSlug: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  notes?: string | null;
  source: string;
}): Promise<BusinessCardExchangeRecord> {
  const db = getFirestoreAdmin();
  const id = randomUUID();
  const createdAt = new Date().toISOString();

  const record: BusinessCardExchangeRecord = {
    id,
    ownerId: data.ownerId,
    cardId: data.cardId,
    cardSlug: data.cardSlug,
    name: data.name,
    phone: data.phone ?? null,
    email: data.email ?? null,
    company: data.company ?? null,
    jobTitle: data.jobTitle ?? null,
    notes: data.notes ?? null,
    consentGiven: true,
    source: data.source,
    createdAt,
  };

  await db.collection("businessCardExchanges").doc(id).set(record);
  return record;
}

export async function listOwnerExchanges(
  ownerId: string
): Promise<BusinessCardExchangeRecord[]> {
  const db = getFirestoreAdmin();
  const snap = await db
    .collection("businessCardExchanges")
    .where("ownerId", "==", ownerId)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data() as BusinessCardExchangeRecord;
    return {
      ...data,
      id: doc.id,
      card: data.card ?? {
        id: data.cardId,
        slug: data.cardSlug,
        name: null,
        business: null,
      },
    };
  });
}
