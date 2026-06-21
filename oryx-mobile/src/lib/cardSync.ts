import { getAuth } from "./firebase";
import type { Card } from "../types";

function getApiBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_APP_URL?.trim();
  if (!url) return "";
  return url.replace(/\/$/, "");
}

export async function syncCardToApi(card: Card): Promise<void> {
  const base = getApiBaseUrl();
  if (!base) return;

  const user = getAuth().currentUser;
  if (!user) return;

  const token = await user.getIdToken();
  const fieldValues = card.fieldValues ?? undefined;

  await fetch(`${base}/api/cards/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      externalId: card.id,
      slug: card.slug,
      templateId: card.templateId,
      status: card.status,
      name: card.name ?? undefined,
      business: card.business ?? undefined,
      phone: card.phone ?? undefined,
      email: card.email ?? undefined,
      website: card.website ?? undefined,
      fieldValues,
      logoUrl: card.logoUrl ?? undefined,
      backgroundColor: card.backgroundColor ?? undefined,
      purchaseId: card.purchaseId ?? undefined,
      allowSmartExchange: card.allowSmartExchange,
    }),
  });
}

export async function deleteCardFromApi(externalId: string): Promise<void> {
  const base = getApiBaseUrl();
  if (!base) return;

  const user = getAuth().currentUser;
  if (!user) return;

  const token = await user.getIdToken();

  const res = await fetch(`${base}/api/cards/sync`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ externalId }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.warn(`Card API delete failed (${res.status}): ${detail}`);
  }
}
