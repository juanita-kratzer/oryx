import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildVcard } from "@/lib/vcard";
import { recordVcardDownload } from "@/lib/analytics";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;

  const card = await prisma.card.findFirst({
    where: { slug, status: "PAID" },
    select: { id: true, name: true, business: true, phone: true, email: true, website: true },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  recordVcardDownload(card.id).catch(() => {});

  const vcard = buildVcard({
    name: card.name,
    business: card.business,
    phone: card.phone,
    email: card.email,
    website: card.website,
  });

  return new NextResponse(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${(card.name || "contact").replace(/[^a-zA-Z0-9-_]/g, "_")}.vcf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
