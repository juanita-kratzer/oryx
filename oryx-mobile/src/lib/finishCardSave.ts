import type { Card } from "../types";
import { updateCard } from "./firestore";
import { uploadLogo } from "./storage";
import { syncCardToApi } from "./cardSync";
import { publishBusinessCard } from "./exchanges";
import {
  getCardNfcUrl,
  getCardPublicUrl,
  getCardQrPayload,
} from "./cardLinks";
import { notifyCardsChanged } from "./cardsEvents";

const LOGO_UPLOAD_MS = 20_000;
const API_SYNC_MS = 12_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timed out")), ms)
    ),
  ]);
}

export type BusinessCardPublishFields = {
  yourName: string;
  mobile: string;
  email: string;
  jobTitle: string;
  businessName: string;
  website: string;
  backgroundColor: string;
};

/** Logo upload, legacy publicCards mirror, and API sync — never block navigation. */
export async function finishCardSave(
  card: Card,
  options: {
    logoUri: string | null;
    businessCard?: BusinessCardPublishFields;
  }
): Promise<void> {
  let updated = card;

  const isLocalLogo =
    options.logoUri &&
    !options.logoUri.startsWith("http://") &&
    !options.logoUri.startsWith("https://");

  try {
    if (isLocalLogo) {
      const uploaded = await withTimeout(
        uploadLogo(card.id, options.logoUri!),
        LOGO_UPLOAD_MS
      );
      updated = await updateCard(card.id, { logoUrl: uploaded.url });
    } else if (!options.logoUri) {
      updated = await updateCard(card.id, { logoUrl: null });
    }
  } catch (e) {
    console.warn("Logo upload skipped:", e);
  }

  if (options.businessCard) {
    const p = options.businessCard;
    try {
      await publishBusinessCard(updated.id, {
        fullName: p.yourName.trim(),
        phone: p.mobile.trim(),
        email: p.email.trim(),
        jobTitle: p.jobTitle.trim(),
        company: p.businessName.trim(),
        website: p.website.trim(),
        slug: updated.slug,
        publicUrl: updated.publicUrl ?? getCardPublicUrl(updated.slug),
        nfcUrl: updated.nfcUrl ?? getCardNfcUrl(updated.slug),
        qrUrl: updated.qrUrl ?? getCardQrPayload(updated.slug),
        cardDesign: {
          backgroundColor: p.backgroundColor,
          logoUrl: updated.logoUrl,
        },
      });
    } catch (e) {
      console.warn("publishBusinessCard failed:", e);
    }
  }

  try {
    await withTimeout(syncCardToApi(updated), API_SYNC_MS);
  } catch (e) {
    console.warn("syncCardToApi failed:", e);
  }

  notifyCardsChanged();
}

export function finishCardSaveInBackground(
  card: Card,
  options: Parameters<typeof finishCardSave>[1]
): void {
  void finishCardSave(card, options).catch((e) => {
    console.warn("finishCardSave failed:", e);
  });
}
