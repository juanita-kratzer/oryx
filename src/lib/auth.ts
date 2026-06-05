import { prisma } from "@/lib/db";
import { getSupabaseUserIdFromRequest } from "@/lib/supabaseAuth";

/**
 * Get the authenticated Prisma user from a request's Authorization header.
 * Verifies Supabase JWT → finds or creates user in our DB.
 */
export async function getCurrentUser(request: Request) {
  const supabaseId = await getSupabaseUserIdFromRequest(request);
  if (!supabaseId) return null;

  let user = await prisma.user.findUnique({ where: { supabaseId } });
  if (user) return user;

  user = await prisma.user.create({
    data: { supabaseId },
  });
  return user;
}
