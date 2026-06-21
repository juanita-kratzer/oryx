import type { CardVisitSource } from "@/lib/cardVisitSource";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.VERCEL_URL ||
  "http://localhost:3000";

export function getAppOrigin(): string {
  if (/^https?:\/\//i.test(APP_URL)) {
    return APP_URL.replace(/\/$/, "");
  }
  return `https://${APP_URL.replace(/\/$/, "")}`;
}

export function getCardPublicUrl(slug: string, source?: CardVisitSource): string {
  const base = `${getAppOrigin()}/c/${slug}`;
  if (!source || source === "direct") return base;
  return `${base}?src=${source}`;
}

export function getCardNfcUrl(card: { slug: string }): string {
  return getCardPublicUrl(card.slug, "nfc");
}

export function getCardQrPayload(card: { slug: string }): string {
  return getCardPublicUrl(card.slug, "qr");
}

export function getCardWalletUrl(card: { slug: string }): string {
  return getCardPublicUrl(card.slug, "wallet");
}

export function isBusinessCardTemplate(
  template: { category?: string; slug?: string } | null | undefined
): boolean {
  if (!template) return false;
  return template.category === "BUSINESS";
}
