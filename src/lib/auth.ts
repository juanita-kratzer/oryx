import { prisma } from "@/lib/db";
import { verifyFirebaseIdToken } from "@/lib/firebaseAdmin";
import { getSupabaseUserIdFromRequest } from "@/lib/supabaseAuth";

async function getBearerToken(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
  return token || null;
}

/**
 * Get the authenticated Prisma user from a request's Authorization header.
 * Supports Supabase JWT (web) and Firebase ID token (mobile).
 */
export async function getCurrentUser(request: Request) {
  const token = await getBearerToken(request);
  if (!token) return null;

  const supabaseId = await getSupabaseUserIdFromRequest(request);
  if (supabaseId) {
    let user = await prisma.user.findUnique({ where: { supabaseId } });
    if (!user) {
      user = await prisma.user.create({ data: { supabaseId } });
    }
    return user;
  }

  const firebaseUser = await verifyFirebaseIdToken(token);
  if (!firebaseUser) return null;

  let user = await prisma.user.findUnique({
    where: { firebaseUid: firebaseUser.uid },
  });
  if (user) return user;

  const syntheticSupabaseId = `firebase:${firebaseUser.uid}`;
  user = await prisma.user.findUnique({
    where: { supabaseId: syntheticSupabaseId },
  });
  if (user) {
    if (!user.firebaseUid) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { firebaseUid: firebaseUser.uid, email: firebaseUser.email ?? user.email },
      });
    }
    return user;
  }

  return prisma.user.create({
    data: {
      supabaseId: syntheticSupabaseId,
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email ?? null,
    },
  });
}
