import { verifyFirebaseIdToken } from "@/lib/firebaseAdmin";

export type AuthUser = {
  uid: string;
  email: string | null;
};

async function getBearerToken(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
  return token || null;
}

/** Authenticated Firebase user from Authorization bearer token. */
export async function getCurrentUser(request: Request): Promise<AuthUser | null> {
  const token = await getBearerToken(request);
  if (!token) return null;

  const firebaseUser = await verifyFirebaseIdToken(token);
  if (!firebaseUser) return null;

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? null,
  };
}
