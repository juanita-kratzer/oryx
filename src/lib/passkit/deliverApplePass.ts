import type { Card, Template } from "@prisma/client";
import { prisma } from "@/lib/db";
import { buildPass } from "@/lib/passkit/buildPass";
import { recordPassDownload, logCardAnalyticsEvent } from "@/lib/analytics";
import { getSupabaseAdmin, BUCKET_PASSES } from "@/lib/supabase";

export type CardWithTemplate = Card & { template: Template };

function passResponseHeaders(slug: string): HeadersInit {
  return {
    "Content-Type": "application/vnd.apple.pkpass",
    "Content-Disposition": `attachment; filename="${slug}.pkpass"`,
  };
}

/**
 * Build or return a cached Apple Wallet pass for a PAID card.
 */
export async function deliverApplePass(
  card: CardWithTemplate,
  options?: { analyticsContext?: "owner" | "reciprocal" }
): Promise<Response> {
  const existingPass = await prisma.pass.findFirst({
    where: { cardId: card.id, platform: "APPLE" },
    orderBy: { createdAt: "desc" },
  });

  if (
    existingPass?.fileUrl &&
    existingPass.generatedAt &&
    existingPass.generatedAt >= card.updatedAt
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

  const supabase = getSupabaseAdmin();
  const fileName = `${card.id}/pass-v${(existingPass?.version ?? 0) + 1}.pkpass`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_PASSES)
    .upload(fileName, new Uint8Array(buffer), {
      contentType: "application/vnd.apple.pkpass",
      upsert: true,
    });

  if (uploadError) {
    console.error("Pass upload error:", uploadError);
    return new Response(new Uint8Array(buffer), {
      headers: passResponseHeaders(card.slug),
    });
  }

  const { data: urlData } = supabase.storage.from(BUCKET_PASSES).getPublicUrl(fileName);
  const fileUrl = urlData.publicUrl;

  if (existingPass) {
    await prisma.pass.update({
      where: { id: existingPass.id },
      data: {
        fileUrl,
        version: existingPass.version + 1,
        generatedAt: new Date(),
      },
    });
  } else {
    await prisma.pass.create({
      data: {
        cardId: card.id,
        platform: "APPLE",
        fileUrl,
        version: 1,
        generatedAt: new Date(),
      },
    });
  }

  return new Response(new Uint8Array(buffer), {
    headers: passResponseHeaders(card.slug),
  });
}
