/**
 * Optional Firebase Admin for verifying mobile ID tokens.
 * Set FIREBASE_SERVICE_ACCOUNT_JSON to a JSON service account string.
 */

import type { App } from "firebase-admin/app";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let adminApp: App | null = null;

function initAdmin(): App | null {
  if (adminApp) return adminApp;

  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0];
    return adminApp;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  try {
    const serviceAccount = JSON.parse(raw) as Record<string, string>;
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
    return adminApp;
  } catch (e) {
    console.warn("firebaseAdmin: failed to initialize", e);
    return null;
  }
}

export async function verifyFirebaseIdToken(
  token: string
): Promise<{ uid: string; email?: string } | null> {
  const app = initAdmin();
  if (!app) return null;

  try {
    const decoded = await getAuth(app).verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email ?? undefined,
    };
  } catch {
    return null;
  }
}
