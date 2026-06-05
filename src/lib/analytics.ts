/**
 * Record daily aggregates for card analytics (taps, vCard downloads, pass downloads).
 */

import { prisma } from "@/lib/db";

function today(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function recordLandingTap(cardId: string): Promise<void> {
  const date = today();
  await prisma.cardDailyStats.upsert({
    where: { cardId_date: { cardId, date } },
    create: { cardId, date, taps: 1, vcardDownloads: 0, passDownloads: 0 },
    update: { taps: { increment: 1 } },
  });
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
