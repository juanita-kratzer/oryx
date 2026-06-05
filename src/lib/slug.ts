import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";

const SLUG_LENGTH = 12;

/**
 * Generate a unique URL-safe slug for a card.
 * Uses nanoid; retries if collision (unlikely).
 */
export async function generateUniqueSlug(): Promise<string> {
  let slug: string;
  let exists = true;
  let attempts = 0;
  const maxAttempts = 5;

  while (exists && attempts < maxAttempts) {
    slug = nanoid(SLUG_LENGTH);
    const existing = await prisma.card.findUnique({ where: { slug } });
    exists = !!existing;
    if (!exists) return slug!;
    attempts++;
  }

  // Fallback: nanoid with longer length to avoid collision
  return nanoid(SLUG_LENGTH + 4);
}
