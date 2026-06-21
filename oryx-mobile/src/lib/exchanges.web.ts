import { getAuth } from "./firebase";

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
  createdAt: unknown;
};

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

function scannedContactsKey(): string {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error("Not authenticated");
  return `oryx-web-scanned-contacts-${uid}`;
}

function loadScannedContacts(): ScannedContact[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(scannedContactsKey());
    return raw ? (JSON.parse(raw) as ScannedContact[]) : [];
  } catch {
    return [];
  }
}

function saveScannedContacts(contacts: ScannedContact[]) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(scannedContactsKey(), JSON.stringify(contacts));
  }
}

export async function publishBusinessCard(
  _cardId: string,
  _data: Omit<PublicCardData, "ownerUserId" | "createdAt">
): Promise<void> {}

export async function unpublishBusinessCard(_cardId: string): Promise<void> {}

export async function getPublicCard(
  _cardId: string
): Promise<PublicCardData | null> {
  return null;
}

export async function fetchExchangeRequests(): Promise<ExchangeRequest[]> {
  return [];
}

export async function fetchExchangeRequest(
  _requestId: string
): Promise<ExchangeRequest> {
  throw new Error("Exchange request not found (web preview)");
}

export async function acceptExchangeRequest(_requestId: string): Promise<void> {}

export async function rejectExchangeRequest(_requestId: string): Promise<void> {}

export async function saveScannedContact(data: {
  fullName: string;
  phone: string;
  email: string;
  jobTitle: string;
  company: string;
  website: string;
  sourceImageUri: string | null;
}): Promise<ScannedContact> {
  const contact: ScannedContact = {
    id: `contact-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
  };
  const contacts = loadScannedContacts();
  contacts.unshift(contact);
  saveScannedContacts(contacts);
  return contact;
}

export async function fetchScannedContacts(): Promise<ScannedContact[]> {
  return loadScannedContacts().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
