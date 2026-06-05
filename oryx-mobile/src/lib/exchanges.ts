import { getFirestore, getAuth, firestore } from "./firebase";

function getUid(): string {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.uid;
}

function serverTimestamp() {
  return firestore.FieldValue.serverTimestamp();
}

// --- Public Cards ---

export type PublicCardData = {
  ownerUserId: string;
  fullName: string;
  phone: string;
  email: string;
  jobTitle: string;
  company: string;
  website: string;
  dob?: string;
  cardDesign: {
    backgroundColor: string;
    logoUrl: string | null;
  };
  createdAt: any;
};

export async function publishBusinessCard(
  cardId: string,
  data: Omit<PublicCardData, "ownerUserId" | "createdAt">
): Promise<void> {
  const uid = getUid();
  await getFirestore().collection("publicCards").doc(cardId).set({
    ...data,
    ownerUserId: uid,
    createdAt: serverTimestamp(),
  });
}

export async function getPublicCard(
  cardId: string
): Promise<PublicCardData | null> {
  const doc = await getFirestore().collection("publicCards").doc(cardId).get();
  if (!doc.exists) return null;
  return doc.data() as PublicCardData;
}

// --- Exchange Requests ---

export type ExchangeRequest = {
  id: string;
  businessCardId: string;
  ownerUserId: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  recipientJobTitle: string;
  recipientCompany: string;
  recipientDob: string;
  status: "pending" | "accepted" | "rejected";
  source: "qr" | "nfc" | "link";
  createdAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
};

export async function fetchExchangeRequests(): Promise<ExchangeRequest[]> {
  const uid = getUid();
  const snapshot = await getFirestore()
    .collection("exchangeRequests")
    .where("ownerUserId", "==", uid)
    .where("status", "==", "pending")
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      businessCardId: d.businessCardId,
      ownerUserId: d.ownerUserId,
      recipientName: d.recipientName || "",
      recipientPhone: d.recipientPhone || "",
      recipientEmail: d.recipientEmail || "",
      recipientJobTitle: d.recipientJobTitle || "",
      recipientCompany: d.recipientCompany || "",
      recipientDob: d.recipientDob || "",
      status: d.status,
      source: d.source || "link",
      createdAt: d.createdAt?.toDate?.()?.toISOString() || "",
      acceptedAt: d.acceptedAt?.toDate?.()?.toISOString() || null,
      rejectedAt: d.rejectedAt?.toDate?.()?.toISOString() || null,
    };
  });
}

export async function fetchExchangeRequest(
  requestId: string
): Promise<ExchangeRequest> {
  const doc = await getFirestore()
    .collection("exchangeRequests")
    .doc(requestId)
    .get();
  if (!doc.exists) throw new Error("Exchange request not found");
  const d = doc.data()!;
  return {
    id: doc.id,
    businessCardId: d.businessCardId,
    ownerUserId: d.ownerUserId,
    recipientName: d.recipientName || "",
    recipientPhone: d.recipientPhone || "",
    recipientEmail: d.recipientEmail || "",
    recipientJobTitle: d.recipientJobTitle || "",
    recipientCompany: d.recipientCompany || "",
    recipientDob: d.recipientDob || "",
    status: d.status,
    source: d.source || "link",
    createdAt: d.createdAt?.toDate?.()?.toISOString() || "",
    acceptedAt: d.acceptedAt?.toDate?.()?.toISOString() || null,
    rejectedAt: d.rejectedAt?.toDate?.()?.toISOString() || null,
  };
}

export async function acceptExchangeRequest(requestId: string): Promise<void> {
  await getFirestore().collection("exchangeRequests").doc(requestId).update({
    status: "accepted",
    acceptedAt: serverTimestamp(),
  });
}

export async function rejectExchangeRequest(requestId: string): Promise<void> {
  await getFirestore().collection("exchangeRequests").doc(requestId).update({
    status: "rejected",
    rejectedAt: serverTimestamp(),
  });
}

// --- Scanned Contacts ---

export type ScannedContact = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  jobTitle: string;
  company: string;
  website: string;
  sourceImageUri: string | null;
  createdAt: string;
};

export async function saveScannedContact(data: {
  fullName: string;
  phone: string;
  email: string;
  jobTitle: string;
  company: string;
  website: string;
  sourceImageUri: string | null;
}): Promise<ScannedContact> {
  const uid = getUid();
  const ref = await getFirestore()
    .collection("users")
    .doc(uid)
    .collection("scannedContacts")
    .add({
      ...data,
      createdAt: serverTimestamp(),
    });
  const doc = await ref.get();
  const d = doc.data()!;
  return {
    id: doc.id,
    fullName: d.fullName || "",
    phone: d.phone || "",
    email: d.email || "",
    jobTitle: d.jobTitle || "",
    company: d.company || "",
    website: d.website || "",
    sourceImageUri: d.sourceImageUri || null,
    createdAt: d.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

export async function fetchScannedContacts(): Promise<ScannedContact[]> {
  const uid = getUid();
  const snapshot = await getFirestore()
    .collection("users")
    .doc(uid)
    .collection("scannedContacts")
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      fullName: d.fullName || "",
      phone: d.phone || "",
      email: d.email || "",
      jobTitle: d.jobTitle || "",
      company: d.company || "",
      website: d.website || "",
      sourceImageUri: d.sourceImageUri || null,
      createdAt: d.createdAt?.toDate?.()?.toISOString() || "",
    };
  });
}
