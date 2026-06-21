import type { Card } from "../types";
import { getAuth } from "./firebase";
import { buildCardLinkFields } from "./cardLinks";

function storageKey(): string {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error("Not authenticated");
  return `oryx-web-cards-${uid}`;
}

function loadCards(): Card[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey());
    return raw ? (JSON.parse(raw) as Card[]) : [];
  } catch {
    return [];
  }
}

function saveCards(cards: Card[]) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(storageKey(), JSON.stringify(cards));
  }
}

function makeId() {
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function fetchMyCards(): Promise<Card[]> {
  return loadCards().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function fetchCard(id: string): Promise<Card> {
  const card = loadCards().find((c) => c.id === id);
  if (!card) throw new Error("Card not found");
  return card;
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
  const now = new Date().toISOString();
  const id = makeId();
  const slug = data.slug || id;
  const links = buildCardLinkFields(slug);
  const card: Card = {
    id,
    slug,
    templateId: data.templateId,
    status: "PAID",
    purchaseId: "build_test",
    name: data.name || null,
    business: data.business || null,
    phone: data.phone || null,
    email: data.email || null,
    website: data.website || null,
    fieldValues: data.fieldValues || null,
    logoUrl: null,
    backgroundColor: data.backgroundColor || null,
    allowSmartExchange: data.allowSmartExchange ?? true,
    publicUrl: links.publicUrl,
    nfcUrl: links.nfcUrl,
    qrUrl: links.qrUrl,
    createdAt: now,
    updatedAt: now,
    template: {
      slug: data.templateId,
      name: data.templateId,
      category: "general",
    },
  };
  const cards = loadCards();
  cards.unshift(card);
  saveCards(cards);
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
  const cards = loadCards();
  const index = cards.findIndex((c) => c.id === id);
  if (index < 0) throw new Error("Card not found");
  const slug = data.slug || cards[index].slug || id;
  const links = buildCardLinkFields(slug);
  cards[index] = {
    ...cards[index],
    ...data,
    slug,
    publicUrl: links.publicUrl,
    nfcUrl: links.nfcUrl,
    qrUrl: links.qrUrl,
    updatedAt: new Date().toISOString(),
  };
  saveCards(cards);
  return cards[index];
}

export async function markCardPaid(
  cardId: string,
  transactionId: string
): Promise<Card> {
  const cards = loadCards();
  const index = cards.findIndex((c) => c.id === cardId);
  if (index < 0) throw new Error("Card not found");
  const slug = cards[index].slug;
  const links = buildCardLinkFields(slug);
  cards[index] = {
    ...cards[index],
    status: "PAID",
    purchaseId: transactionId,
    publicUrl: links.publicUrl,
    nfcUrl: links.nfcUrl,
    qrUrl: links.qrUrl,
    updatedAt: new Date().toISOString(),
  };
  saveCards(cards);
  return cards[index];
}

export function getPassDownloadUrl(cardId: string): string {
  return `https://oryx.app/api/passes/${cardId}`;
}

export async function deleteCard(id: string): Promise<void> {
  const cards = loadCards();
  const index = cards.findIndex((c) => c.id === id);
  if (index < 0) throw new Error("Card not found");
  cards.splice(index, 1);
  saveCards(cards);

  if (loadCards().some((c) => c.id === id)) {
    throw new Error("Could not delete card");
  }
}
