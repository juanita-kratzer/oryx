import { NextResponse } from "next/server";
import { findPublicCardBySlug } from "@/lib/firestore/cards";
import { buildVcard } from "@/lib/vcard";
import { recordVcardDownload } from "@/lib/analytics";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const card = await findPublicCardBySlug(slug);

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  recordVcardDownload(card.id).catch(() => {});

  const vcard = buildVcard({
    name: card.name ?? null,
    business: card.business ?? null,
    phone: card.phone ?? null,
    email: card.email ?? null,
    website: card.website ?? null,
  });

  return new NextResponse(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${(card.name || "contact").replace(/[^a-zA-Z0-9-_]/g, "_")}.vcf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
