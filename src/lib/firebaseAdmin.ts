/**
 * Firebase Admin — auth verification, Firestore, and Storage for the Next.js API.
 * Set FIREBASE_SERVICE_ACCOUNT_JSON to a JSON service account string.
 */

import type { App } from "firebase-admin/app";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

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
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        serviceAccount.storageBucket ||
        `${serviceAccount.project_id}.appspot.com`,
    });
    return adminApp;
  } catch (e) {
    console.warn("firebaseAdmin: failed to initialize", e);
    return null;
  }
}

export function getFirestoreAdmin() {
  if (!initAdmin()) {
    throw new Error("Firebase Admin is not configured (FIREBASE_SERVICE_ACCOUNT_JSON).");
  }
  return getFirestore();
}

export function getStorageBucket() {
  if (!initAdmin()) {
    throw new Error("Firebase Admin is not configured (FIREBASE_SERVICE_ACCOUNT_JSON).");
  }
  return getStorage().bucket();
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
