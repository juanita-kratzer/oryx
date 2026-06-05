import { notFound } from "next/navigation";
import Link from "next/link";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { simpleMarkdownToHtml } from "@/lib/markdown";
import { buildMetadata } from "@/lib/metadata";

const CONTENT_DIR = path.join(process.cwd(), "content", "help");

const PAGES: Record<string, string> = {
  faq: "FAQ",
  setup: "Setup guides",
  billing: "Billing help",
  troubleshooting: "Troubleshooting",
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const title = PAGES[slug];
  if (!title) return {};
  return buildMetadata({
    title,
    description: `Help: ${title}.`,
    path: `/help/${slug}`,
  });
}

export default async function HelpSlugPage({ params }: Props) {
  const { slug } = await params;

  if (!PAGES[slug]) notFound();

  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!existsSync(filePath)) notFound();

  const raw = readFileSync(filePath, "utf-8");
  const html = simpleMarkdownToHtml(raw);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/help" className="text-gray-600 hover:text-gray-900">← Help</Link>
      <article
        className="help-content mt-8 space-y-4 text-gray-700 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-medium [&_p]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <p className="mt-8">
        <Link href="/help" className="text-indigo-600 hover:underline">Back to Help</Link>
      </p>
    </main>
  );
}
