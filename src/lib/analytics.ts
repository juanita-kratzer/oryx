/**
 * Record daily aggregates for card analytics (taps, vCard downloads, pass downloads).
 */

import { prisma } from "@/lib/db";
import type { CardVisitSource } from "@/lib/cardVisitSource";

function today(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

const SOURCE_FIELD: Record<
  CardVisitSource,
  "nfcVisits" | "qrVisits" | "walletVisits" | "directVisits"
> = {
  nfc: "nfcVisits",
  qr: "qrVisits",
  wallet: "walletVisits",
  direct: "directVisits",
};

export async function recordLandingVisit(
  cardId: string,
  source: CardVisitSource = "direct"
): Promise<void> {
  const date = today();
  const sourceField = SOURCE_FIELD[source];

  await prisma.cardDailyStats.upsert({
    where: { cardId_date: { cardId, date } },
    create: {
      cardId,
      date,
      taps: 1,
      vcardDownloads: 0,
      passDownloads: 0,
      nfcVisits: source === "nfc" ? 1 : 0,
      qrVisits: source === "qr" ? 1 : 0,
      walletVisits: source === "wallet" ? 1 : 0,
      directVisits: source === "direct" ? 1 : 0,
    },
    update: {
      taps: { increment: 1 },
      [sourceField]: { increment: 1 },
    },
  });

  await prisma.systemEvent.create({
    data: {
      type: "landing_view",
      message: cardId,
      metadata: JSON.stringify({ source }),
    },
  });
}

/** @deprecated Use recordLandingVisit */
export async function recordLandingTap(cardId: string): Promise<void> {
  return recordLandingVisit(cardId, "direct");
}

export async function recordVcardDownload(cardId: string): Promise<void> {
  const date = today();
  await prisma.cardDailyStats.upsert({
    where: { cardId_date: { cardId, date } },
    create: { cardId, date, taps: 0, vcardDownloads: 1, passDownloads: 0 },
    update: { vcardDownloads: { increment: 1 } },
  });
}

export async function recordPassDownload(cardId: string): Promise<void> {
  const date = today();
  await prisma.cardDailyStats.upsert({
    where: { cardId_date: { cardId, date } },
    create: { cardId, date, taps: 0, vcardDownloads: 0, passDownloads: 1 },
    update: { passDownloads: { increment: 1 } },
  });
}

export async function logCardAnalyticsEvent(
  cardId: string,
  event:
    | "qr_view"
    | "exchange_form_view"
    | "exchange_submitted"
    | "reciprocal_pass_offer"
    | "reciprocal_pass_download"
    | "qr_barcode_card_created"
    | "qr_barcode_scanned",
  metadata?: Record<string, unknown>
): Promise<void> {
  await prisma.systemEvent.create({
    data: {
      type: event,
      message: cardId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}
