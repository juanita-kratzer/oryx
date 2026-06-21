import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findPublicCardBySlug } from "@/lib/firestore/cards";
import { recordLandingVisit } from "@/lib/analytics";
import { buildMetadata } from "@/lib/metadata";
import { buildVcard } from "@/lib/vcard";
import { getCardPublicUrl } from "@/lib/cardLinks";
import { parseVisitSource } from "@/lib/cardVisitSource";
import { CardLandingClient } from "@/components/cards/CardLandingClient";
import { isQrBarcodeCardTemplate } from "@/lib/cardTemplates";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ src?: string }>;
};

export const revalidate = 300;

async function getCard(slug: string) {
  return findPublicCardBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = await getCard(slug);
  if (!card) return {};
  const title = [card.name, card.business].filter(Boolean).join(" · ") || "Digital Card";
  return buildMetadata({
    title,
    description: card.business
      ? `${card.name || "Card"} — ${card.business}`
      : `${card.name || "Digital Card"}`,
    path: `/c/${slug}`,
    imageUrl: card.logoUrl,
    imageAlt: card.name || "Card",
  });
}

export default async function CardLandingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { src } = await searchParams;
  const visitSource = parseVisitSource(src);
  const card = await getCard(slug);

  if (!card) {
    notFound();
  }

  if (isQrBarcodeCardTemplate(card.template.slug)) {
    notFound();
  }

  recordLandingVisit(card.id, visitSource).catch(() => {});

  const fieldValues = (card.fieldValues ?? {}) as Record<string, string>;
  const vcardData = buildVcard({
    name: card.name ?? null,
    business: card.business ?? null,
    phone: card.phone ?? null,
    email: card.email ?? null,
    website: card.website ?? null,
  });
  const vcardHref = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcardData)}`;
  const qrUrl = getCardPublicUrl(card.slug, "qr");

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8"
      style={{ backgroundColor: card.backgroundColor || undefined }}
    >
      <CardLandingClient
        slug={slug}
        qrUrl={qrUrl}
        visitSource={visitSource}
        allowSmartExchange={card.allowSmartExchange ?? true}
        logoUrl={card.logoUrl ?? null}
        name={card.name ?? null}
        business={card.business ?? null}
        phone={card.phone ?? null}
        email={card.email ?? null}
        website={card.website ?? null}
        backgroundColor={card.backgroundColor ?? null}
        fieldValues={fieldValues}
        vcardHref={vcardHref}
      />
    </main>
  );
}
