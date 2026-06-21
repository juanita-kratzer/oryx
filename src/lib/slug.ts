import { nanoid } from "nanoid";
import { slugIndexExists } from "@/lib/firestore/cards";

const SLUG_LENGTH = 12;

/** Generate a unique URL-safe slug for a card. */
export async function generateUniqueSlug(): Promise<string> {
  for (let attempts = 0; attempts < 5; attempts++) {
    const slug = nanoid(SLUG_LENGTH);
    const exists = await slugIndexExists(slug);
    if (!exists) return slug;
  }
  return nanoid(SLUG_LENGTH + 4);
}
