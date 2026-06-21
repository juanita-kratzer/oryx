import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { recordLandingVisit } from "@/lib/analytics";
import { buildMetadata } from "@/lib/metadata";
import { buildVcard } from "@/lib/vcard";
import { getCardPublicUrl } from "@/lib/cardLinks";
import { parseVisitSource } from "@/lib/cardVisitSource";
import { CardLandingClient } from "@/components/cards/CardLandingClient";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ src?: string }>;
};

export const revalidate = 300;

async function getCard(slug: string) {
  return prisma.card.findFirst({
    where: { slug, status: "PAID" },
    include: {
      template: { select: { name: true, category: true } },
    },
  });
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

  recordLandingVisit(card.id, visitSource).catch(() => {});

  const fieldValues = (card.fieldValues ?? {}) as Record<string, string>;
  const vcardData = buildVcard({
    name: card.name,
    business: card.business,
    phone: card.phone,
    email: card.email,
    website: card.website,
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
        allowSmartExchange={card.allowSmartExchange}
        logoUrl={card.logoUrl}
        name={card.name}
        business={card.business}
        phone={card.phone}
        email={card.email}
        website={card.website}
        backgroundColor={card.backgroundColor}
        fieldValues={fieldValues}
        vcardHref={vcardHref}
      />
    </main>
  );
}
