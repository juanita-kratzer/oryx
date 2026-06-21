export type CardVisitSource = "nfc" | "qr" | "wallet" | "direct";

function getApiBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_APP_URL?.trim();
  if (!url) return "";
  return url.replace(/\/$/, "");
}

export function getAppOrigin(): string {
  const base = getApiBaseUrl();
  return base || "http://localhost:3000";
}

export function getCardPublicUrl(slug: string, source?: CardVisitSource): string {
  const base = `${getAppOrigin()}/c/${slug}`;
  if (!source || source === "direct") return base;
  return `${base}?src=${source}`;
}

export function getCardNfcUrl(slug: string): string {
  return getCardPublicUrl(slug, "nfc");
}

export function getCardQrPayload(slug: string): string {
  return getCardPublicUrl(slug, "qr");
}

/** Link fields stored on each Firestore card document when created or edited. */
export function buildCardLinkFields(slug: string) {
  return {
    publicUrl: getCardPublicUrl(slug),
    nfcUrl: getCardNfcUrl(slug),
    qrUrl: getCardQrPayload(slug),
  };
}

export function generateCardSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < 12; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}
