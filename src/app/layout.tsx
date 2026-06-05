import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { defaultOpenGraph, defaultTwitter } from "@/lib/metadata";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Oryx";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: "Create digital cards for Apple Wallet. $5 per card.",
  openGraph: defaultOpenGraph(),
  twitter: defaultTwitter(),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
