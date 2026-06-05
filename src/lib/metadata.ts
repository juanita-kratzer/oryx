import type { Metadata } from "next";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Oryx - Apple Wallet Cards";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000";
const BASE_URL = /^https?:\/\//i.test(APP_URL) ? APP_URL : `https://${APP_URL}`;

export function defaultOpenGraph(): Metadata["openGraph"] {
  return {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: APP_NAME,
    title: APP_NAME,
    description: "Create digital business cards and review cards for Apple Wallet and NFC.",
    images: [{ url: `${BASE_URL}/api/og?title=${encodeURIComponent(APP_NAME)}`, width: 1200, height: 630, alt: APP_NAME }],
  };
}

export function defaultTwitter(): Metadata["twitter"] {
  return {
    card: "summary_large_image",
    title: APP_NAME,
    description: "Create digital business cards and review cards for Apple Wallet and NFC.",
  };
}

export function buildMetadata(params: {
  title: string;
  description: string;
  path?: string;
  imageUrl?: string | null;
  imageAlt?: string;
}): Metadata {
  const url = params.path ? `${BASE_URL}${params.path}` : BASE_URL;
  const image = params.imageUrl || `${BASE_URL}/api/og?title=${encodeURIComponent(params.title)}`;
  return {
    title: params.title,
    description: params.description,
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: APP_NAME,
      title: params.title,
      description: params.description,
      images: [{ url: image, width: 1200, height: 630, alt: params.imageAlt ?? params.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: params.title,
      description: params.description,
      images: [image],
    },
  };
}
