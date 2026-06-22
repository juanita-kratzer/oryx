#!/usr/bin/env node
/**
 * Sync selected vars from .env.local → Vercel (production + preview).
 * Usage: node scripts/sync-vercel-env.mjs
 * Optional: node scripts/sync-vercel-env.mjs path/to/firebase-adminsdk.json
 */

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const ENV_FILE = resolve(ROOT, ".env.local");

const ALLOW = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_APP_NAME",
  "FIREBASE_SERVICE_ACCOUNT_JSON",
  "FIREBASE_STORAGE_BUCKET",
  "PASSKIT_CERT_BASE64",
  "PASSKIT_KEY_BASE64",
  "PASSKIT_KEY_PASSWORD",
  "PASSKIT_WWDR_BASE64",
  "PASSKIT_PASS_TYPE_ID",
  "PASSKIT_TEAM_ID",
  "PASSKIT_ORG_NAME",
  "SENDGRID_API_KEY",
  "SENDGRID_SENDER_EMAIL",
  "SENDGRID_REPLY_TO",
  "SENDGRID_SENDER_NAME",
];

function parseEnvFile(path) {
  const text = readFileSync(path, "utf8");
  const out = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function addToVercel(name, value, target) {
  execFileSync(
    "npx",
    ["vercel", "env", "add", name, target, "--force", "--yes", "--sensitive"],
    {
      cwd: ROOT,
      input: value,
      stdio: ["pipe", "pipe", "pipe"],
      encoding: "utf8",
    }
  );
}

const firebaseJsonPath = process.argv[2];
const env = existsSync(ENV_FILE) ? parseEnvFile(ENV_FILE) : {};

if (firebaseJsonPath) {
  const abs = resolve(firebaseJsonPath);
  if (!existsSync(abs)) {
    console.error(`Firebase key not found: ${abs}`);
    process.exit(1);
  }
  const json = JSON.parse(readFileSync(abs, "utf8"));
  env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify(json);
  env.FIREBASE_STORAGE_BUCKET =
    json.storage_bucket ||
    json.storageBucket ||
    `${json.project_id}.firebasestorage.app`;
  console.log(`Loaded Firebase service account from ${abs}`);
}

if (!existsSync(ENV_FILE) && !firebaseJsonPath) {
  console.error("Missing .env.local and no Firebase JSON path provided.");
  process.exit(1);
}

let synced = 0;
let skipped = 0;

for (const key of ALLOW) {
  const value = env[key];
  if (!value) {
    console.log(`SKIP ${key} (empty)`);
    skipped++;
    continue;
  }
  for (const target of ["production", "preview"]) {
    try {
      addToVercel(key, value, target);
      console.log(`OK   ${key} → ${target}`);
      synced++;
    } catch (e) {
      console.error(`FAIL ${key} → ${target}:`, e.stderr || e.message);
    }
  }
}

console.log(`\nDone. ${synced} vars synced, ${skipped} skipped.`);

if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  console.log(`
⚠️  FIREBASE_SERVICE_ACCOUNT_JSON is still missing.
   Firebase Console → oryx-wallet-cards-2db19 → Project settings → Service accounts
   → Generate new private key → then run:
   node scripts/sync-vercel-env.mjs ~/Downloads/oryx-wallet-cards-2db19-firebase-adminsdk-xxxxx.json
`);
}
