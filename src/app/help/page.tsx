import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Help",
  description: "FAQ, setup guides, billing help, and troubleshooting.",
  path: "/help",
});

const PAGES = [
  { slug: "faq", title: "FAQ" },
  { slug: "setup", title: "Setup guides" },
  { slug: "billing", title: "Billing help" },
  { slug: "troubleshooting", title: "Troubleshooting" },
  { slug: "nfc", title: "NFC setup" },
];

export default function HelpIndexPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Help</h1>
      <p className="mt-2 text-gray-600">
        FAQ, setup guides, billing, and troubleshooting.
      </p>
      <ul className="mt-8 space-y-3">
        {PAGES.map((p) => (
          <li key={p.slug}>
            <Link
              href={p.slug === "nfc" ? "/help/nfc" : `/help/${p.slug}`}
              className="block rounded-lg border border-gray-200 bg-white px-4 py-3 font-medium text-gray-900 hover:bg-gray-50"
            >
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
