import type { CardWithTemplate } from "@/lib/firestore/types";
import { getStorageBucket } from "@/lib/firebaseAdmin";
import { buildPass } from "@/lib/passkit/buildPass";
import {
  recordPassDownload,
  logCardAnalyticsEvent,
} from "@/lib/analytics";
import { updateApplePassMeta } from "@/lib/firestore/cards";

function passResponseHeaders(slug: string): HeadersInit {
  return {
    "Content-Type": "application/vnd.apple.pkpass",
    "Content-Disposition": `attachment; filename="${slug}.pkpass"`,
  };
}

/** Increment when pass bundle requirements change so cached passes are rebuilt. */
const PASS_FORMAT_VERSION = 2;

/**
 * Build or return a cached Apple Wallet pass for a PAID card.
 */
export async function deliverApplePass(
  card: CardWithTemplate,
  options?: { analyticsContext?: "owner" | "reciprocal" }
): Promise<Response> {
  const existingPass = card.passes?.apple;
  const cardUpdatedAt = card.updatedAt ?? new Date(0);

  if (
    existingPass?.fileUrl &&
    existingPass.generatedAt &&
    (existingPass.formatVersion ?? 1) >= PASS_FORMAT_VERSION &&
    new Date(existingPass.generatedAt) >= cardUpdatedAt
  ) {
    return Response.redirect(existingPass.fileUrl, 302);
  }

  const buffer = await buildPass(card);
  await recordPassDownload(card.id);

  if (options?.analyticsContext === "reciprocal") {
    logCardAnalyticsEvent(card.id, "reciprocal_pass_download", {
      context: "reciprocal",
    }).catch(() => {});
  }

  const version = (existingPass?.version ?? 0) + 1;
  const fileName = `passes/${card.ownerId}/${card.id}/pass-v${version}.pkpass`;

  try {
    const bucket = getStorageBucket();
    const file = bucket.file(fileName);
    await file.save(Buffer.from(buffer), {
      contentType: "application/vnd.apple.pkpass",
      metadata: { cacheControl: "public, max-age=3600" },
    });
    await file.makePublic();
    const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    await updateApplePassMeta(card.ownerId, card.id, {
      fileUrl,
      version,
      formatVersion: PASS_FORMAT_VERSION,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Pass upload error:", err);
  }

  return new Response(new Uint8Array(buffer), {
    headers: passResponseHeaders(card.slug),
  });
}
