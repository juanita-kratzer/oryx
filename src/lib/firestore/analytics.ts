import { getFirestoreAdmin } from "@/lib/firebaseAdmin";
import type { CardVisitSource } from "@/lib/cardVisitSource";

function todayKey(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function statsDocId(cardId: string, date: string) {
  return `${cardId}_${date}`;
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

async function incrementDailyStat(
  cardId: string,
  fields: Partial<{
    taps: number;
    vcardDownloads: number;
    passDownloads: number;
    nfcVisits: number;
    qrVisits: number;
    walletVisits: number;
    directVisits: number;
  }>
) {
  const db = getFirestoreAdmin();
  const date = todayKey();
  const ref = db.collection("cardDailyStats").doc(statsDocId(cardId, date));

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.data() ?? {
      cardId,
      date,
      taps: 0,
      vcardDownloads: 0,
      passDownloads: 0,
      nfcVisits: 0,
      qrVisits: 0,
      walletVisits: 0,
      directVisits: 0,
    };

    tx.set(ref, {
      cardId,
      date,
      taps: (current.taps ?? 0) + (fields.taps ?? 0),
      vcardDownloads: (current.vcardDownloads ?? 0) + (fields.vcardDownloads ?? 0),
      passDownloads: (current.passDownloads ?? 0) + (fields.passDownloads ?? 0),
      nfcVisits: (current.nfcVisits ?? 0) + (fields.nfcVisits ?? 0),
      qrVisits: (current.qrVisits ?? 0) + (fields.qrVisits ?? 0),
      walletVisits: (current.walletVisits ?? 0) + (fields.walletVisits ?? 0),
      directVisits: (current.directVisits ?? 0) + (fields.directVisits ?? 0),
    });
  });
}

async function logSystemEvent(
  type: string,
  cardId: string,
  metadata?: Record<string, unknown>
) {
  const db = getFirestoreAdmin();
  await db.collection("systemEvents").add({
    type,
    message: cardId,
    metadata: metadata ? JSON.stringify(metadata) : null,
    createdAt: new Date().toISOString(),
  });
}

export async function recordLandingVisit(
  cardId: string,
  source: CardVisitSource = "direct"
): Promise<void> {
  const sourceField = SOURCE_FIELD[source];
  await incrementDailyStat(cardId, {
    taps: 1,
    [sourceField]: 1,
  });
  await logSystemEvent("landing_view", cardId, { source });
}

export async function recordLandingTap(cardId: string): Promise<void> {
  return recordLandingVisit(cardId, "direct");
}

export async function recordVcardDownload(cardId: string): Promise<void> {
  await incrementDailyStat(cardId, { vcardDownloads: 1 });
}

export async function recordPassDownload(cardId: string): Promise<void> {
  await incrementDailyStat(cardId, { passDownloads: 1 });
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
  await logSystemEvent(event, cardId, metadata);
}
