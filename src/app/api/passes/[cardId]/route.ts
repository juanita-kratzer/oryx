import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildPass } from "@/lib/passkit/buildPass";
import { getSupabaseAdmin, BUCKET_PASSES } from "@/lib/supabase";

type Params = { params: Promise<{ cardId: string }> };

/**
 * Generate (or return cached) Apple Wallet .pkpass for a card.
 * Card must be PAID. Returns the binary .pkpass file.
 */
export async function GET(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;

  const card = await prisma.card.findFirst({
    where: { id: cardId, userId: user.id, status: "PAID" },
    include: { template: true },
  });
  if (!card) {
    return NextResponse.json(
      { error: "Card not found or not yet purchased" },
      { status: 404 }
    );
  }

  const existingPass = await prisma.pass.findFirst({
    where: { cardId: card.id, platform: "APPLE" },
    orderBy: { createdAt: "desc" },
  });

  if (existingPass && existingPass.generatedAt && existingPass.generatedAt >= card.updatedAt) {
    return NextResponse.redirect(existingPass.fileUrl);
  }

  const buffer = await buildPass(card);

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
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="${card.slug}.pkpass"`,
      },
    });
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_PASSES)
    .getPublicUrl(fileName);

  const fileUrl = urlData.publicUrl;

  await prisma.pass.upsert({
    where: existingPass ? { id: existingPass.id } : { id: "new" },
    update: {
      fileUrl,
      version: (existingPass?.version ?? 0) + 1,
      generatedAt: new Date(),
    },
    create: {
      cardId: card.id,
      platform: "APPLE",
      fileUrl,
      version: 1,
      generatedAt: new Date(),
    },
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.apple.pkpass",
      "Content-Disposition": `attachment; filename="${card.slug}.pkpass"`,
    },
  });
}
