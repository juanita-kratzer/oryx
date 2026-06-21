"use client";

import { useEffect } from "react";
import { CardQrCode } from "@/components/cards/CardQrCode";
import { ExchangeShareForm } from "@/components/cards/ExchangeShareForm";
import type { CardVisitSource } from "@/lib/cardVisitSource";

type Props = {
  slug: string;
  qrUrl: string;
  visitSource: CardVisitSource;
  allowSmartExchange: boolean;
  logoUrl: string | null;
  name: string | null;
  business: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  backgroundColor: string | null;
  fieldValues: Record<string, string>;
  vcardHref: string;
};

export function CardLandingClient({
  slug,
  qrUrl,
  visitSource,
  allowSmartExchange,
  logoUrl,
  name,
  business,
  phone,
  email,
  website,
  backgroundColor,
  fieldValues,
  vcardHref,
}: Props) {
  useEffect(() => {
    fetch(`/api/public/cards/${slug}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "qr_view", source: visitSource }),
    }).catch(() => {});
  }, [slug, visitSource]);

  useEffect(() => {
    if (!allowSmartExchange) return;
    const el = document.getElementById("exchange-section");
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          fetch(`/api/public/cards/${slug}/analytics`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event: "exchange_form_view", source: visitSource }),
          }).catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [slug, visitSource, allowSmartExchange]);

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
        {logoUrl && (
          <div className="flex justify-center bg-gray-50 px-6 pt-6">
            <img
              src={logoUrl}
              alt={business || name || "Logo"}
              className="h-20 w-20 rounded-xl object-cover"
            />
          </div>
        )}
        <div className="px-6 py-5">
          {name && <h1 className="text-2xl font-bold text-gray-900">{name}</h1>}
          {business && <p className="mt-1 text-gray-600">{business}</p>}
          {fieldValues.jobTitle && (
            <p className="mt-1 text-sm font-medium text-gray-500">{fieldValues.jobTitle}</p>
          )}
        </div>

        <div className="space-y-1 border-t border-gray-100 px-6 py-4">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50"
            >
              <span className="text-sm font-medium">Phone</span>
              <span>{phone}</span>
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50"
            >
              <span className="text-sm font-medium">Email</span>
              <span>{email}</span>
            </a>
          )}
          {website && (
            <a
              href={website.startsWith("http") ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50"
            >
              <span className="text-sm font-medium">Website</span>
              <span>{website}</span>
            </a>
          )}
        </div>

        <div className="flex justify-center border-t border-gray-100 py-5">
          <CardQrCode url={qrUrl} size={140} />
        </div>
      </div>

      {(phone || email) && (
        <a
          href={vcardHref}
          download={`${name || "contact"}.vcf`}
          className="block w-full rounded-xl bg-gray-900 py-3 text-center font-medium text-white hover:bg-gray-800"
        >
          Save Contact
        </a>
      )}

      {logoUrl && (
        <a
          href={logoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-xl border border-gray-200 bg-white py-3 text-center text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          Save Card Image
        </a>
      )}

      {allowSmartExchange && (
        <div id="exchange-section">
          <ExchangeShareForm
            slug={slug}
            visitSource={visitSource}
            ownerName={name}
            ownerBusiness={business}
            vcardHref={vcardHref}
            canSaveContact={Boolean(phone || email)}
          />
        </div>
      )}
    </div>
  );
}
