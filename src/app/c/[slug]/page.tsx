import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { recordLandingTap } from "@/lib/analytics";
import { buildMetadata } from "@/lib/metadata";
import { buildVcard } from "@/lib/vcard";

type Props = { params: Promise<{ slug: string }> };

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

export default async function CardLandingPage({ params }: Props) {
  const { slug } = await params;
  const card = await getCard(slug);

  if (!card) {
    notFound();
  }

  recordLandingTap(card.id).catch(() => {});

  const fieldValues = (card.fieldValues ?? {}) as Record<string, string>;
  const vcardData = buildVcard({
    name: card.name,
    business: card.business,
    phone: card.phone,
    email: card.email,
    website: card.website,
  });
  const vcardHref = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcardData)}`;

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8"
      style={{ backgroundColor: card.backgroundColor || undefined }}
    >
      <div className="w-full max-w-md space-y-6">
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          {card.logoUrl && (
            <div className="flex justify-center bg-gray-50 px-6 pt-6">
              <Image
                src={card.logoUrl}
                alt={card.business || card.name || "Logo"}
                width={80}
                height={80}
                className="h-20 w-20 rounded-xl object-contain"
              />
            </div>
          )}
          <div className="px-6 py-5">
            {card.name && (
              <h1 className="text-2xl font-bold text-gray-900">{card.name}</h1>
            )}
            {card.business && (
              <p className="mt-1 text-gray-600">{card.business}</p>
            )}
            {fieldValues.title && (
              <p className="mt-1 text-sm font-medium text-gray-500">{fieldValues.title}</p>
            )}
            {fieldValues.membershipTier && (
              <span className="mt-2 inline-block rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">
                {fieldValues.membershipTier}
              </span>
            )}
            {fieldValues.balance && (
              <p className="mt-3 text-3xl font-bold text-gray-900">{fieldValues.balance}</p>
            )}
            {fieldValues.recipientName && (
              <p className="mt-1 text-gray-600">Gift for {fieldValues.recipientName}</p>
            )}
            {fieldValues.checkInDate && (
              <p className="mt-2 text-gray-700">Check-in: {fieldValues.checkInDate}</p>
            )}
            {fieldValues.confirmationCode && (
              <p className="mt-1 text-sm text-gray-500">Confirmation: {fieldValues.confirmationCode}</p>
            )}
          </div>

          <div className="space-y-1 border-t border-gray-100 px-6 py-4">
            {card.phone && (
              <a href={`tel:${card.phone}`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">
                <span className="text-lg">📞</span>
                <span>{card.phone}</span>
              </a>
            )}
            {card.email && (
              <a href={`mailto:${card.email}`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">
                <span className="text-lg">✉️</span>
                <span>{card.email}</span>
              </a>
            )}
            {card.website && (
              <a href={card.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">
                <span className="text-lg">🌐</span>
                <span>{card.website}</span>
              </a>
            )}
            {fieldValues.socialHandle && (
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700">
                <span className="text-lg">📱</span>
                <span>{fieldValues.socialHandle}</span>
              </div>
            )}
            {fieldValues.memberSince && (
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500">
                <span>Member since {fieldValues.memberSince}</span>
              </div>
            )}
            {fieldValues.expiryDate && (
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500">
                <span>Expires {fieldValues.expiryDate}</span>
              </div>
            )}
          </div>
        </div>

        {(card.phone || card.email) && (
          <a
            href={vcardHref}
            download={`${card.name || "contact"}.vcf`}
            className="block w-full rounded-xl bg-gray-900 py-3 text-center font-medium text-white hover:bg-gray-800"
          >
            Save Contact
          </a>
        )}
      </div>
    </main>
  );
}
